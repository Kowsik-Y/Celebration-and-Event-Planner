import { retrieveRelevantKnowledge } from "@/lib/ai/rag/retriever";
import { describe, expect, it } from "vitest";

describe("RAG Domain Knowledge Retriever", () => {
  it("retrieves standard wedding budget benchmarks for wedding queries", () => {
    const docs = retrieveRelevantKnowledge("budget allocation catering", "wedding", 2);
    expect(docs.length).toBeGreaterThan(0);
    const topDoc = docs[0];
    expect(topDoc.content).toContain("Venue & Catering");
    expect(topDoc.content).toContain("Contingency");
  });

  it("retrieves timeline buffer and golden hour rules for run-of-show queries", () => {
    const docs = retrieveRelevantKnowledge("timeline golden hour sunset", "wedding", 2);
    expect(docs.length).toBeGreaterThan(0);
    const hasTimeline = docs.some(
      (d) => d.content.includes("Golden Hour") || d.content.includes("Buffer"),
    );
    expect(hasTimeline).toBe(true);
  });

  it("retrieves permit and compliance guidelines for community event queries", () => {
    const docs = retrieveRelevantKnowledge("municipal permits accessibility", "community", 2);
    expect(docs.length).toBeGreaterThan(0);
    const hasPermit = docs.some((d) => d.content.includes("Permits") || d.content.includes("ADA"));
    expect(hasPermit).toBe(true);
  });
});
