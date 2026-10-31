import type { EventRecord } from "@/db/schema";
import { generateEventJson, generateEventMarkdown } from "@/lib/export";
import { calculateReadinessScore } from "@/lib/readiness";
import { describe, expect, it } from "vitest";

describe("Plan Export Engine (PDF, Markdown & JSON Serialization)", () => {
  const dummyEvent: EventRecord = {
    id: "evt-export-test",
    user_id: "usr_planner_elena",
    title: "Tuscan Vineyard Wedding",
    vertical: "wedding",
    target_budget: 65000,
    total_spent: 25000,
    guest_count: 100,
    event_date: "2026-10-18",
    location: "Siena, Italy",
    theme: "Sun-drenched Terracotta & Olive Foliage",
    notes: "Aria's curated plan.",
    created_at: new Date().toISOString(),
  };

  const dummyBudget = [
    {
      id: "b1",
      event_id: dummyEvent.id,
      category: "Venue & Reception Space",
      name: "Tuscan Villa Hire",
      estimated_cost: 25000,
      actual_cost: 25000,
      status: "confirmed",
      notes: "Private grounds access",
    },
    {
      id: "b2",
      event_id: dummyEvent.id,
      category: "Emergency Contingency Reserve",
      name: "8% Contingency Reserve",
      estimated_cost: 5200,
      actual_cost: 0,
      status: "planned",
      notes: "Emergency buffer",
    },
  ];

  const dummyTimeline = [
    {
      id: "t1",
      event_id: dummyEvent.id,
      time_start: "15:00",
      time_end: "16:00",
      phase: "Ceremony",
      title: "Exchange of Vows",
      description: "Under the olive arch",
      responsible_party: "Officiant",
      order_index: 1,
      is_completed: 1,
    },
  ];

  const dummyVendors = [
    {
      id: "v1",
      event_id: dummyEvent.id,
      category: "Photography",
      name: "Fine Art Duo",
      contact_email: "photo@example.com",
      contact_phone: "+39 123 4567",
      price: 8000,
      status: "hired",
      deadline_offset_days: 180,
      notes: "10-hr coverage",
    },
  ];

  const dummyGuests = [
    {
      id: "g1",
      event_id: dummyEvent.id,
      name: "Sofia Rossi",
      email: "sofia@example.com",
      rsvp_status: "attending",
      dietary_restrictions: "Gluten-Free / Celiac",
      table_number: "Table 1",
      plus_ones: 1,
    },
  ];

  const dummyIdeas = [
    {
      id: "i1",
      event_id: dummyEvent.id,
      category: "Welcome",
      title: "Sensory Welcome Spritz",
      description: "Botanical mist and prosecco welcome bar",
      aesthetic_tags: "Sensory, Boutique",
      ai_rationale: "Sets luxurious mood",
    },
  ];

  const readiness = calculateReadinessScore({
    event: dummyEvent,
    budgetItems: dummyBudget,
    timelineItems: dummyTimeline,
    vendorItems: dummyVendors,
    guests: dummyGuests,
  });

  it("exports structured JSON matching the EventExportData schema", () => {
    const jsonStr = generateEventJson({
      event: dummyEvent,
      readiness,
      budgetItems: dummyBudget,
      timelineItems: dummyTimeline,
      vendorItems: dummyVendors,
      guests: dummyGuests,
      ideas: dummyIdeas,
      exportedAt: new Date().toISOString(),
    });

    const parsed = JSON.parse(jsonStr);
    expect(parsed.event.title).toBe("Tuscan Vineyard Wedding");
    expect(parsed.readiness.score).toBeGreaterThan(0);
    expect(parsed.budgetItems.length).toBe(2);
    expect(parsed.timelineItems.length).toBe(1);
    expect(parsed.guests.length).toBe(1);
  });

  it("exports clean, client-ready Markdown brief with tables and dietary flags", () => {
    const md = generateEventMarkdown({
      event: dummyEvent,
      readiness,
      budgetItems: dummyBudget,
      timelineItems: dummyTimeline,
      vendorItems: dummyVendors,
      guests: dummyGuests,
      ideas: dummyIdeas,
      exportedAt: new Date().toISOString(),
    });

    expect(md).toContain("# Celebration Blueprint: Tuscan Vineyard Wedding");
    expect(md).toContain("## 1. Readiness Assessment");
    expect(md).toContain("## 2. Mathematical Budget Allocation");
    expect(md).toContain("## 3. Day-of Run-of-Show Timeline");
    expect(md).toContain("## 4. Scalable Vendor Procurement");
    expect(md).toContain("## 5. Guest & Hospitality Registry");
    expect(md).toContain("Gluten-Free / Celiac");
    expect(md).toContain("Sensory Welcome Spritz");
  });
});
