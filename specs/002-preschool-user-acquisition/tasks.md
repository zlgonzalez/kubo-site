# Tasks: Local SEO and AI Search Optimization

**Input**: Design documents from `/specs/002-preschool-user-acquisition/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, quickstart.md

**Tests**: Included as requested by the user to verify redirect routing, Lighthouse budgets, and page loading.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Initial project preparation and structure validation.

- [x] T001 [P] Verify folder structures and verify environment paths in `specs/002-preschool-user-acquisition/`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core redirection and redirect-test configurations.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [x] T002 Configure URL redirects in `astro.config.mjs` mapping `/rw`, `/rw/`, `/homedaycare`, and `/homedaycare/` to `/redwood-city-preschool-center` and `/san-mateo-preschool-daycare` respectively with status `301`.
- [x] T003 [P] Add Playwright test assertions in `tests/smoke.spec.ts` verifying that `/rw`, `/rw/`, `/homedaycare`, and `/homedaycare/` requests return a 301 status code and point to their new URLs.

**Checkpoint**: Foundation ready - redirects are declared and verified via failing e2e tests.

---

## Phase 3: User Story 1 - Local Search Discovery for San Mateo Campus (Priority: P1) 🎯 MVP

**Goal**: Establish the optimized San Mateo landing page at `/san-mateo-preschool-daycare`.

**Independent Test**: Requesting `/san-mateo-preschool-daycare` returns status 200 and loads local San Mateo keywords in headers and content.

### Tests for User Story 1
> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [x] T004 [P] [US1] Create Playwright test case in `tests/smoke.spec.ts` asserting `/san-mateo-preschool-daycare` loads successfully and displays San Mateo preschool daycare copy.

### Implementation for User Story 1

- [x] T005 [P] [US1] Create the page component `src/pages/san-mateo-preschool-daycare.astro` copying from `homedaycare.astro` and optimizing title, description, keywords, and copy.
- [x] T006 [US1] Delete the old page file `src/pages/homedaycare.astro` to ensure no duplicate content exists.

**Checkpoint**: User Story 1 is functional. Visiting `/homedaycare` redirects to the new `/san-mateo-preschool-daycare` page, which renders correctly.

---

## Phase 4: User Story 2 - Local Search Discovery for Redwood City Campus (Priority: P1)

**Goal**: Establish the optimized Redwood City landing page at `/redwood-city-preschool-center`.

**Independent Test**: Requesting `/redwood-city-preschool-center` returns status 200 and loads local Redwood City keywords.

### Tests for User Story 2
> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [x] T007 [P] [US2] Create Playwright test case in `tests/smoke.spec.ts` asserting `/redwood-city-preschool-center` loads successfully and displays Redwood City preschool copy.

### Implementation for User Story 2

- [x] T008 [P] [US2] Create the page component `src/pages/redwood-city-preschool-center.astro` copying from `rw.astro` and optimizing title, description, and keywords.
- [x] T009 [US2] Delete the old page file `src/pages/rw.astro` to ensure no duplicate content exists.

**Checkpoint**: User Story 2 is functional. Visiting `/rw` redirects to the new `/redwood-city-preschool-center` page, which renders correctly.

---

## Phase 5: User Story 3 - AI Search Engine Recommendations (Priority: P2)

**Goal**: Optimize page speed and add structured tables/metadata for AI crawlability.

**Independent Test**: Verify that JSON-LD validates correctly via structured schema tools, and run `npm run test:lighthouse` to ensure all scores meet the thresholds.

### Implementation for User Story 3

- [x] T010 [P] [US3] Add structured key-value information tables for AI indexing (Ages, potty training policy, meals, hours, ratios) on `src/pages/san-mateo-preschool-daycare.astro` and `src/pages/redwood-city-preschool-center.astro`.
- [x] T011 [P] [US3] Refine structured schema integration in `src/components/SEO.astro` to differentiate between the `DayCare` (San Mateo) and `Preschool` (Redwood City) campus entities.
- [x] T012 [US3] Optimize performance on both pages (`src/pages/san-mateo-preschool-daycare.astro` and `src/pages/redwood-city-preschool-center.astro`) by deferring Google Tag Manager scripts and using a facade placeholder for the YouTube tour player to ensure Lighthouse mobile performance tests pass.
- [x] T012b [US3] Implement server-side pre-rendering or configure RSS feed indexing for DropInBlog in `src/pages/blog.astro` to make blog posts indexable by search engines.
- [x] T012c [P] [US3] Create Playwright test cases in `tests/smoke.spec.ts` to assert that blog posts are present in the DOM when JavaScript is disabled, and that sitemaps include blog URL paths.

**Checkpoint**: Location pages are optimized for AI crawlers, and Lighthouse audits pass with scores >= 95% (performance), 100% (accessibility), and >= 95% (SEO).

---

## Phase 6: User Story 4 - Accessing Local Maps & Directions (Priority: P3)

**Goal**: Establish a dedicated directions and parking page for San Mateo campus.

**Independent Test**: Navigating to `/san-mateo-location-directions` loads the interactive map and parking info.

### Tests for User Story 4

- [x] T013 [P] [US4] Create Playwright test case in `tests/smoke.spec.ts` asserting that `/san-mateo-location-directions` resolves with status 200.

### Implementation for User Story 4

- [x] T014 [P] [US4] Create the new directions page `src/pages/san-mateo-location-directions.astro` with embedded Google Maps coordinates, transit info, and parking guidelines.
- [x] T015 [US4] Update links in `src/pages/rw-location-directions.astro` and the landing pages (`src/pages/san-mateo-preschool-daycare.astro` and `src/pages/redwood-city-preschool-center.astro`) to point to the correct directions paths.

**Checkpoint**: Both campuses have dedicated directions and map pages linked from their main pages.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: General optimizations, cleanup, sitemap validation.

- [x] T016 Verify that robots.txt and sitemaps (`dist/sitemap-0.xml`, `dist/ai-sitemap.xml`) correctly list all new locations/directions URLs and exclude deleted paths.
- [x] T017 Execute `make test` locally to verify that all unit tests, e2e Playwright tests, and Lighthouse CI audits pass.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Can start immediately.
- **Foundational (Phase 2)**: Depends on Setup completion. Blocks all user stories.
- **User Stories (Phase 3+)**: Depend on Foundational phase completion. User stories can proceed in parallel or sequentially.
- **Polish (Final Phase)**: Depends on all user stories being complete.

---

## Parallel Opportunities

- Setup task `T001` and redirect test setup `T003` can run in parallel.
- Playwright tests and page creations for User Story 1 (`T004`, `T005`) and User Story 2 (`T007`, `T008`) can run in parallel.
- AI optimization tasks (`T010`, `T011`) can be developed in parallel.

---

## Implementation Strategy

### MVP First (User Story 1 Only)
1. Complete Setup and Foundational redirects (`T002`, `T003`).
2. Implement and test San Mateo Page optimization (`T004`, `T005`, `T006`).
3. Run redirect smoke tests to verify the redirect and the new page resolve correctly.
