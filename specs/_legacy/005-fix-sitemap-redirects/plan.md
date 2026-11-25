# Implementation Plan: Sitemap Canonicalization and Redirect Elimination

**Branch**: `005-fix-sitemap-redirects` | **Date**: September 13, 2026 | **Spec**: [spec.md](./spec.md)  
**Input**: Feature specification from `specs/005-fix-sitemap-redirects/spec.md`

## Summary

Resolve 35+ sitemap redirect warnings flagged in SEMrush site audits for `kubomontessori.com`. Normalize all URLs declared in `sitemap-0.xml` and `ai-sitemap.xml` to match the site's canonical trailing slash policy (including query parameters as `/blog/?p={slug}`), exclude redirect stubs (`blog.html`) from sitemap generation, eliminate the redundant insecure `sitemap-http.xml` integration, and ensure legacy redirect rules point directly to canonical endpoints in a single hop.

## Technical Context

**Language/Version**: Node.js 22+, TypeScript / JavaScript (ESM)  
**Primary Dependencies**: Astro 7.0.3, `@astrojs/sitemap` 3.7.3, `astro-robots-txt` 1.0.0, `tailwindcss` 3.4.0  
**Storage**: Static build output in `dist/`  
**Testing**: Vitest (`test:unit`), Playwright (`test:e2e`), Lighthouse CI (`test:lighthouse`)  
**Target Platform**: Static Web Server (Astro SSG)  
**Project Type**: Static Web Application  
**Performance Goals**: 100% direct HTTP 200 responses on all sitemap URLs; 0 redirect hops  
**Constraints**: Conform to Astro directory routing trailing slash convention; preserve dropinblog build-time fetching  
**Scale/Scope**: ~35 sitemap entries across standard and AI sitemaps  

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Principle 1 (Self-contained / Single Responsibility)**: PASS - Changes are focused strictly on sitemap generation, robots policy, and redirect definitions.
- **Principle 2 (Testing & Verification)**: PASS - Unit tests verify generated sitemap XML output and robots.txt directives.
- **Principle 3 (Simplicity & YAGNI)**: PASS - Eliminates legacy dead code (`sitemap-http.ts`) rather than adding unnecessary complexity.

## Project Structure

### Documentation (this feature)

```text
specs/005-fix-sitemap-redirects/
├── spec.md              # Feature specification
├── plan.md              # Implementation plan
├── research.md          # Phase 0 decisions & rationales
├── data-model.md        # Phase 1 entities & validation rules
├── quickstart.md        # Phase 1 verification workflow
├── contracts/           # Phase 1 sitemap & robots contracts
│   └── sitemap-contract.md
└── checklists/
    └── requirements.md  # Quality validation checklist
```

### Source Code (repository root)

```text
astro.config.mjs                     # [MODIFY] Update blog post URLs, filter blog.html, remove sitemap-http
public/
└── llms.txt                         # [NEW] AI search engine discovery file
src/
├── components/
│   ├── Footer.astro                 # [MODIFY] Add trailing slashes to all internal links
│   └── SEO.astro                    # [MODIFY] Schema.org fixes (EducationalOrganization, remove typicalAgeRange)
├── integrations/
│   └── sitemap-http.ts              # [DELETE] Legacy insecure sitemap generator
└── pages/
    ├── ai-sitemap.xml.ts            # [MODIFY] Canonical trailing slashes on all paths & blog query URLs
    ├── blog.astro                   # [MODIFY] Descriptive anchor text on blog articles
    ├── contact.astro                # [MODIFY] Content enrichment (>200 words)
    ├── rw-baking.astro              # [MODIFY] Image alt tags & content enrichment
    ├── rw-location-directions.astro # [MODIFY] Content enrichment (>200 words) & title typo fix
    ├── resources/
    │   └── parent-handbook.astro    # [MODIFY] Eliminate duplicate H1
    └── [various landing pages]      # [MODIFY] Shorten title tags <= 70 chars, add trailing slashes
tests/
└── unit/
    └── sitemap.test.ts              # [NEW/MODIFY] Test suite verifying sitemap URLs and audit fixes
```

**Structure Decision**: Web application static generation structure utilizing Astro integrations and API routes.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| None | N/A | N/A |
