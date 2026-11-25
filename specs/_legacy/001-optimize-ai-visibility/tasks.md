# Tasks: AI Visibility Optimization

**Input**: Design documents from `/specs/001-optimize-ai-visibility/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Verify and prepare development environment with dependencies in `package.json`
- [x] T002 [P] Configure project linting/formatting rules in `package.json`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T003 Update the unified structured JSON-LD schema in `src/components/SEO.astro` representing Kubo Montessori as parent brand and the two campuses as subOrganizations, swapping types (San Mateo as `DayCare`, Redwood City as `Preschool`) and mapping both with potty training assistance.

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - AI Grounded Search Discovery (Priority: P1) 🎯 MVP

**Goal**: Ensure AI crawlers get correct answers on potty training (both locations) and meals (hot lunch in SM).

**Independent Test**: Scrapers query the homepage and extract correct amenities (potty training support at both sites, hot lunch in SM).

### Implementation for User Story 1

- [x] T004 [US1] Update program details text on the homepage `src/pages/index.astro` to explicitly state that potty training support is provided at both campuses.
- [x] T005 [US1] Update program details text on the homepage `src/pages/index.astro` to detail the hot lunch and organic snack program for the San Mateo location.

**Checkpoint**: User Story 1 features are fully functional and testable independently.

---

## Phase 4: User Story 2 - Clear Location and Brand Identity Resolution (Priority: P1)

**Goal**: Resolve entity fragmentation by correcting Redwood City name and removing old address references.

**Independent Test**: Verify Redwood City is named "Roots N' Wings Montessori by Kubo Montessori LLC" and no "Woodside" or "Norfolk" references remain on public routes.

### Implementation for User Story 2

- [x] T006 [P] [US2] Remove duplicate JSON-LD schema from the head fragment in `src/pages/rw.astro`.
- [x] T007 [US2] Rename Redwood City branding in `src/pages/index.astro` from "Roots N Wings Montessori of Woodside" to "Roots N' Wings Montessori by Kubo Montessori LLC".
- [x] T008 [US2] Update branding copy in `src/pages/rw.astro` to rename "Roots N Wings of Woodside by Kubo Montessori LLC" to "Roots N' Wings Montessori by Kubo Montessori LLC" and remove local "Woodside" references.
- [x] T009 [P] [US2] Verify all files are free from any references to `2131 S Norfolk St`.

**Checkpoint**: Redwood City branding and location coordinates are consistent across all main entry pages.

---

## Phase 5: User Story 3 - Neighborhood Landing Copy & Program Details (Priority: P2)

**Goal**: Create distinct copy-optimized landing details and student-teacher ratios.

**Independent Test**: Verify campus subpages and sections display correct ratios, TK details, and material lists.

### Implementation for User Story 3

- [x] T010 [US3] Update `src/pages/homedaycare.astro` with San Mateo student-teacher ratios (12:2), potty training support, and typical Montessori materials.
- [x] T011 [US3] Update `src/pages/rw.astro` with Redwood City student-teacher ratios (6:1), potty training support, infant/toddler details, and 20+ year local history.

**Checkpoint**: Neighborhood landing pages provide detailed classroom, ratio, and material facts.

---

## Phase 6: User Story 4 - AI-Ready Sitemap and Resources (Priority: P3)

**Goal**: Deploy specialized sitemap and Structured Parent Handbook.

**Independent Test**: Check `/ai-sitemap.xml` XML rendering and `/parent-handbook` page availability.

### Implementation for User Story 4

- [x] T012 [US4] Create dynamic sitemap generator endpoint in `src/pages/ai-sitemap.xml.ts` that outputs valid XML containing indexable high-value pages.
- [x] T013 [US4] Update configuration in `astro.config.mjs` to include the `/ai-sitemap.xml` URL in the generated `robots.txt` policy.
- [x] T014 [US4] Create the printable and highly indexable Parent Handbook HTML page at `src/pages/parent-handbook.astro` detailing schedules, age limits, food, and potty training policies.

**Checkpoint**: Specialized AI crawler routes and documentation are online and crawlable.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Quality verification and final build validation

- [x] T015 Run Astro build to ensure compilation is clean and sitemaps are generated: `npm run build`
- [x] T016 [P] Run Prettier/Linter code formatting check: `npx prettier --check src/`
- [x] T017 Perform schema verification on validator.schema.org for local generated markup.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately.
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories.
- **User Stories (Phase 3+)**: All depend on Foundational phase completion.
  - User stories can then proceed in parallel or sequentially.
- **Polish (Final Phase)**: Depends on all desired user stories being complete.

### Parallel Opportunities

- Setup tasks `T001` and `T002` can run in parallel.
- `T006` and `T009` under User Story 2 can run in parallel.
- Once Phase 2 is complete, US1, US2, US3, and US4 can be implemented in parallel.

---

## Implementation Strategy

### MVP First (User Stories 1 & 2)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL)
3. Complete Phase 3: User Story 1
4. Complete Phase 4: User Story 2
5. Validate and verify local build.
