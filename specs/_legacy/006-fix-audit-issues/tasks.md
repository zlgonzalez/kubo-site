# Tasks: Remediate SE Ranking Audit Errors and Warnings

**Input**: Design documents from `/specs/006-fix-audit-issues/`  
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/  
**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Verify baseline testing environment and ensure clean working state

- [x] T001 Verify existing test suite baseline passes via `npm test`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Provide tooling required for image payload optimization across user stories

- [x] T002 Create image compression helper script using `sharp` in `scripts/optimize-images.cjs`

**Checkpoint**: Foundation ready - user story implementation can proceed.

---

## Phase 3: User Story 1 - Eliminate Non-Canonical Pages from XML Sitemaps (Priority: P1) 🎯 MVP

**Goal**: Remove all 10 non-canonical blog post query URLs (`/blog/?p=...`) from `sitemap-0.xml` and `ai-sitemap.xml`, ensuring 100% of sitemap URLs are self-referencing canonical endpoints (including `/blog/`).

**Independent Test**: Build the project and inspect `dist/sitemap-0.xml` and `dist/ai-sitemap.xml` to verify they contain `https://www.kubomontessori.com/blog/` and zero occurrences of `/blog/?p=`.

### Tests for User Story 1

- [x] T003 [P] [US1] Update `tests/unit/sitemap.test.ts` to assert XML sitemaps contain ONLY canonical URLs, omit query-parameter URLs (`/blog/?p=`), and include `/blog/`
- [x] T004 [P] [US1] Update `tests/smoke.spec.ts` blog sitemap smoke test to assert `/sitemap-0.xml` includes `/blog/` and excludes `/blog/?p=`

### Implementation for User Story 1

- [x] T005 [US1] Remove `customPages: blogPostUrls` in `astro.config.mjs` to restrict `@astrojs/sitemap` to canonical static URLs
- [x] T006 [US1] Add `"/blog/"` to the static `pages` array and remove the DropInBlog query-parameter loop in `src/pages/ai-sitemap.xml.ts`

**Checkpoint**: User Story 1 complete and independently verifiable. All 10 sitemap errors from SE Ranking audit are remediated.

---

## Phase 4: User Story 2 - Provide Accessible Alt Text for Curriculum Activity Images (Priority: P2)

**Goal**: Provide meaningful, descriptive `alt` attributes for all 5 gallery images on the Gardening page (`/rw-gardening/`) and all 5 gallery images on the Gymnastics page (`/rw-gymnastics/`).

**Independent Test**: Run Vitest and inspect rendered markup to confirm zero `img` tags omit `alt` attributes on `/rw-gardening/` and `/rw-gymnastics/`.

### Tests for User Story 2

- [x] T007 [P] [US2] Add unit tests in `tests/unit/sitemap.test.ts` asserting 100% of gallery images on `src/pages/rw-gardening.astro` and `src/pages/rw-gymnastics.astro` possess non-empty `alt` attributes

### Implementation for User Story 2

- [x] T008 [P] [US2] Refactor image data array to `{ src, alt }` objects with descriptive Montessori alt text and update `<img>` markup in `src/pages/rw-gardening.astro`
- [x] T009 [P] [US2] Refactor image data array to `{ src, alt }` objects with descriptive Montessori alt text and update `<img>` markup in `src/pages/rw-gymnastics.astro`

**Checkpoint**: User Story 2 complete and independently verifiable. All 2 missing alt text warnings from SE Ranking audit are remediated.

---

## Phase 5: User Story 3 - Optimize Large Images on Campus Landing Pages Below 1 MB (Priority: P2)

**Goal**: Optimize oversized teacher portraits (`aileen-amar.jpeg` and `joy-pacaigue.jpg`) loaded on `/redwood-city-preschool-center/` to under 300 KB, well below the 1 MB budget.

**Independent Test**: Inspect file sizes of `public/images/aileen-amar.jpeg` and `public/images/joy-pacaigue.jpg` to verify both are `< 1,000,000` bytes (target `< 300 KB`).

### Tests for User Story 3

- [x] T010 [P] [US3] Add unit test in `tests/unit/sitemap.test.ts` asserting all image files loaded by `src/pages/redwood-city-preschool-center.astro` are strictly under 1 MB on disk

### Implementation for User Story 3

- [x] T011 [US3] Execute `scripts/optimize-images.cjs` to compress `public/images/aileen-amar.jpeg` and `public/images/joy-pacaigue.jpg` below 300 KB

**Checkpoint**: User Story 3 complete and independently verifiable. The large image warning from SE Ranking audit is remediated.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: End-to-end regression validation across unit tests, Lighthouse, and Playwright

- [x] T012 Run full test suite via `npm test` (`test:unit`, `test:lighthouse`, `test:e2e`) to verify zero regressions
- [x] T013 [P] Execute quickstart validation checks from `specs/006-fix-audit-issues/quickstart.md` against fresh build output

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - executes first to confirm baseline health.
- **Foundational (Phase 2)**: Depends on Phase 1; creates optimization helper script.
- **User Story 1 (Phase 3 - P1 MVP)**: Depends on Phase 2; resolves all 10 audit errors.
- **User Story 2 (Phase 4 - P2)**: Independent of US1; can proceed in parallel or after US1.
- **User Story 3 (Phase 5 - P2)**: Depends on Phase 2 helper script; can proceed in parallel with US1/US2.
- **Polish (Phase 6)**: Depends on all user stories (US1, US2, US3) being completed.

### Parallel Opportunities

- `T003` and `T004` (US1 test updates) can run in parallel.
- `T007`, `T008`, and `T009` (US2 alt text implementation & tests) touch distinct files and can run in parallel.
- `T010` and `T011` (US3 test and optimization) touch distinct files and can run in parallel with US2.

---

## Implementation Strategy

### MVP First (User Story 1 Only)
1. Complete Setup (`T001`) and Foundational (`T002`).
2. Implement US1 tasks (`T003` - `T006`).
3. Run `npm run test:unit` and verify `sitemap-0.xml` and `ai-sitemap.xml` are 100% canonical.
4. All 10 audit errors are immediately resolved.

### Incremental Delivery of Warnings
1. Implement US2 (`T007` - `T009`) to resolve 2 "Alt text missing" warnings.
2. Implement US3 (`T010` - `T011`) to resolve 1 "Image too big" warning.
3. Run Polish (`T012`, `T013`) to verify full test suite (`npm test`) passes with 100% compliance.
