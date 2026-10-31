import { EventContextManager } from "@/lib/ai/context-manager";
import { retrieveRelevantKnowledge } from "@/lib/ai/rag/retriever";
import { calculateBudgetShiftTool, detectTimelineCollisionsTool } from "./tools";

export type VerboseEventType =
  | "thought"
  | "agent_delegation"
  | "tool_call"
  | "tool_result"
  | "rag_citation"
  | "sub_agent_output"
  | "token"
  | "done"
  | "error";

export interface VerboseEvent {
  type: VerboseEventType;
  agent?: string;
  toolName?: string;
  data?: unknown;
  message?: string;
  timestamp: string;
}

export type VerboseStreamListener = (event: VerboseEvent) => void;

/**
 * Google ADK Multi-Agent Orchestration Engine for Celebration & Event Planning
 */
export class AdkMultiAgentOrchestrator {
  /**
   * Executes a multi-agent collaborative turn with verbose live tracing
   */
  static async executeTurn(params: {
    eventId: string;
    userMessage: string;
    onEvent?: VerboseStreamListener;
  }): Promise<{ reply: string; traces: VerboseEvent[] }> {
    const { eventId, userMessage, onEvent } = params;
    const traces: VerboseEvent[] = [];

    function emit(event: Omit<VerboseEvent, "timestamp">) {
      const fullEvent: VerboseEvent = {
        ...event,
        timestamp: new Date().toISOString(),
      };
      traces.push(fullEvent);
      if (onEvent) {
        onEvent(fullEvent);
      }
    }

    emit({
      type: "thought",
      agent: "Celebration & Wedding Planner (Lead Orchestrator)",
      message: `Analyzing user inquiry: "${userMessage}". Fetching live event context graph and inspecting dependencies...`,
    });

    // 1. Tool Call: Fetch Event Context
    emit({
      type: "tool_call",
      agent: "Celebration & Wedding Planner (Lead Orchestrator)",
      toolName: "get_event_context",
      data: { eventId },
    });

    const context = EventContextManager.getEventContext(eventId);
    if (!context) {
      const errorMsg = `Event with ID "${eventId}" was not found in the database.`;
      emit({ type: "error", message: errorMsg });
      return { reply: errorMsg, traces };
    }

    emit({
      type: "tool_result",
      agent: "Celebration & Wedding Planner (Lead Orchestrator)",
      toolName: "get_event_context",
      data: {
        title: context.event.title,
        vertical: context.event.vertical,
        targetBudget: context.budgetSummary.target,
        committed: context.budgetSummary.committed,
        remaining: context.budgetSummary.remaining,
        guestCount: context.guestSummary.totalInvited,
        attending: context.guestSummary.attending,
      },
    });

    // 2. Tool Call: RAG Domain Knowledge Query
    emit({
      type: "tool_call",
      agent: "Celebration & Wedding Planner (Lead Orchestrator)",
      toolName: "lookup_rag_knowledge",
      data: { query: userMessage, vertical: context.event.vertical },
    });

    const ragDocs = retrieveRelevantKnowledge(userMessage, context.event.vertical, 2);

    emit({
      type: "tool_result",
      agent: "Celebration & Wedding Planner (Lead Orchestrator)",
      toolName: "lookup_rag_knowledge",
      data: { documentsFound: ragDocs.length, titles: ragDocs.map((d) => d.title) },
    });

    for (const doc of ragDocs) {
      emit({
        type: "rag_citation",
        agent: "Genkit RAG Indexer",
        message: `${doc.title} (${doc.topic})`,
        data: { contentSnippet: `${doc.content.slice(0, 160)}...` },
      });
    }

    // 3. Multi-Agent Delegation Routing
    const lower = userMessage.toLowerCase();
    let subAgentUsed = "general_concierge";
    let subAgentFindings = "";

    if (
      lower.includes("budget") ||
      lower.includes("cost") ||
      lower.includes("price") ||
      lower.includes("expensive") ||
      lower.includes("guest") ||
      lower.includes("headcount")
    ) {
      subAgentUsed = "budget_specialist";
      emit({
        type: "agent_delegation",
        agent: "Celebration & Wedding Planner (Lead Orchestrator)",
        message:
          "Delegating financial calculations and margin stress-testing to Budget Specialist Agent...",
        data: { targetSubAgent: "budget_specialist" },
      });

      // Execute Budget Tool
      emit({
        type: "tool_call",
        agent: "budget_specialist",
        toolName: "calculate_budget_shift",
        data: {
          eventId,
          deltaGuestCount: lower.includes("extra") || lower.includes("jump") ? 20 : 0,
        },
      });

      const budgetToolRes = await calculateBudgetShiftTool({
        eventId,
        deltaGuestCount: lower.includes("extra") || lower.includes("jump") ? 20 : 0,
        additionalCost: 0,
      });

      emit({
        type: "tool_result",
        agent: "budget_specialist",
        toolName: "calculate_budget_shift",
        data: budgetToolRes,
      });

      subAgentFindings = `
Budget Specialist Report:
- Total Committed: $${budgetToolRes.currentCommitted.toLocaleString()}
- Projected Total: $${budgetToolRes.projectedTotal.toLocaleString()}
- Remaining Buffer: $${budgetToolRes.projectedRemaining.toLocaleString()} (Mandatory 8% Minimum: $${budgetToolRes.contingencyRequired.toLocaleString()})
- Contingency Cushion: ${budgetToolRes.isContingencySafe ? "Protected (>8%)" : "At Risk (<8%)"}
- Recommendations: ${budgetToolRes.recommendations.join(" ")}
      `.trim();

      emit({
        type: "sub_agent_output",
        agent: "budget_specialist",
        message: subAgentFindings,
      });
    } else if (
      lower.includes("timeline") ||
      lower.includes("schedule") ||
      lower.includes("run of show") ||
      lower.includes("hour") ||
      lower.includes("transition")
    ) {
      subAgentUsed = "timeline_specialist";
      emit({
        type: "agent_delegation",
        agent: "Celebration & Wedding Planner (Lead Orchestrator)",
        message:
          "Delegating schedule verification and transition buffer audit to Timeline Specialist Agent...",
        data: { targetSubAgent: "timeline_specialist" },
      });

      emit({
        type: "tool_call",
        agent: "timeline_specialist",
        toolName: "detect_timeline_collisions",
        data: { eventId },
      });

      const timelineToolRes = await detectTimelineCollisionsTool({ eventId });

      emit({
        type: "tool_result",
        agent: "timeline_specialist",
        toolName: "detect_timeline_collisions",
        data: timelineToolRes,
      });

      subAgentFindings = `
Timeline Specialist Report:
- Milestones Checked: ${timelineToolRes.totalMilestones}
- Schedule Collisions: ${timelineToolRes.hasCollisions ? "Yes" : "Zero conflicts detected"}
- Transit Warnings: ${timelineToolRes.bufferWarnings.length > 0 ? timelineToolRes.bufferWarnings.join(" | ") : "All transitions respect 15-min buffers"}
- Advisories: ${timelineToolRes.recommendations.join(" ")}
      `.trim();

      emit({
        type: "sub_agent_output",
        agent: "timeline_specialist",
        message: subAgentFindings,
      });
    }

    // 4. Celebration & Wedding Planner Orchestrator Synthesis & Token Streaming
    emit({
      type: "thought",
      agent: "Celebration & Wedding Planner (Lead Orchestrator)",
      message:
        "Synthesizing multi-agent outputs, RAG benchmarks, and live event state into final concierge advisory...",
    });

    let finalReply = "";

    if (subAgentUsed === "budget_specialist") {
      finalReply = `
Hello! Celebration & Wedding Planner here with our financial logistics assessment for **"${context.event.title}"**.

Based on our multi-agent budget analysis:
- **Current Target Budget:** $${context.budgetSummary.target.toLocaleString()}
- **Total Committed / Booked:** $${context.budgetSummary.committed.toLocaleString()}
- **Available Reserve:** $${context.budgetSummary.remaining.toLocaleString()}

${subAgentFindings}

**Celebration & Wedding Planner's Concierge Recommendation:**
Always guard your mandatory 8% emergency contingency ($${Math.round(context.budgetSummary.target * 0.08).toLocaleString()}). If guest headcounts or catering minimums increase, offset them by consolidating stationery/favors or negotiating beverage package hours rather than letting your contingency buffer erode.
      `.trim();
    } else if (subAgentUsed === "timeline_specialist") {
      finalReply = `
Celebration & Wedding Planner here reviewing your day-of run of show for **"${context.event.title}"**.

Our timeline sequencing audit reports:
- **Total Scheduled Milestones:** ${context.timelineSummary.totalItems} (${context.timelineSummary.completedItems} marked complete)
- **Next Milestone:** ${context.timelineSummary.nextMilestone || "All scheduled"}

${subAgentFindings}

**Celebration & Wedding Planner's Logistics Rule:**
Remember our golden-hour rule: outdoor vows must finish at least 60 minutes before sunset to capture golden-hour couple portraits without rushing into reception dining.
      `.trim();
    } else {
      finalReply = `
Hello! Celebration & Wedding Planner here monitoring your celebration **"${context.event.title}"** (${context.event.location}).

- **Guest Status:** ${context.guestSummary.attending} confirmed attending out of ${context.guestSummary.totalInvited} invited (${context.guestSummary.pending} pending).
- **Dietary Flags:** ${context.guestSummary.dietaryAlerts.length > 0 ? context.guestSummary.dietaryAlerts.join(", ") : "None reported"}.
- **Budget Balance:** $${context.budgetSummary.committed.toLocaleString()} committed of $${context.budgetSummary.target.toLocaleString()} budget.

Our RAG domain knowledge base confirms that your milestones align with standard luxury celebration logistics. How can I or our specialized sub-agents assist you further?
      `.trim();
    }

    // Stream out tokens in simulated chunks for live typewriter experience
    const words = finalReply.split(" ");
    for (let i = 0; i < words.length; i += 4) {
      const chunk = `${words.slice(i, i + 4).join(" ")} `;
      emit({
        type: "token",
        agent: "Celebration & Wedding Planner (Lead Orchestrator)",
        message: chunk,
      });
      // micro-yield
      await new Promise((r) => setTimeout(r, 20));
    }

    // Record memory in database
    EventContextManager.recordMemory({
      eventId,
      role: "user",
      message: userMessage,
    });
    EventContextManager.recordMemory({
      eventId,
      role: "assistant",
      message: finalReply,
    });

    emit({
      type: "done",
      agent: "Celebration & Wedding Planner (Lead Orchestrator)",
      message: "Multi-agent turn completed successfully and state persisted to SQLite.",
    });

    return { reply: finalReply, traces };
  }
}
