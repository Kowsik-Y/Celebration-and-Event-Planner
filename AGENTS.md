# Celebration & Event Planner - Agent Rules & Guidelines

## Core Principles
1. **Type-Safe Full-Stack Next.js**:
   - Next.js 15 App Router with React 19 and TypeScript.
   - Absolutely NO Python. Full TypeScript ecosystem across backend, frontend, database, and test suite.
   - SQLite with strict schema management via `better-sqlite3` and type-safe query layer.

2. **Strict Code Quality & Biome**:
   - Biome (`@biomejs/biome`) is the sole linter and formatter.
   - Zero linter errors, zero warnings.
   - Strict TypeScript (`"strict": true`, no `any`, explicit return types for APIs, Zod runtime validation for all external/agent inputs).

3. **Maximum Library Leverage (HeroUI First)**:
   - UI: HeroUI (`@heroui/react`) paired with Tailwind CSS and Framer Motion.
   - Do NOT build custom primitives (tabs, modals, accordions, inputs, tables, dropdowns, toasts) from scratch. Always utilize HeroUI's tested, accessible components.
   - Icons: `lucide-react`.
   - Visualizations: `recharts` and interactive progress metrics.
   - Effects: `canvas-confetti` for celebratory moments.
   - Dates: `date-fns` for accurate timeline and run-of-show calculations.

4. **Security & Input Sanitization**:
   - All AI prompts, user inputs, and URL params must be validated with Zod schemas.
   - All SQLite queries use parameterized prepared statements; strictly zero string concatenation for SQL.
   - Sanitize rich text / user strings to prevent XSS.
   - Secure environment variable handling with server-only isolation (`server-only` package or server action boundary).

5. **Accessibility (WCAG AA Compliance)**:
   - Semantic HTML elements (`<main>`, `<nav>`, `<header>`, `<section>`, `<article>`).
   - HeroUI accessible components with proper `aria-label`, `aria-expanded`, and keyboard tab indexing.
   - High color contrast for both light and dark modes.
   - Screen-reader announcement for dynamic AI generation states.

6. **Testing & Maintainability**:
   - Automated tests using Vitest.
   - Test suites covering:
     - Budget calculation & allocation logic.
     - Day-of timeline sequencer & conflict detection.
     - Vendor checklist generator & status transitions.
     - Zod schema validation & API response safety.
