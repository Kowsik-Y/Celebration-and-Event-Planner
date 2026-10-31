import { getDb } from "@/db";
import type { EventMemoryRecord, EventRecord } from "@/db/schema";
import { formatKnowledgeForPrompt, retrieveRelevantKnowledge } from "./rag/retriever";

export interface EventContextSummary {
  event: EventRecord;
  budgetSummary: {
    target: number;
    committed: number;
    remaining: number;
    itemCount: number;
    categories: Array<{ category: string; total: number }>;
  };
  timelineSummary: {
    totalItems: number;
    completedItems: number;
    nextMilestone?: string;
  };
  vendorSummary: {
    totalVendors: number;
    hiredVendors: number;
    pendingCategories: string[];
  };
  guestSummary: {
    totalInvited: number;
    attending: number;
    declined: number;
    pending: number;
    dietaryAlerts: string[];
  };
  recentMemories: EventMemoryRecord[];
}

export class EventContextManager {
  /**
   * Compiles the complete state of an event into a unified structured context
   */
  static getEventContext(eventId: string): EventContextSummary | null {
    const db = getDb();
    const event = db.prepare("SELECT * FROM events WHERE id = ?").get(eventId) as
      | EventRecord
      | undefined;
    if (!event) return null;

    // Budget aggregation
    const budgetRows = db
      .prepare(`
      SELECT category, SUM(actual_cost) as total, COUNT(*) as count
      FROM budget_items
      WHERE event_id = ?
      GROUP BY category
    `)
      .all(eventId) as Array<{ category: string; total: number; count: number }>;

    const totalCommitted = budgetRows.reduce((acc, row) => acc + (row.total || 0), 0);
    const totalItems = budgetRows.reduce((acc, row) => acc + (row.count || 0), 0);

    // Timeline aggregation
    const timelineRows = db
      .prepare(`
      SELECT title, time_start, is_completed
      FROM timeline_items
      WHERE event_id = ?
      ORDER BY order_index ASC
    `)
      .all(eventId) as Array<{ title: string; time_start: string; is_completed: number }>;

    const completedTimeline = timelineRows.filter((t) => t.is_completed === 1).length;
    const nextItem = timelineRows.find((t) => t.is_completed === 0);

    // Vendor aggregation
    const vendorRows = db
      .prepare(`
      SELECT category, status
      FROM vendor_items
      WHERE event_id = ?
    `)
      .all(eventId) as Array<{ category: string; status: string }>;

    const hiredVendors = vendorRows.filter((v) => v.status === "hired").length;
    const pendingCategories = vendorRows.filter((v) => v.status !== "hired").map((v) => v.category);

    // Guest aggregation
    const guestRows = db
      .prepare(`
      SELECT rsvp_status, dietary_restrictions, plus_ones
      FROM guests
      WHERE event_id = ?
    `)
      .all(eventId) as Array<{
      rsvp_status: string;
      dietary_restrictions: string;
      plus_ones: number;
    }>;

    const attending = guestRows
      .filter((g) => g.rsvp_status === "attending")
      .reduce((sum, g) => sum + 1 + (g.plus_ones || 0), 0);
    const declined = guestRows.filter((g) => g.rsvp_status === "declined").length;
    const pending = guestRows.filter((g) => g.rsvp_status === "pending").length;
    const dietaryAlerts = guestRows
      .map((g) => g.dietary_restrictions)
      .filter((d) => d && d !== "None");

    // Recent decision memories (last 6 turns)
    const recentMemories = db
      .prepare(`
      SELECT * FROM event_memories
      WHERE event_id = ?
      ORDER BY created_at DESC
      LIMIT 6
    `)
      .all(eventId) as EventMemoryRecord[];

    return {
      event,
      budgetSummary: {
        target: event.target_budget,
        committed: totalCommitted,
        remaining: Math.max(0, event.target_budget - totalCommitted),
        itemCount: totalItems,
        categories: budgetRows.map((r) => ({ category: r.category, total: r.total })),
      },
      timelineSummary: {
        totalItems: timelineRows.length,
        completedItems: completedTimeline,
        nextMilestone: nextItem ? `${nextItem.time_start} - ${nextItem.title}` : undefined,
      },
      vendorSummary: {
        totalVendors: vendorRows.length,
        hiredVendors,
        pendingCategories,
      },
      guestSummary: {
        totalInvited: event.guest_count,
        attending,
        declined,
        pending,
        dietaryAlerts,
      },
      recentMemories: recentMemories.reverse(),
    };
  }

  /**
   * Records a user/assistant interaction turn into persistent event memory
   */
  static recordMemory(params: {
    eventId: string;
    role: "user" | "assistant" | "system";
    message: string;
    intent?: string;
    contextSnapshot?: Record<string, unknown>;
  }): void {
    const db = getDb();
    const id = `mem-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO event_memories (id, event_id, role, message, intent, context_snapshot, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      params.eventId,
      params.role,
      params.message,
      params.intent || "conversation",
      JSON.stringify(params.contextSnapshot || {}),
      now,
    );
  }

  /**
   * Generates a context-enriched system prompt including RAG domain knowledge and memory history
   */
  static buildPromptWithContext(
    eventId: string,
    userQuery: string,
    systemPersona: string,
  ): { systemPrompt: string; userPrompt: string } {
    const context = EventContextManager.getEventContext(eventId);
    if (!context) {
      return {
        systemPrompt: systemPersona,
        userPrompt: userQuery,
      };
    }

    const { event, budgetSummary, timelineSummary, vendorSummary, guestSummary, recentMemories } =
      context;

    // Retrieve RAG Knowledge
    const retrievedDocs = retrieveRelevantKnowledge(
      `${userQuery} ${event.theme} ${event.location}`,
      event.vertical,
      3,
    );
    const ragContext = formatKnowledgeForPrompt(retrievedDocs);

    // Format Memory History
    const memoryContext =
      recentMemories.length > 0
        ? `
### Recent Conversational Decision History:
${recentMemories.map((m) => `${m.role.toUpperCase()}: ${m.message}`).join("\n")}
`
        : "";

    const enrichedSystemPrompt = `
${systemPersona}

### Current Live Event Context Graph:
- Event: "${event.title}" (${event.vertical.toUpperCase()})
- Date: ${event.event_date} | Location: ${event.location}
- Theme & Aesthetic: ${event.theme}
- Target Budget: $${event.target_budget.toLocaleString()} | Committed: $${budgetSummary.committed.toLocaleString()} | Remaining Buffer: $${budgetSummary.remaining.toLocaleString()}
- Guest Count: ${event.guest_count} planned (${guestSummary.attending} confirmed attending, ${guestSummary.pending} pending)
- Dietary Requirements Noted: ${guestSummary.dietaryAlerts.length > 0 ? guestSummary.dietaryAlerts.join(", ") : "None reported"}
- Timeline Progress: ${timelineSummary.completedItems} / ${timelineSummary.totalItems} milestones complete (Next: ${timelineSummary.nextMilestone || "All completed"})
- Vendors: ${vendorSummary.hiredVendors} / ${vendorSummary.totalVendors} hired (Pending categories: ${vendorSummary.pendingCategories.join(", ") || "None"})

${ragContext}

${memoryContext}

Instructions:
1. Ground your advice in the event's actual numbers, location, and guest count.
2. If the user's request affects the budget, timeline, or vendors, specify the exact trade-offs or adjustments required.
3. Be supportive, impeccably organized, and clear.
`;

    return {
      systemPrompt: enrichedSystemPrompt,
      userPrompt: userQuery,
    };
  }
}
