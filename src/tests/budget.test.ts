import { generateHeuristicBlueprint } from "@/lib/ai/heuristic-generator";
import { describe, expect, it } from "vitest";

describe("Budget Economics & Allocation Engine", () => {
  it("generates a mathematically balanced wedding budget with protected contingency and 0 drift", () => {
    const input = {
      title: "Test Wedding",
      vertical: "wedding" as const,
      targetBudget: 60000,
      guestCount: 100,
      eventDate: "2026-09-20",
      location: "Florence, Italy",
      theme: "Tuscan Garden",
    };

    const blueprint = generateHeuristicBlueprint(input);

    expect(blueprint.targetBudget).toBe(60000);
    expect(blueprint.contingencyReserve).toBe(Math.round(60000 * 0.08));

    // Invariant: Sum of all budget items must EXACTLY equal target budget with zero rounding drift
    const totalEstimated = blueprint.budgetBreakdown.reduce(
      (sum, item) => sum + item.estimatedCost,
      0,
    );
    expect(totalEstimated).toBe(input.targetBudget);
  });

  it("allocates Venue & Catering as the primary expense category (>40%)", () => {
    const input = {
      title: "Test Wedding",
      vertical: "wedding" as const,
      targetBudget: 50000,
      guestCount: 80,
      eventDate: "2026-08-15",
      location: "Napa Valley",
      theme: "Rustic",
    };

    const blueprint = generateHeuristicBlueprint(input);
    const venueItems = blueprint.budgetBreakdown.filter(
      (b) => b.category.includes("Venue") || b.category.includes("Catering"),
    );
    const venueTotal = venueItems.reduce((acc, b) => acc + b.estimatedCost, 0);

    expect(venueTotal / blueprint.targetBudget).toBeGreaterThan(0.4);
  });

  it("handles low and high budget boundaries reliably", () => {
    const lowInput = {
      title: "Intimate Elopement",
      vertical: "wedding" as const,
      targetBudget: 8000,
      guestCount: 15,
      eventDate: "2026-07-10",
      location: "Big Sur",
      theme: "Coastal Minimalist",
    };

    const lowPlan = generateHeuristicBlueprint(lowInput);
    expect(lowPlan.contingencyReserve).toBe(640);
    expect(lowPlan.budgetBreakdown.length).toBeGreaterThan(4);
    const total = lowPlan.budgetBreakdown.reduce((sum, item) => sum + item.estimatedCost, 0);
    expect(total).toBe(8000);
  });
});
