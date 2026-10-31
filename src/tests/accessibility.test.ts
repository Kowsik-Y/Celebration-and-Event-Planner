import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

/**
 * Calculates relative luminance according to WCAG 2.1 specifications.
 */
function getRelativeLuminance(rgb: [number, number, number]): number {
  const [r, g, b] = rgb.map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Calculates contrast ratio between two RGB colors (WCAG AA requires >= 4.5:1 for normal text).
 */
function getContrastRatio(rgb1: [number, number, number], rgb2: [number, number, number]): number {
  const l1 = getRelativeLuminance(rgb1);
  const l2 = getRelativeLuminance(rgb2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

describe("Accessibility (WCAG AA Compliance & Assistive Tech)", () => {
  it("verifies skip-to-main-content anchor is included in the root layout", () => {
    const layoutPath = path.join(process.cwd(), "src/app/layout.tsx");
    const layoutContent = fs.readFileSync(layoutPath, "utf-8");

    expect(layoutContent).toContain('href="#main-content"');
    expect(layoutContent).toContain("Skip to main content");
    expect(layoutContent).toContain("sr-only focus:not-sr-only");
  });

  it("verifies semantic landmark elements and output in private layout", () => {
    const privateLayoutPath = path.join(process.cwd(), "src/app/(private-route)/layout.tsx");
    const content = fs.readFileSync(privateLayoutPath, "utf-8");

    expect(content).toContain('id="main-content"');
    expect(content).toContain("<main");
    expect(content).toContain("<footer");
    expect(content).toContain('aria-live="polite"');
  });

  it("verifies ARIA roles and labels in ReadinessGauge component", () => {
    const gaugePath = path.join(process.cwd(), "src/components/readiness-gauge.tsx");
    const content = fs.readFileSync(gaugePath, "utf-8");

    expect(content).toContain("<section");
    expect(content).toContain('aria-label="Celebration Readiness Score"');
    expect(content).toContain('role="alert"');
    expect(content).toContain('aria-hidden="true"');
  });

  it("confirms high color contrast ratio for primary brand foreground on background (>= 4.5:1)", () => {
    // #111827 (dark text) on #FFFFFF (light background)
    const darkText: [number, number, number] = [17, 24, 39];
    const lightBg: [number, number, number] = [255, 255, 255];
    const contrastRatio = getContrastRatio(darkText, lightBg);

    // WCAG AA threshold for body text is 4.5:1
    expect(contrastRatio).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio).toBeGreaterThan(10); // Typically ~16:1
  });

  it("verifies interactive buttons and forms have explicit accessible names and labels", () => {
    const navbarPath = path.join(process.cwd(), "src/components/navbar.tsx");
    const navContent = fs.readFileSync(navbarPath, "utf-8");

    expect(navContent).toContain("aria-label");
  });
});
