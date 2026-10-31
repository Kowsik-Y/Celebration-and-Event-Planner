import type { EventRecord } from "@/db/schema";
import { calculateReadinessScore } from "@/lib/readiness";
import { describe, expect, it } from "vitest";

describe("Deterministic 0–100 Readiness Score Engine", () => {
  const baseEvent: EventRecord = {
    id: "evt-test-1",
    user_id: "usr_planner_elena",
    title: "Amalfi Coast Wedding",
    vertical: "wedding",
    target_budget: 60000,
    total_spent: 24000,
    guest_count: 90,
    event_date: "2026-10-15",
    location: "Ravello, Italy",
    theme: "Organic Coastal Minimalist",
    notes: "Aria's curated plan with protected 8% contingency buffer.",
    created_at: new Date().toISOString(),
  };

  it("awards high readiness score (90+) for a fully prepared celebration", () => {
    const result = calculateReadinessScore({
      event: baseEvent,
      budgetItems: [
        {
          id: "b1",
          event_id: baseEvent.id,
          category: "Venue",
          name: "Villa Hire",
          estimated_cost: 20000,
          actual_cost: 20000,
          status: "confirmed",
          notes: "",
        },
        {
          id: "b2",
          event_id: baseEvent.id,
          category: "Emergency Contingency",
          name: "8% Contingency Reserve",
          estimated_cost: 4800,
          actual_cost: 0,
          status: "planned",
          notes: "",
        },
      ],
      timelineItems: [
        {
          id: "t1",
          event_id: baseEvent.id,
          time_start: "15:00",
          time_end: "16:00",
          phase: "Ceremony",
          title: "Vows",
          description: "",
          responsible_party: "Officiant",
          order_index: 1,
          is_completed: 1,
        },
      ],
      vendorItems: [
        {
          id: "v1",
          event_id: baseEvent.id,
          category: "Venue",
          name: "Villa Cimbrone",
          contact_email: "",
          contact_phone: "",
          price: 20000,
          status: "hired",
          deadline_offset_days: 180,
          notes: "",
        },
      ],
      guests: [
        {
          id: "g1",
          event_id: baseEvent.id,
          name: "Elena Rostova",
          email: "elena@example.com",
          rsvp_status: "attending",
          dietary_restrictions: "None",
          table_number: "Table 1",
          plus_ones: 0,
        },
      ],
    });

    expect(result.score).toBeGreaterThanOrEqual(90);
    expect(result.tier).toBe("Celebration Ready");
    expect(result.color).toBe("success");
    expect(result.factors.length).toBe(5);
  });

  it("penalizes zero budget, unallocated vendors, and missing guest RSVPs with actionable reasons", () => {
    const unpreparedEvent: EventRecord = {
      ...baseEvent,
      target_budget: 0,
      theme: "",
      location: "",
      notes: "",
    };

    const result = calculateReadinessScore({
      event: unpreparedEvent,
      budgetItems: [],
      timelineItems: [],
      vendorItems: [],
      guests: [],
    });

    expect(result.score).toBeLessThan(40);
    expect(result.tier).toBe("Needs Immediate Attention");
    expect(result.color).toBe("danger");
    expect(result.reasons.length).toBeGreaterThan(0);
    expect(result.recommendations.length).toBeGreaterThan(0);
  });

  it("flags budget overages when actual spend exceeds target ceiling", () => {
    const overBudgetEvent: EventRecord = {
      ...baseEvent,
      target_budget: 40000,
    };

    const result = calculateReadinessScore({
      event: overBudgetEvent,
      budgetItems: [
        {
          id: "b1",
          event_id: overBudgetEvent.id,
          category: "Venue",
          name: "Villa Hire",
          estimated_cost: 30000,
          actual_cost: 50000, // 50k > 40k target
          status: "confirmed",
          notes: "",
        },
      ],
    });

    const budgetFactor = result.factors.find((f) => f.category === "budget");
    expect(budgetFactor?.score).toBeLessThan(20);
    const hasOverBudgetReason = result.reasons.some((r) => r.toLowerCase().includes("exceeds"));
    expect(hasOverBudgetReason).toBe(true);
  });
});
