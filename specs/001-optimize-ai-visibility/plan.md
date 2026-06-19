# Implementation Plan: AI Visibility Optimization

**Branch**: `001-optimize-ai-visibility` | **Date**: 2026-06-19 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-optimize-ai-visibility/spec.md`

## Summary

This plan optimizes Kubo Montessori's local discoverability and authority on search and AI/RAG engines (e.g. ChatGPT Search, Gemini, Perplexity) by addressing entity fragmentation, mapping unified multi-campus schema markup, standardizing brand naming, and deploying specialized crawler-ready resources (sitemap, web handbook, homepage FAQs).

## Technical Context

**Language/Version**: TypeScript / Astro 5.x / JavaScript  
**Primary Dependencies**: astro, @astrojs/sitemap, astro-robots-txt, tailwindcss  
**Storage**: N/A (Static frontend web pages)  
**Testing**: Manual schema validations, local dynamic route audits, and production builds  
**Target Platform**: Netlify / Vercel / Static hosting  
**Project Type**: Astro static web application  
**Performance Goals**: Maintain current 90+ Lighthouse performance scores; zero render-blocking files above the fold  
**Constraints**: Keep tuition details private and redirect parents to Calendly badge tours  
**Scale/Scope**: 1 dynamic XML route, 1 new handbook page, 3 layout/page modifications  

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

All design details conform with the project guidelines. No violations are present.

## Project Structure

### Documentation (this feature)

```text
specs/001-optimize-ai-visibility/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
└── tasks.md             # Phase 2 output (next step)
```

### Source Code (repository root)

```text
src/
├── components/
│   ├── SEO.astro        # [MODIFY] Update JSON-LD EducationalOrganization multi-campus graph
│   └── Footer.astro     # [MODIFY] Double check name consistency
├── pages/
│   ├── index.astro      # [MODIFY] Add structured FAQ section, update Redwood City name
│   ├── rw.astro         # [MODIFY] Remove duplicate head JSON-LD, update Woodside references
│   ├── parent-handbook.astro # [NEW] Structured print-friendly HTML handbook page
│   └── ai-sitemap.xml.ts # [NEW] Custom dynamic endpoint routing sitemap for AI crawlers
```

**Structure Decision**: Single project layout matching existing Astro workspace.

## Proposed Changes

### Configuration & Routing

#### [NEW] [ai-sitemap.xml.ts](file:///Users/zlgonzalez/Documents/code/kubo/kubo-site/src/pages/ai-sitemap.xml.ts)
A dynamic Astro route serving custom XML containing only indexable high-value pages (`/`, `/homedaycare`, `/rw`, `/parent-handbook`, `/about`, `/services`) for AI scrapers.

### Components & Meta

#### [MODIFY] [SEO.astro](file:///Users/zlgonzalez/Documents/code/kubo/kubo-site/src/components/SEO.astro)
Update structured JSON-LD schema:
- Parent: `EducationalOrganization` ("Kubo Montessori", `url: "https://www.kubomontessori.com"`, logo, sameAs referencing official AMS school directory).
- Sub-organizations:
  - San Mateo: `DayCare` (2823 Flores St, typicalAgeRange: "20m-6y", phone: +16504304118, fresh hot lunch and potty training assistance).
  - Redwood City: `Preschool` ("Roots N' Wings Montessori by Kubo Montessori LLC", 2323 Euclid Ave, typicalAgeRange: "2y-6y", phone: +14085026198, potty training assistance).

### Pages

#### [MODIFY] [index.astro](file:///Users/zlgonzalez/Documents/code/kubo/kubo-site/src/pages/index.astro)
- Rename references of Redwood City campus from "Roots N Wings Montessori of Woodside" to "Roots N' Wings Montessori by Kubo Montessori LLC".
- Implement a modern, responsive **FAQ Section** at the bottom of the page addressing: schedules, potty training policies, meal programs, age groups, and TK.

#### [MODIFY] [rw.astro](file:///Users/zlgonzalez/Documents/code/kubo/kubo-site/src/pages/rw.astro)
- Remove duplicate JSON-LD schema from the page head `<fragment slot="head">`.
- Change copy references from "Roots N Wings of Woodside by Kubo Montessori LLC" to "Roots N' Wings Montessori by Kubo Montessori LLC".

#### [NEW] [parent-handbook.astro](file:///Users/zlgonzalez/Documents/code/kubo/kubo-site/src/pages/parent-handbook.astro)
A new structured HTML page that displays operational guidelines, schedules, schedules for infants/toddlers vs. preschool/TK, potty training assistance details, and meal plans, structured cleanly for AI scrapers to ingest.

---

## Verification Plan

### Automated Tests
- Run production build command to confirm no compile-time errors:
  ```bash
  npm run build
  ```

### Manual Verification
- Local server visual inspection of `/parent-handbook` layout and print style.
- Validate sitemap response using:
  ```bash
  curl -I http://localhost:4321/ai-sitemap.xml
  ```
- Copy generated HTML from the local homepage source and run it through validator.schema.org to confirm the multi-location graph passes with no issues.
