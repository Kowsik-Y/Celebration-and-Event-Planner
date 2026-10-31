import { EventRepository } from "@/db/repository";
import { EventContextManager } from "@/lib/ai/context-manager";
import { retrieveRelevantKnowledge } from "@/lib/ai/rag/retriever";
import { z } from "genkit";
import { ai } from "./genkit-init";

/**
 * ADK Tool: Genkit RAG Domain Knowledge Retriever
 */
export const lookupRagKnowledgeTool = ai.defineTool(
  {
    name: "lookup_rag_knowledge",
    description:
      "Retrieves verified event planning industry knowledge, benchmarks, permit laws, and budget ratios.",
    inputSchema: z.object({
      query: z
        .string()
        .describe(
          "Search query or topic keyword, e.g. 'catering budget ratios' or 'sunset photo timing'",
        ),
      vertical: z.enum(["wedding", "birthday", "community"]).describe("Event vertical"),
      limit: z
        .number()
        .int()
        .optional()
        .default(3)
        .describe("Number of benchmark documents to retrieve"),
    }),
    outputSchema: z.object({
      documents: z.array(
        z.object({
          title: z.string(),
          topic: z.string(),
          content: z.string(),
          score: z.number(),
        }),
      ),
    }),
  },
  async ({ query, vertical, limit }) => {
    const docs = retrieveRelevantKnowledge(query, vertical, limit);
    return { documents: docs };
  },
);

/**
 * ADK Tool: Live Event Context & Memory Graph Inspector
 */
export const getEventContextTool = ai.defineTool(
  {
    name: "get_event_context",
    description:
      "Fetches the live financial balance, guest RSVPs, dietary restrictions, and timeline status of an active celebration.",
    inputSchema: z.object({
      eventId: z.string().describe("The unique ID of the event"),
    }),
    outputSchema: z.object({
      title: z.string(),
      vertical: z.string(),
      targetBudget: z.number(),
      committedBudget: z.number(),
      remainingReserve: z.number(),
      guestCount: z.number(),
      attendingGuests: z.number(),
      dietaryAlerts: z.array(z.string()),
      timelineMilestonesCount: z.number(),
      nextMilestone: z.string().optional(),
    }),
  },
  async ({ eventId }) => {
    const context = EventContextManager.getEventContext(eventId);
    if (!context) {
      throw new Error(`Event not found with ID ${eventId}`);
    }

    return {
      title: context.event.title,
      vertical: context.event.vertical,
      targetBudget: context.budgetSummary.target,
      committedBudget: context.budgetSummary.committed,
      remainingReserve: context.budgetSummary.remaining,
      guestCount: context.guestSummary.totalInvited,
      attendingGuests: context.guestSummary.attending,
      dietaryAlerts: context.guestSummary.dietaryAlerts,
      timelineMilestonesCount: context.timelineSummary.totalItems,
      nextMilestone: context.timelineSummary.nextMilestone,
    };
  },
);

/**
 * ADK Tool: Budget Stress-Testing & Per-Head Margin Calculator
 */
