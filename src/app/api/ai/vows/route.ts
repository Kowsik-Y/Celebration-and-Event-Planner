import { generatePersonalizedVowsOrSpeech } from "@/lib/ai/client";
import { VowSpeechGenerationSchema } from "@/lib/ai/schemas";
import { NextResponse } from "next/server";
import { z } from "zod";

const RequestSchema = z.object({
  eventId: z.string().min(1),
  form: VowSpeechGenerationSchema,
});

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const parsed = RequestSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid vow input parameters", details: parsed.error.format() },
        { status: 400 },
      );
    }

    const { eventId, form } = parsed.data;
    const generatedDraft = await generatePersonalizedVowsOrSpeech(eventId, form);

    return NextResponse.json({
      success: true,
      draft: generatedDraft,
    });
  } catch (error) {
    console.error("Vow generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate vows", message: String(error) },
      { status: 500 },
    );
  }
}
