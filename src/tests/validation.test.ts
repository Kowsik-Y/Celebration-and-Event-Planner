import { CreateEventInputSchema, VowSpeechGenerationSchema } from "@/lib/ai/schemas";
import { describe, expect, it } from "vitest";

describe("Strict Input Validation & Security Boundary", () => {
  it("accepts valid celebration event inputs", () => {
    const valid = {
      title: "Cotswolds Manor Wedding",
      vertical: "wedding",
      targetBudget: 75000,
      guestCount: 120,
      eventDate: "2026-06-18",
      location: "Cotswolds, UK",
      theme: "English Countryside Elegance",
      notes: "Acoustic strings, afternoon tea",
    };

    const res = CreateEventInputSchema.safeParse(valid);
    expect(res.success).toBe(true);
  });

  it("rejects negative budgets or invalid dates", () => {
    const invalidBudget = {
      title: "Negative Budget Event",
      vertical: "wedding",
      targetBudget: -500,
      guestCount: 50,
      eventDate: "2026-06-18",
      location: "Nowhere",
      theme: "Test",
    };

    const res1 = CreateEventInputSchema.safeParse(invalidBudget);
    expect(res1.success).toBe(false);

    const invalidDate = {
      title: "Invalid Date Event",
      vertical: "wedding",
      targetBudget: 50000,
      guestCount: 50,
      eventDate: "not-a-date",
      location: "Nowhere",
      theme: "Test",
    };

    const res2 = CreateEventInputSchema.safeParse(invalidDate);
    expect(res2.success).toBe(false);
  });

  it("validates vow and speech parameters safely", () => {
    const validVows = {
      speakerRole: "Groom",
      tone: "romantic" as const,
      keyMemories: "Walking along the Seine in 2022",
      promisesOrWishes: "To always support your dreams",
      insideJokesOrAnecdotes: "Never letting you assemble IKEA alone",
    };

    const res = VowSpeechGenerationSchema.safeParse(validVows);
    expect(res.success).toBe(true);
  });
});
