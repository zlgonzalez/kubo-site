# Kubo Montessori Site Constitution

## Core Principles

### I. Static-First Performance & Accessibility
Every page MUST ship as static HTML/CSS with minimal client-side JavaScript, zero layout-shift regressions, and Lighthouse CI compliance (Accessibility >= 0.95, SEO >= 0.95, Performance >= 0.90, CLS <= 0.10).

### II. SEO, Local Discovery & AI Visibility
Canonical trailing-slash URLs, clean XML sitemaps (primary + `/ai-sitemap.xml`), `robots.txt`, `/llms.txt`, and valid Schema.org JSON-LD structured data MUST stay accurate and synchronized with shipped routes.

### III. Privacy & Conversion Analytics Integrity
Analytics (`gtag.js`) and Calendly booking conversion tracking MUST validate origins strictly, deduplicate booking events accurately, forward only allowlisted marketing parameters, and degrade gracefully without blocking parent tour bookings.

### IV. Automated Verification Before Merge
Changes MUST pass unit tests (`npm run test:unit`), production builds (`npm run build`), Lighthouse CI assertions, E2E smoke tests (`npm run test:e2e`), and the strict blueprint drift gate prior to merge.

### V. Security & Secret Hygiene
No credentials, API tokens, or private customer PII may be committed to the repository. Production hosting rules MUST enforce security/privacy headers, and workspace plugins/skills MUST follow least privilege (no unnecessary database/DBA tooling in this static site repo).

## Technology Stack & Constraints

- **Runtime & Framework**: Node.js 22+, Astro 7.x (SSG), TypeScript, Tailwind CSS 3.x
- **Testing & Quality**: Vitest (unit & static SEO/audit invariants), Playwright (E2E smoke), Lighthouse CI
- **Hosting**: Static build (`dist/`) mirrored to Apache hosting with `public/.htaccess`

## Governance

This constitution governs all `/speckit.*` planning, implementation, and review gates in this repository. Amendments require explicit documentation in this file and synchronization with `AGENTS.md`.

**Version**: 1.0.0 | **Ratified**: 2026-11-23 | **Last Amended**: 2026-11-23

<!-- KUBO_SPEC_SYNC_RULE_START -->
## Open Feature Spec Synchronization (NON-NEGOTIABLE)

Before merging or archiving (for example, distilling via `/speckit.blueprint-index.distill`) any branch with an open feature spec under `specs/<feature>/`, every surgical or out-of-band code change made during implementation, debugging, or review **MUST** be reflected back into the open feature's `spec.md` (and `plan.md`, `data-model.md`, `contracts/`, or `tasks.md` when affected).

- **No silent drift:** Never merge or archive a feature when the implemented behavior, interfaces, edge cases, constraints, or data models diverge from its open `spec.md`.
- **Update in the same branch:** Whenever a surgical code change alters behavior, constraints, edge cases, or contracts, update the currently open feature spec before merging and archiving.
- **Pre-merge verification:** Confirm the open feature spec accurately reflects the final code diff before merging and archiving.
<!-- KUBO_SPEC_SYNC_RULE_END -->

## Canonical Spec-Code Synchronization (Mandatory)

1. **Canonical Sources of Truth:** `.specify/memory/blueprint.md` is the canonical architectural map ("How") and `specs/000-product-baseline/spec.md` is the canonical behavioral baseline ("What"). Consult both before designing new features or modifying existing domains.
2. **Standard Feature Entry:** Start new features with `/speckit.specify` in `specs/<###-feature>/` so existing Spec Kit workflows remain intact.
3. **Surgical Edit Lockstep:** Whenever a prompt requests a behavioral, contract, data-model, or architectural change outside `/speckit.implement`, locate the active branch's `specs/<###-feature>/` folder (or `specs/000-product-baseline/` if patching a baseline domain directly) and update `spec.md`, `plan.md`, and `contracts/` in the **same turn** as the code change. Preserve existing `FR-###` IDs.
4. **Pre-Merge Canonical Rollup:** Before merging any feature branch, run `/speckit.blueprint-index.distill` on the active feature folder, fold added/modified behavioral requirements into `specs/000-product-baseline/spec.md`, commit all changes, and confirm `git diff --quiet && git diff --cached --quiet && bash .specify/extensions/blueprint-index/scripts/bash/blueprint-state.sh check --strict` exits 0 with zero drift.