export const calculateBudgetShiftTool = ai.defineTool(
  {
    name: "calculate_budget_shift",
    description:
      "Calculates the financial and per-head impact of guest count changes or unexpected vendor quotes.",
    inputSchema: z.object({
      eventId: z.string().describe("The unique ID of the event"),
      deltaGuestCount: z
        .number()
        .int()
        .optional()
        .default(0)
        .describe("Increase or decrease in guest count"),
      additionalCost: z
        .number()
        .optional()
        .default(0)
        .describe("New or increased expense amount in dollars"),
    }),
    outputSchema: z.object({
      currentCommitted: z.number(),
      projectedTotal: z.number(),
      projectedRemaining: z.number(),
      contingencyRequired: z.number(),
      isContingencySafe: z.boolean(),
      perGuestCateringEstimate: z.number(),
      recommendations: z.array(z.string()),
    }),
  },
  async ({ eventId, deltaGuestCount = 0, additionalCost = 0 }) => {
    const event = EventRepository.getEventById(eventId);
    if (!event) throw new Error("Event not found");

    const budgetItems = EventRepository.getBudgetItems(eventId);
    const currentCommitted = budgetItems.reduce(
      (acc, item) => acc + (item.actual_cost || item.estimated_cost),
      0,
    );

    // Estimate per-guest catering cost
    const cateringItem = budgetItems.find(
      (b) => b.category.includes("Catering") || b.name.includes("Tasting"),
    );
    const estPerGuest =
      cateringItem && event.guest_count > 0 ? cateringItem.estimated_cost / event.guest_count : 140;

    const delta = deltaGuestCount ?? 0;
    const addCost = additionalCost ?? 0;
    const guestImpactCost = delta * estPerGuest;
    const projectedTotal = Math.round(currentCommitted + addCost + guestImpactCost);
    const projectedRemaining = Math.max(0, event.target_budget - projectedTotal);
    const minContingency = Math.round(event.target_budget * 0.08);
    const isContingencySafe = projectedRemaining >= minContingency;

    const recommendations: string[] = [];
    if (!isContingencySafe) {
      recommendations.push(
        `Alert: Projected reserve ($${projectedRemaining.toLocaleString()}) dips below the mandatory 8% contingency safety margin ($${minContingency.toLocaleString()}).`,
      );
      recommendations.push(
        "Recommend trimming non-essential scenography or reallocating late-night dessert enhancements to preserve emergency funds.",
      );
    } else {
      recommendations.push(
        `Budget healthy: Remaining buffer ($${projectedRemaining.toLocaleString()}) protects the contingency cushion.`,
      );
    }

    return {
      currentCommitted,
      projectedTotal,
      projectedRemaining,
      contingencyRequired: minContingency,
      isContingencySafe,
      perGuestCateringEstimate: Math.round(estPerGuest),
      recommendations,
    };
  },
);

/**
 * ADK Tool: Day-of Timeline Conflict & Buffer Violation Detector
 */
export const detectTimelineCollisionsTool = ai.defineTool(
  {
    name: "detect_timeline_collisions",
    description:
      "Analyzes the event day-of run-of-show schedule for overlapping time blocks, missing 15-minute transit buffers, or curfew violations.",
    inputSchema: z.object({
      eventId: z.string().describe("The unique ID of the event"),
    }),
    outputSchema: z.object({
      totalMilestones: z.number(),
      hasCollisions: z.boolean(),
      collisionDetails: z.array(z.string()),
      bufferWarnings: z.array(z.string()),
      recommendations: z.array(z.string()),
    }),
  },
  async ({ eventId }) => {
    const timelineItems = EventRepository.getTimelineItems(eventId);
    const collisionDetails: string[] = [];
    const bufferWarnings: string[] = [];
    const recommendations: string[] = [];

    function timeToMinutes(t: string): number {
      const [h, m] = t.split(":").map(Number);
      return h * 60 + m;
    }

    for (let i = 0; i < timelineItems.length - 1; i++) {
      const current = timelineItems[i];
      const next = timelineItems[i + 1];

      const currentEnd = timeToMinutes(current.time_end);
      const nextStart = timeToMinutes(next.time_start);

      // Check collision
      if (currentEnd > nextStart) {
        collisionDetails.push(
          `Schedule overlap detected: "${current.title}" ends at ${current.time_end}, but "${next.title}" starts earlier at ${next.time_start}.`,
        );
      } else if (nextStart - currentEnd < 15 && current.phase !== next.phase) {
        bufferWarnings.push(
          `Tight transit window: Only ${nextStart - currentEnd} minutes between "${current.title}" (${current.phase}) and "${next.title}" (${next.phase}). Standard is 15-20 min.`,
        );
      }
    }

    // Check outdoor curfew violation (23:00)
    const lateItems = timelineItems.filter(
      (t) => timeToMinutes(t.time_end) > 23 * 60 && t.phase !== "afterparty",
    );
    if (lateItems.length > 0) {
      recommendations.push(
        "Outdoor amplified sound curfew alert: Ensure music shifts indoors by 23:00 to avoid municipal code penalties.",
      );
    }

    return {
      totalMilestones: timelineItems.length,
      hasCollisions: collisionDetails.length > 0,
      collisionDetails,
      bufferWarnings,
      recommendations,
    };
  },
);
