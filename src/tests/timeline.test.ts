import { generateHeuristicBlueprint } from "@/lib/ai/heuristic-generator";
import { describe, expect, it } from "vitest";

describe("Timeline & Run of Show Sequencer", () => {
  it("sequences day-of timeline milestones in ascending order", () => {
    const input = {
      title: "Timeline Test Wedding",
      vertical: "wedding" as const,
      targetBudget: 50000,
      guestCount: 100,
      eventDate: "2026-10-10",
      location: "Paris, France",
      theme: "Romantic Chateau",
    };

    const blueprint = generateHeuristicBlueprint(input);
    const timeline = blueprint.runOfShowTimeline;

    expect(timeline.length).toBeGreaterThan(5);

    // Verify orderIndex is strictly increasing
    for (let i = 0; i < timeline.length - 1; i++) {
      expect(timeline[i].orderIndex).toBeLessThan(timeline[i + 1].orderIndex);
    }
  });

  it("ensures ceremony and cocktail hour have valid HH:MM formats", () => {
    const input = {
      title: "Format Test",
      vertical: "wedding" as const,
      targetBudget: 40000,
      guestCount: 75,
      eventDate: "2026-11-05",
      location: "Charleston, SC",
      theme: "Southern Garden",
    };

    const blueprint = generateHeuristicBlueprint(input);
    const timeRegex = /^([01]\d|2[0-3]):[0-5]\d$/;

    for (const item of blueprint.runOfShowTimeline) {
      expect(item.timeStart).toMatch(timeRegex);
      expect(item.timeEnd).toMatch(timeRegex);
    }
  });
});
