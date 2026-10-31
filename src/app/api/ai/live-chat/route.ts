import { AdkMultiAgentOrchestrator } from "@/lib/adk/multi-agent";
import { ChatMessageInputSchema } from "@/lib/ai/schemas";

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const parsed = ChatMessageInputSchema.safeParse(json);

    if (!parsed.success) {
      return new Response(JSON.stringify({ error: "Invalid input" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const { eventId, message } = parsed.data;

    // Create a ReadableStream for live SSE streaming
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          await AdkMultiAgentOrchestrator.executeTurn({
            eventId,
            userMessage: message,
            onEvent: (event) => {
              const data = `data: ${JSON.stringify(event)}\n\n`;
              controller.enqueue(encoder.encode(data));
            },
          });
          controller.close();
        } catch (err) {
          const errorPayload = `data: ${JSON.stringify({ type: "error", message: String(err) })}\n\n`;
          controller.enqueue(encoder.encode(errorPayload));
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
