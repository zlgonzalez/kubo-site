# Implementation Plan: Local SEO & AI SEO (GEO) Growth Strategy

**Branch**: `004-local-seo-and-geo` | **Date**: 2026-08-19 | **Spec**: [spec.md](file:///Users/zlgonzalez/Documents/code/kubo/kubo-site/specs/004-local-seo-and-geo/spec.md)  
**Input**: Feature specification from `/specs/004-local-seo-and-geo/spec.md`

## Summary

Implement a Local Authority & Generative Engine Optimization (GEO) growth strategy for Kubo Montessori using Astro. The strategy establishes 5 geo-targeted city landing pages (Foster City, Belmont, San Carlos, Burlingame, Menlo Park), 3 educational resource guides under `/resources/`, multi-entity JSON-LD structured schema markup, machine-readable Quick-Fact comparison tables, and collapsible FAQ sections. All pages utilize `Layout.astro` to ensure real-time Calendly tour booking widget integration and client-side Google Analytics event tracking (`tour_booking_scheduled`) across all local touchpoints.

## Technical Context

**Language/Version**: TypeScript / Astro 4.x / Node.js 18+  
**Primary Dependencies**: Astro, Tailwind CSS, CSV Parse (for calendar data), Calendly JS SDK / iframe postMessage listener  
**Storage**: Static Site Generation (SSG) / Markdown & Astro component templates  
**Testing**: Playwright / Vitest / Static HTML Build Validation  
**Target Platform**: Web Browsers (Desktop & Mobile) / Vercel/Netlify/Static Web Hosting  
**Project Type**: Astro Static Web Application  
**Performance Goals**: Sub-second page load times (LCP < 1.2s), 100/100 Mobile Accessibility & SEO Lighthouse scores  
**Constraints**: Mobile-responsive responsive layout; low-friction Calendly tour booking integration; strict schema compliance  
**Scale/Scope**: 5 new city landing pages, 3 resource guides, reusable schema & Quick-Fact table components  

## Constitution Check

*GATE: Passed. All architectural patterns conform to project standard Astro SSG design.*

- **Library-First / Component Modularization**: Components (`SEO.astro`, `QuickFactTable.astro`, `CalendarWidget.astro`) are modular and self-contained.
- **Analytics & Observability**: Client-side Calendly tracking (`calendly-analytics.ts`) ensures all scheduled tour conversions are observed and tracked in Google Analytics.
- **Simplicity & YAGNI**: Direct static Astro route pages provide clean maintenance without unnecessary runtime API servers.

## Project Structure

### Documentation (this feature)

```text
specs/004-local-seo-and-geo/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
src/
├── components/
│   ├── CalendarWidget.astro
│   ├── QuickFactTable.astro       # [NEW] Quick-Fact summary comparison table component
│   ├── FAQSection.astro           # [NEW] Collapsible FAQ component with FAQPage schema
│   ├── LocalGeoSchema.astro       # [NEW] City-specific schema generator
│   └── SEO.astro                  # Updated multi-entity JSON-LD schema
├── layouts/
│   └── Layout.astro               # Global layout with Calendly analytics & badge widget
├── pages/
│   ├── foster-city-preschool-daycare.astro   # [NEW] Foster City landing page
│   ├── belmont-ca-montessori-daycare.astro   # [NEW] Belmont landing page
│   ├── san-carlos-montessori-preschool.astro # [NEW] San Carlos landing page
│   ├── burlingame-montessori-preschool.astro # [NEW] Burlingame landing page
│   ├── menlo-park-montessori-preschool.astro # [NEW] Menlo Park landing page
│   ├── resources/
│   │   ├── montessori-vs-traditional-preschool.astro # [NEW] Philosophy guide
│   │   ├── potty-training-preschool-guide.astro      # [NEW] Potty training guide
│   │   └── home-vs-center-childcare.astro            # [NEW] Childcare comparison guide
│   ├── san-mateo-preschool-daycare.astro     # Updated with Quick-Fact table & FAQs
│   └── redwood-city-preschool-center.astro   # Updated with Quick-Fact table & FAQs
└── utils/
    └── calendly-analytics.ts      # Calendly postMessage event listener & GA conversion dispatcher
```

**Structure Decision**: Single project layout matching existing Astro structure under `src/pages/` and `src/components/`.

## Complexity Tracking

*No constitution violations. All additions follow standard Astro SSG patterns.*
