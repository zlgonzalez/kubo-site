# Implementation Plan: Local SEO and AI Search Optimization

**Branch**: `002-preschool-user-acquisition` | **Date**: 2026-06-20 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-preschool-user-acquisition/spec.md`

## Summary

This plan outlines the technical changes to optimize Kubo Montessori's online presence for Peninsula Bay Area searches. It involves:
1. Aliasing and redirecting old URL paths (`/rw` and `/homedaycare`) to keyword-rich, localized paths (`/redwood-city-preschool-center` and `/san-mateo-preschool-daycare`) using Astro's built-in 301 redirection.
2. Enriching the San Mateo page with localized schema markup, images, teacher bios, and local maps.
3. Adding structured data and crawlers-friendly copy for AI assistants.
4. Setting up Playwright tests to assert that `301 Moved Permanently` redirects are returned for the old URLs.
5. Optimizing mobile/desktop page speed and third-party script deferrals to ensure Lighthouse collects scores above the 95% performance, 100% accessibility, and 95% SEO thresholds.

## Technical Context

**Language/Version**: Node.js v20+, Astro v5.0.0  
**Primary Dependencies**: `@astrojs/tailwind`, `@astrojs/sitemap`, `astro-robots-txt`, `@lhci/cli`, `@playwright/test`  
**Storage**: Static JSON file structures (`.astro/data-store.json`) and markdown-backed CSV files.  
**Testing**: Playwright (`npm run test:e2e` for routing and redirect checks), Lighthouse CI (`npm run test:lighthouse` for performance thresholds)  
**Target Platform**: Static web hosting / Node.js production server.  
**Project Type**: Astro Static/SSR Web Application.  
**Performance Goals**: Lighthouse performance score >= 95% (mobile and desktop), CLS <= 0.1, LCP <= 2.5s.  
**Constraints**: Zero implementation changes until `speckit-implement` is triggered. Preserving search equity via mandatory `301 Redirect` status codes.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] **Test-First Approach**: All routing and SEO changes will be backed by Playwright assertions that run as part of the local preview validation.
- [x] **No Code Before Implementation Phase**: Code changes will be planned and described here but not applied to source files until authorized.

## Project Structure

### Documentation (this feature)

```text
specs/002-preschool-user-acquisition/
├── spec.md              # Feature specification
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
└── quickstart.md        # Phase 1 output
```

### Source Code (repository root)

```text
src/
├── components/
│   └── SEO.astro        # Structured JSON-LD schema modifications
├── pages/
│   ├── index.astro
│   ├── redwood-city-preschool-center.astro  # NEW: Replaces rw.astro
│   └── san-mateo-preschool-daycare.astro    # NEW: Replaces homedaycare.astro
│
tests/
└── smoke.spec.ts        # Playwright integration tests (verifying 301 redirects)
```

**Structure Decision**: Standard single-project Astro workspace. We will replace `rw.astro` and `homedaycare.astro` with the new target files (or rename them) and add the redirection mapping to `astro.config.mjs` so Astro handles build-time and server-side redirects automatically.

## Complexity Tracking

*No constitution violations detected.*
