import { WebSocket, WebSocketServer } from "ws";
import { AdkMultiAgentOrchestrator } from "../lib/adk/multi-agent";

const WS_PORT = Number.parseInt(process.env.WS_PORT || "3001", 10);

export function startWebSocketServer() {
  const wss = new WebSocketServer({ port: WS_PORT });

  console.log(`[Google ADK] WebSocket Server live on ws://localhost:${WS_PORT}`);

  wss.on("connection", (ws: WebSocket) => {
    console.log("[Google ADK] Client connected to live verbose chat stream");

    // Welcome greeting
    ws.send(
      JSON.stringify({
        type: "thought",
        agent: "Google ADK Multi-Agent Gateway",
        message:
          "Connected to Google ADK Live Verbose WebSocket channel. Ready for live multi-agent execution.",
        timestamp: new Date().toISOString(),
      }),
    );

    ws.on("message", async (raw: string) => {
      try {
        const payload = JSON.parse(raw.toString());

        if (payload.type === "chat") {
          const { eventId, message } = payload;
          if (!eventId || !message) {
            ws.send(JSON.stringify({ type: "error", message: "Missing eventId or message" }));
            return;
          }

          console.log(`[Google ADK] Executing multi-agent turn for event: ${eventId}`);

          await AdkMultiAgentOrchestrator.executeTurn({
            eventId,
            userMessage: message,
            onEvent: (verboseEvent) => {
              if (ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify(verboseEvent));
              }
            },
          });
        } else if (payload.type === "ping") {
          ws.send(JSON.stringify({ type: "pong", timestamp: new Date().toISOString() }));
        }
      } catch (err) {
        console.error("[Google ADK] WebSocket message error:", err);
        ws.send(JSON.stringify({ type: "error", message: String(err) }));
      }
    });

    ws.on("close", () => {
      console.log("[Google ADK] Client disconnected from WebSocket stream");
    });
  });

  return wss;
}

// Auto-start if run directly
if (require.main === module) {
  startWebSocketServer();
}
