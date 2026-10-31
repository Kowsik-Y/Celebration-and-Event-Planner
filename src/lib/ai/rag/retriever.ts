import { getDb } from "@/db";
import { seedKnowledgeBase } from "./knowledge-base";

export interface RetrievedKnowledge {
  title: string;
  topic: string;
  content: string;
  score: number;
}

/**
 * Retrieves the most relevant domain knowledge documents for a given event context or user prompt.
 * Uses normalized token frequency scoring and keyword matching against title, content, and tags.
 */
export function retrieveRelevantKnowledge(
  query: string,
  vertical: string,
  limit = 3,
): RetrievedKnowledge[] {
  seedKnowledgeBase();
  const db = getDb();

  const rows = db
    .prepare(`
    SELECT id, category, topic, title, content, tags
    FROM knowledge_documents
  `)
    .all() as Array<{
    id: string;
    category: string;
    topic: string;
    title: string;
    content: string;
    tags: string;
  }>;

  const normalizedQuery = `${query} ${vertical}`.toLowerCase();
  const queryTokens = normalizedQuery
    .replace(/[^\w\s]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 2);

  const scored: Array<RetrievedKnowledge> = [];

  for (const row of rows) {
    let score = 0;
    const docTags: string[] = JSON.parse(row.tags || "[]");
    const lowerTitle = row.title.toLowerCase();
    const lowerContent = row.content.toLowerCase();
    const lowerTopic = row.topic.toLowerCase();

    // Exact vertical boost
    if (docTags.includes(vertical.toLowerCase())) {
      score += 15;
    }

    for (const token of queryTokens) {
      if (lowerTopic.includes(token)) score += 8;
      if (lowerTitle.includes(token)) score += 6;
      if (docTags.some((t) => t.includes(token))) score += 5;
      if (lowerContent.includes(token)) score += 2;
    }

    if (score > 0) {
      scored.push({
        title: row.title,
        topic: row.topic,
        content: row.content.trim(),
        score,
      });
    }
  }

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit);
}

/**
 * Formats retrieved knowledge into a markdown section ready for prompt injection.
 */
export function formatKnowledgeForPrompt(knowledge: RetrievedKnowledge[]): string {
  if (knowledge.length === 0) return "";

  return `
### Verified Event Planning Industry Knowledge & Benchmarks (RAG):
${knowledge
  .map(
    (k, i) => `
[Reference ${i + 1}] ${k.title} (${k.topic}):
${k.content}
`,
  )
  .join("\n")}
`;
}
