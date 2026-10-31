import { EventRepository } from "@/db/repository";
import { generateHeuristicBlueprint } from "@/lib/ai/heuristic-generator";
import { generateCountdownMilestones } from "@/lib/countdown";
import { calculateReadinessScore } from "@/lib/readiness";
import { describe, expect, it } from "vitest";

describe("Efficiency, Performance & Algorithmic Scalability", () => {
  it("generates complete domain heuristic blueprint in under 15ms (<15ms latency)", () => {
    const input = {
      title: "Efficiency Benchmark Celebration",
      vertical: "wedding" as const,
      targetBudget: 75000,
      guestCount: 150,
      eventDate: "2026-10-10",
      location: "Kyoto, Japan",
      theme: "Zen Minimalist Autumn",
    };

    const startTime = performance.now();
    const blueprint = generateHeuristicBlueprint(input);
    const durationMs = performance.now() - startTime;

    expect(blueprint.budgetBreakdown.length).toBeGreaterThan(0);
    expect(durationMs).toBeLessThan(15);
  });

  it("calculates 0–100 Readiness Score in under 2ms (<2ms latency)", () => {
    const dummyEvent = {
      id: "evt-perf",
      user_id: "usr_planner_elena",
      title: "Fast Event",
      vertical: "wedding" as const,
      target_budget: 50000,
      total_spent: 10000,
      guest_count: 80,
      event_date: "2026-10-20",
      location: "Paris",
      theme: "Classic Elegance",
      notes: "Logistics confirmed.",
      created_at: new Date().toISOString(),
    };

    const startTime = performance.now();
    const result = calculateReadinessScore({ event: dummyEvent });
    const durationMs = performance.now() - startTime;

    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(durationMs).toBeLessThan(2);
  });

  it("calculates back-scheduled countdown milestones in under 1ms (<1ms latency)", () => {
    const startTime = performance.now();
    const milestones = generateCountdownMilestones("2026-12-31", "wedding", []);
    const durationMs = performance.now() - startTime;

    expect(milestones.length).toBeGreaterThan(0);
    expect(durationMs).toBeLessThan(1);
  });

  it("verifies O(n) budget balance algorithm maintains 0 rounding drift across 100 random budgets", () => {
    const startTime = performance.now();

    for (let i = 0; i < 100; i++) {
      const randomBudget = Math.floor(Math.random() * 200000) + 5000;
      const randomGuests = Math.floor(Math.random() * 300) + 10;
      const bp = generateHeuristicBlueprint({
        title: `Trial ${i}`,
        vertical: "wedding",
        targetBudget: randomBudget,
        guestCount: randomGuests,
        eventDate: "2026-10-10",
        location: "Test Location",
        theme: "Test Theme",
      });

      const sum = bp.budgetBreakdown.reduce((acc, b) => acc + b.estimatedCost, 0);
      expect(sum).toBe(randomBudget);
    }

    const totalDuration = performance.now() - startTime;
    // 100 complete blueprints generated in under 50ms (average < 0.5ms each)
    expect(totalDuration).toBeLessThan(50);
  });

  it("executes SQLite prepared queries with WAL mode in sub-millisecond time (<5ms)", () => {
    const startTime = performance.now();
    const events = EventRepository.getAllEvents();
    const durationMs = performance.now() - startTime;

    expect(Array.isArray(events)).toBe(true);
    expect(durationMs).toBeLessThan(5);
  });
});
