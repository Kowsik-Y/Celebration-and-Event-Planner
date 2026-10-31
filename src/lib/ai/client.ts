import { GoogleGenerativeAI } from "@google/generative-ai";
import type { z } from "zod";
import { EventContextManager } from "./context-manager";
import { generateHeuristicBlueprint } from "./heuristic-generator";
import { getPersonaForVertical } from "./personas";
import { formatKnowledgeForPrompt, retrieveRelevantKnowledge } from "./rag/retriever";
import {
  type CreateEventInput,
  type GeneratedEventBlueprint,
  GeneratedEventBlueprintSchema,
  type VowSpeechGenerationSchema,
} from "./schemas";

function getGeminiClient(): GoogleGenerativeAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.trim() === "") {
    return null;
  }
  return new GoogleGenerativeAI(apiKey);
}

/**
 * Generates a full structured event blueprint using Gemini with RAG domain knowledge,
 * falling back reliably to the heuristic engine if no API key is provided.
 */
export async function generateEventPlan(
  input: CreateEventInput,
): Promise<{ blueprint: GeneratedEventBlueprint; source: "gemini" | "heuristic" }> {
  const gemini = getGeminiClient();
  const persona = getPersonaForVertical(input.vertical);

  if (!gemini) {
    // Graceful offline fallback
    const blueprint = generateHeuristicBlueprint(input);
    return { blueprint, source: "heuristic" };
  }

  try {
    const model = gemini.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
      },
    });

    const ragDocs = retrieveRelevantKnowledge(
      `${input.theme} ${input.location} budget timeline`,
      input.vertical,
      3,
    );
    const ragContext = formatKnowledgeForPrompt(ragDocs);

    const prompt = `
${persona.systemPrompt}

You must create a comprehensive, mathematically sound, professional event blueprint for the following celebration:
- Event Title: "${input.title}"
- Vertical: ${input.vertical.toUpperCase()}
- Target Total Budget: $${input.targetBudget.toLocaleString()}
- Total Guest Count: ${input.guestCount}
- Date: ${input.eventDate}
- Location: ${input.location}
- Theme / Aesthetic: ${input.theme}
- Additional Notes: ${input.notes || "None"}

${ragContext}

CRITICAL RULES:
1. Ensure the sum of budgetBreakdown estimatedCost plus contingencyReserve equals approximately $${input.targetBudget}.
2. Ensure runOfShowTimeline has realistic non-overlapping times in HH:MM format with adequate transition buffers.
3. Vendor checklist must have realistic deadlineOffsetDays (e.g. 300 days before event for venue).
4. Return ONLY valid JSON adhering strictly to this schema:
{
  "title": string,
  "themeSummary": string,
  "curatedColorPalette": string[],
  "targetBudget": number,
  "guestCount": number,
  "contingencyReserve": number,
  "budgetBreakdown": [
    { "category": string, "name": string, "estimatedCost": number, "notes": string }
  ],
  "runOfShowTimeline": [
    { "timeStart": "HH:MM", "timeEnd": "HH:MM", "phase": string, "title": string, "description": string, "responsibleParty": string, "orderIndex": number }
  ],
  "vendorChecklist": [
    { "category": string, "name": string, "price": number, "deadlineOffsetDays": number, "notes": string }
  ],
  "personalizedIdeas": [
    { "category": string, "title": string, "description": string, "aestheticTags": string[], "aiRationale": string }
  ],
  "logisticsAdvice": string
}
`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const rawParsed = JSON.parse(text);
    const validated = GeneratedEventBlueprintSchema.parse(rawParsed);

    return { blueprint: validated, source: "gemini" };
  } catch (error) {
    console.warn(
      "Gemini generation failed or timed out. Falling back to heuristic blueprint.",
      error,
    );
    const blueprint = generateHeuristicBlueprint(input);
    return { blueprint, source: "heuristic" };
  }
}

/**
 * Conversational assistant with context management and RAG domain memory
 */
export async function chatWithAssistant(
  eventId: string,
  userMessage: string,
): Promise<{ reply: string; referencesUsed: string[] }> {
  const context = EventContextManager.getEventContext(eventId);
  const vertical = context?.event.vertical || "wedding";
  const persona = getPersonaForVertical(vertical);

  const ragDocs = retrieveRelevantKnowledge(userMessage, vertical, 2);
  const referencesUsed = ragDocs.map((r) => r.title);

  // Record user message in memory
  EventContextManager.recordMemory({
    eventId,
    role: "user",
    message: userMessage,
  });

  const gemini = getGeminiClient();

  if (!gemini) {
    // Intelligent contextual fallback reply
    const reply = generateContextualAssistantReply(userMessage, context, persona.name);
    EventContextManager.recordMemory({
      eventId,
      role: "assistant",
      message: reply,
    });
    return { reply, referencesUsed };
  }

  try {
    const { systemPrompt, userPrompt } = EventContextManager.buildPromptWithContext(
      eventId,
      userMessage,
      persona.systemPrompt,
    );

    const model = gemini.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(`${systemPrompt}\n\nUSER INQUIRY: ${userPrompt}`);
    const reply = result.response.text();

    EventContextManager.recordMemory({
      eventId,
      role: "assistant",
      message: reply,
    });

    return { reply, referencesUsed };
  } catch (error) {
    console.error("Gemini chat error, using contextual fallback:", error);
    const reply = generateContextualAssistantReply(userMessage, context, persona.name);
    return { reply, referencesUsed };
  }
}

