# Implementation Plan: Remediate SE Ranking Audit Errors and Warnings

**Branch**: `006-fix-audit-issues` | **Date**: September 26, 2026 | **Spec**: [spec.md](./spec.md)  
**Input**: Feature specification from `specs/006-fix-audit-issues/spec.md` with requirement: "Leverage the same astro stack, make sure all tests pass"

## Summary

Remediate all 10 errors and 3 warnings identified in the SE Ranking website audit by:
1. Canonicalizing XML sitemaps (`@astrojs/sitemap` in `astro.config.mjs` and `ai-sitemap.xml.ts`) by removing non-canonical query URLs (`/blog/?p=...`) while ensuring `/blog/` is indexed.
2. Adding descriptive accessibility `alt` attributes to all gallery images across `src/pages/rw-gardening.astro` and `src/pages/rw-gymnastics.astro`.
3. Optimizing oversized faculty images (`aileen-amar.jpeg` and `joy-pacaigue.jpg`) on `src/pages/redwood-city-preschool-center.astro` below the 1 MB budget via `sharp`.
4. Updating and expanding unit and E2E test suites (`tests/unit/sitemap.test.ts` and `tests/smoke.spec.ts`) to enforce these invariants and ensure 100% test suite pass rate.

## Technical Context

**Language/Version**: TypeScript / JavaScript (Node.js 18+)  
**Primary Dependencies**: Astro 4.x, `@astrojs/sitemap`, `@astrojs/tailwind`, `sharp`  
**Storage**: Static asset directory (`public/images/`)  
**Testing**: Vitest (`npm run test:unit`), Playwright (`npm run test:e2e`), Lighthouse CI (`npm run test:lighthouse`)  
**Target Platform**: Static Site Generation (SSG) / Web CDN  
**Project Type**: Astro Static Web Application  
**Performance Goals**: 100% of images < 1 MB (target < 300 KB), 0 redirect/non-canonical sitemap entries  
**Constraints**: Zero regressions across existing tests, retain existing URL routing and 301 redirects, retain visual fidelity  
**Scale/Scope**: 10 sitemap URLs corrected, 10 gallery images updated with alt text, 2 images optimized, 2 test suites updated  

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] **Compatibility with Astro stack**: Uses existing `@astrojs/sitemap` and Astro SSG patterns.
- [x] **Test-first / Test-verified**: Every change backed by unit and E2E assertions; full test suite passes.
- [x] **No unnecessary complexity**: Solves issues at the exact root cause with minimal footprint.

## Project Structure

### Documentation (this feature)

```text
specs/006-fix-audit-issues/
├── plan.md              # This implementation plan
├── research.md          # Phase 0 decisions & trade-offs
├── data-model.md        # Phase 1 entity definitions
├── quickstart.md        # Phase 1 verification workflow
├── contracts/           # Phase 1 compliance contracts
│   └── audit-contract.md
└── checklists/
    └── requirements.md
```

### Source Code (repository root)

```text
src/
├── pages/
│   ├── ai-sitemap.xml.ts              # Modify: Include /blog/, omit query URLs
│   ├── rw-gardening.astro             # Modify: Add descriptive alt attributes to gallery images
│   ├── rw-gymnastics.astro            # Modify: Add descriptive alt attributes to gallery images
│   └── redwood-city-preschool-center.astro # Verified: Uses optimized images
astro.config.mjs                       # Modify: Remove customPages blog query URLs from sitemap
public/images/
├── aileen-amar.jpeg                   # Modify: Recompressed with sharp (< 300 KB)
└── joy-pacaigue.jpg                   # Modify: Recompressed with sharp (< 300 KB)
tests/
├── unit/
│   └── sitemap.test.ts                # Modify: Assert canonical sitemaps, alt tags, and image sizes
└── smoke.spec.ts                      # Modify: Assert sitemap canonical blog URL and no query params
```

**Structure Decision**: Standard Astro single-project structure utilizing `src/pages` and `public/images`.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
| :--- | :--- | :--- |
| None | N/A | N/A |

---

## Planned Implementation Steps

### Phase 1: Image Payload Optimization & Accessibility Alt Text
1. Run a script using `sharp` to compress `public/images/aileen-amar.jpeg` and `public/images/joy-pacaigue.jpg` to high quality (~82) JPEG, verifying file sizes drop from >1 MB to <300 KB.
2. Update `src/pages/rw-gardening.astro` image list with descriptive `alt` text objects and update the template `<img>` markup to render `alt={img.alt}`.
3. Update `src/pages/rw-gymnastics.astro` image list with descriptive `alt` text objects and update the template `<img>` markup to render `alt={img.alt}`.

### Phase 2: Sitemap Canonicalization
1. Update `astro.config.mjs` to remove `customPages: blogPostUrls` from `sitemap(...)` so that Astro indexes only canonical static pages.
2. Update `src/pages/ai-sitemap.xml.ts` to include `"/blog/"` in the static `pages` array and remove the DropInBlog query parameter loop.

### Phase 3: Test Suite Alignment & Validation
1. Update `tests/unit/sitemap.test.ts`:
   - Replace assertions checking for query parameters in sitemaps with assertions verifying sitemaps only contain canonical URLs without query parameters.
   - Add unit tests verifying all images in `rw-gardening.astro` and `rw-gymnastics.astro` have alt text.
   - Add unit tests verifying all images on `redwood-city-preschool-center.astro` are strictly < 1 MB.
2. Update `tests/smoke.spec.ts`:
   - Update blog sitemap test to assert `/sitemap-0.xml` includes `/blog/` and does not include `/blog/?p=`.
3. Execute `npm test` to verify all unit, Lighthouse, and Playwright tests pass cleanly.
