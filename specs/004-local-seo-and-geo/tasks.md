# Tasks: Local SEO & AI SEO (GEO) Growth Strategy

**Input**: Design documents from `/specs/004-local-seo-and-geo/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, quickstart.md

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Includes exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project verification and baseline infrastructure

- [X] T001 Audit existing Astro site structure and verify dependencies in package.json
- [X] T002 [P] Verify Calendly analytics tracking initialization in src/utils/calendly-analytics.ts and src/layouts/Layout.astro

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core UI components and schema generators required before user story pages can be created

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T003 [P] Create reusable Quick-Fact comparison table component in src/components/QuickFactTable.astro
- [X] T004 [P] Create reusable collapsible FAQ section component in src/components/FAQSection.astro
- [X] T005 [P] Extend JSON-LD structured schema generator in src/components/SEO.astro to support multi-entity @graph schemas (EducationalOrganization, Preschool, ChildCare, FAQPage)
- [X] T006 Update existing campus pages src/pages/san-mateo-preschool-daycare.astro and src/pages/redwood-city-preschool-center.astro with Quick-Fact tables and structured FAQs

**Checkpoint**: Foundation ready - local landing page implementation can now begin

---

## Phase 3: User Story 1 - Geo-Targeted Local Discovery for Peninsula Parents (Priority: P1) 🎯 MVP

**Goal**: Deliver 5 dedicated, localized city landing pages for Foster City, Belmont, San Carlos, Burlingame, and Menlo Park with commute highlights, campus specs, maps, and Calendly tour scheduling.

**Independent Test**: Navigate to `/foster-city-preschool-daycare`, `/belmont-ca-montessori-daycare`, `/san-carlos-montessori-preschool`, `/burlingame-montessori-preschool`, `/menlo-park-montessori-preschool`; verify localized headers, commute highlights, campus specs, embedded maps, and functioning Calendly tour booking CTAs.

### Implementation for User Story 1

- [X] T007 [P] [US1] Create Foster City geo landing page in src/pages/foster-city-preschool-daycare.astro
- [X] T008 [P] [US1] Create Belmont geo landing page in src/pages/belmont-ca-montessori-daycare.astro
- [X] T009 [P] [US1] Create San Carlos geo landing page in src/pages/san-carlos-montessori-preschool.astro
- [X] T010 [P] [US1] Create Burlingame geo landing page in src/pages/burlingame-montessori-preschool.astro
- [X] T011 [P] [US1] Create Menlo Park geo landing page in src/pages/menlo-park-montessori-preschool.astro
- [X] T012 [US1] Integrate CalendarWidget.astro and Calendly tour booking CTAs across all 5 new city landing pages

**Checkpoint**: User Story 1 is fully functional and testable independently (MVP ready!)

---

## Phase 4: User Story 2 - AI Search Engine & Generative Engine Visibility (Priority: P2)

**Goal**: Ensure all local landing pages and campus pages render clean `@graph` structured schema and Quick-Fact tables for AI Overviews / SearchGPT / Perplexity extraction.

**Independent Test**: Run all local pages through Schema Markup Validator and inspect Quick-Fact table markup in page source.

### Implementation for User Story 2

- [X] T013 [P] [US2] Add city-specific areaServed and location schema properties to src/components/SEO.astro for target Peninsula cities
- [X] T014 [US2] Embed FAQSection.astro with JSON-LD FAQPage schema on campus and local landing pages

**Checkpoint**: User Stories 1 AND 2 work independently and provide complete GEO search signals

---

## Phase 5: User Story 3 - High-Intent Educational Content & Philosophy Guides (Priority: P3)

**Goal**: Publish 3 evergreen educational guide articles under `/resources/`.

**Independent Test**: Navigate to `/resources/montessori-vs-traditional-preschool`, `/resources/potty-training-preschool-guide`, and `/resources/home-vs-center-childcare`; verify content, schema, and Calendly tour CTAs.

### Implementation for User Story 3

- [X] T015 [P] [US3] Create Montessori vs. Traditional Preschool guide in src/pages/resources/montessori-vs-traditional-preschool.astro
- [X] T016 [P] [US3] Create Potty Training Support Guide in src/pages/resources/potty-training-preschool-guide.astro
- [X] T017 [P] [US3] Create Home-Based vs. Center Childcare Guide in src/pages/resources/home-vs-center-childcare.astro

**Checkpoint**: All user stories are independently functional

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Build validation, sitemap updates, and analytics verification

- [X] T018 [P] Update sitemap generation in src/pages/ai-sitemap.xml.ts to include all new local and resource routes
- [X] T019 Run static site build via npm run build and validate zero HTML or TypeScript compilation errors across dist/
- [X] T020 Run quickstart validation steps to verify Calendly postMessage event tracking in Google Analytics

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: Depend on Foundational phase completion
  - User Story 1 (P1) is MVP
  - User Story 2 (P2) builds on schema foundations
  - User Story 3 (P3) adds resource guide pages
- **Polish (Phase 6)**: Depends on all user stories being complete

### Parallel Opportunities

- Tasks marked `[P]` within a phase can run in parallel:
  - T003, T004, T005 in Phase 2
  - T007, T008, T009, T010, T011 in Phase 3 (all 5 city landing pages can be developed concurrently!)
  - T015, T016, T017 in Phase 5 (all 3 resource guide pages can be developed concurrently!)