/**
 * Intelligent deterministic fallback chat reply when offline
 */
function generateContextualAssistantReply(
  message: string,
  context: ReturnType<typeof EventContextManager.getEventContext>,
  personaName: string,
): string {
  const lower = message.toLowerCase();

  if (!context) {
    return `${personaName} here. I am reviewing your event data now. Please let me know how I can optimize your budget, timeline, or vendors!`;
  }

  const { event, budgetSummary, guestSummary, timelineSummary } = context;

  if (lower.includes("budget") || lower.includes("cost") || lower.includes("expensive")) {
    return `Hello! ${personaName} here reviewing your budget for "${event.title}". You currently have a target budget of $${event.target_budget.toLocaleString()}, with $${budgetSummary.committed.toLocaleString()} committed and $${budgetSummary.remaining.toLocaleString()} remaining in reserve. My standard recommendation is to protect at least an 8% contingency fund ($${Math.round(event.target_budget * 0.08).toLocaleString()}) for final month adjustments.`;
  }

  if (lower.includes("guest") || lower.includes("headcount") || lower.includes("rsvp")) {
    return `Looking at your guest roster: You planned for ${event.guest_count} guests. We currently have ${guestSummary.attending} confirmed attending, ${guestSummary.pending} pending, and ${guestSummary.declined} declined. ${guestSummary.dietaryAlerts.length > 0 ? `Important dietary flags: ${guestSummary.dietaryAlerts.join(", ")}.` : "No dietary alerts registered yet."}`;
  }

  if (
    lower.includes("timeline") ||
    lower.includes("schedule") ||
    lower.includes("run of show") ||
    lower.includes("hour")
  ) {
    return `Regarding your schedule: You have ${timelineSummary.totalItems} milestones programmed with ${timelineSummary.completedItems} marked complete. Remember our core rule: always maintain a minimum 15-minute buffer between major phase transitions (e.g. from Ceremony to Cocktail Hour) to ensure guests move comfortably without rush.`;
  }

  return `I have integrated your note into "${event.title}"'s event memory. I'm actively monitoring your ${event.guest_count} guest count, $${event.target_budget.toLocaleString()} target budget, and milestone vendor timelines. Let me know if you would like me to draft contracts, recalculate catering, or refine day-of run-of-show timing!`;
}

/**
 * Personalized vow and speech writing generator
 */
export async function generatePersonalizedVowsOrSpeech(
  eventId: string,
  input: z.infer<typeof VowSpeechGenerationSchema>,
): Promise<string> {
  const context = EventContextManager.getEventContext(eventId);
  const gemini = getGeminiClient();

  if (!gemini) {
    return `
[Vow Draft — ${input.tone.toUpperCase()} TONE]

"When I look at you, I see my partner, my greatest adventure, and my home.
From the very moments we shared (${input.keyMemories}), you showed me what it truly means to be loved without hesitation.
${input.insideJokesOrAnecdotes ? `Even through ${input.insideJokesOrAnecdotes}, you remained my favorite person in every room.` : ""}
Today, surrounded by everyone we cherish, I promise:
${input.promisesOrWishes}
I choose you today, tomorrow, and in every season that follows."
    `.trim();
  }

  try {
    const model = gemini.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `
You are Aria, luxury wedding concierge and speechwriter.
Draft a moving, beautifully structured set of wedding vows or wedding speech.
Speaker Role: ${input.speakerRole}
Tone: ${input.tone}
Event Context: ${context ? `Wedding in ${context.event.location}, Theme: ${context.event.theme}` : "Wedding celebration"}
Key Memories to Include: ${input.keyMemories}
Key Promises / Wishes: ${input.promisesOrWishes}
Anecdotes / Humor: ${input.insideJokesOrAnecdotes || "None"}

Guidelines:
- Keep the length between 250 and 380 words (approximately 2.5 minutes spoken aloud).
- Balance genuine emotion with natural rhythm and clear phrasing.
- Avoid overused clichés; ground it in the specific memories provided.
`;

    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error("Vow generation error, using fallback template:", error);
    return `
"Today, standing here with you, I look back on ${input.keyMemories} and realize how lucky I am.
I promise you: ${input.promisesOrWishes}.
${input.insideJokesOrAnecdotes ? `And yes, ${input.insideJokesOrAnecdotes}.` : ""}
With all that I am, I give you my whole heart."
    `.trim();
  }
}
