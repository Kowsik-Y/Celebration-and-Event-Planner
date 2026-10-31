import { AdkMultiAgentOrchestrator, type VerboseEvent } from "@/lib/adk/multi-agent";
import {
  calculateBudgetShiftTool,
  detectTimelineCollisionsTool,
  getEventContextTool,
  lookupRagKnowledgeTool,
} from "@/lib/adk/tools";
import { describe, expect, it } from "vitest";

describe("Google ADK Tools & Genkit RAG", () => {
  const eventId = "evt-wedding-amalfi";

  it("lookupRagKnowledgeTool returns verified domain documents", async () => {
    const res = await lookupRagKnowledgeTool({
      query: "contingency budget wedding",
      vertical: "wedding",
      limit: 2,
    });

    expect(res.documents.length).toBeGreaterThan(0);
    expect(res.documents[0].title).toBeDefined();
    expect(res.documents[0].content).toContain("Contingency");
  });

  it("getEventContextTool fetches live database context graph", async () => {
    const res = await getEventContextTool({ eventId });
    expect(res.title).toContain("Villa");
    expect(res.targetBudget).toBe(65000);
    expect(res.guestCount).toBe(110);
  });

  it("calculateBudgetShiftTool computes per-head catering impact and contingency safety", async () => {
    const res = await calculateBudgetShiftTool({
      eventId,
      deltaGuestCount: 20,
      additionalCost: 3000,
    });

    expect(res.projectedTotal).toBeGreaterThan(res.currentCommitted);
    expect(res.contingencyRequired).toBe(Math.round(65000 * 0.08));
    expect(res.recommendations.length).toBeGreaterThan(0);
  });

  it("detectTimelineCollisionsTool audits run of show schedule and curfews", async () => {
    const res = await detectTimelineCollisionsTool({ eventId });
    expect(res.totalMilestones).toBeGreaterThan(0);
    expect(Array.isArray(res.collisionDetails)).toBe(true);
    expect(Array.isArray(res.recommendations)).toBe(true);
  });
});

describe("Google ADK Multi-Agent Orchestrator", () => {
  const eventId = "evt-wedding-amalfi";

  it("executes multi-agent turn and emits verbose streaming traces", async () => {
    const traces: VerboseEvent[] = [];

    const result = await AdkMultiAgentOrchestrator.executeTurn({
      eventId,
      userMessage: "How does our catering budget hold up if 25 extra guests arrive?",
      onEvent: (event) => traces.push(event),
    });

    expect(result.reply).toBeDefined();
    expect(result.reply.length).toBeGreaterThan(20);

    // Verify trace event types were captured
    const eventTypes = traces.map((t) => t.type);
    expect(eventTypes).toContain("thought");
    expect(eventTypes).toContain("tool_call");
    expect(eventTypes).toContain("tool_result");
    expect(eventTypes).toContain("rag_citation");
    expect(eventTypes).toContain("token");
    expect(eventTypes).toContain("done");
  });
});
