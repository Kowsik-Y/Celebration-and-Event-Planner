import { chatWithAssistant } from "@/lib/ai/client";
import { ChatMessageInputSchema } from "@/lib/ai/schemas";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const parsed = ChatMessageInputSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid message input", details: parsed.error.format() },
        { status: 400 },
      );
    }

    const { eventId, message } = parsed.data;
    const { reply, referencesUsed } = await chatWithAssistant(eventId, message);

    return NextResponse.json({
      success: true,
      reply,
      referencesUsed,
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "Chat service error", message: String(error) },
      { status: 500 },
    );
  }
}
