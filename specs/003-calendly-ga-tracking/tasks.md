# Tasks: Calendly Tour Booking Analytics Tracking

**Input**: Design documents from `/specs/003-calendly-ga-tracking/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, quickstart.md

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2)
- Exact file paths included in all task descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and helper structure

- [ ] T001 Create utility directory and module structure for tracking in src/utils/calendly-analytics.ts

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core helper types and message listening skeleton

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T002 Implement event payload interfaces and origin validation regex in src/utils/calendly-analytics.ts
- [ ] T003 Implement safe Google Analytics / dataLayer helper dispatchers in src/utils/calendly-analytics.ts

**Checkpoint**: Core analytics utilities ready - user story implementation and testing can now begin

---

## Phase 3: User Story 1 - Automatic Tour Booking Conversion Tracking (Priority: P1) 🎯 MVP

**Goal**: Automatically capture Calendly booking completion events and dispatch conversion events to Google Analytics (`G-BE43SM2H4T`).

**Independent Test**: Simulate or execute a Calendly booking event in browser context and confirm `window.dataLayer` captures `{ event: 'tour_booking_scheduled' }`.

### Tests for User Story 1 (Requested TDD approach) ⚠️

> **NOTE: Write these tests FIRST, ensure they fail before implementation**

- [ ] T004 [P] [US1] Create unit test in tests/unit/calendly-analytics.test.ts to test postMessage handler with simulated calendly.event_scheduled payload
- [ ] T005 [P] [US1] Add E2E Playwright test assertion in tests/smoke.spec.ts to verify window.dataLayer captures tour_booking_scheduled

### Implementation for User Story 1

- [ ] T006 [US1] Implement initCalendlyAnalytics event listener in src/utils/calendly-analytics.ts to capture calendly.event_scheduled events and trigger GA calls
- [ ] T007 [US1] Import and initialize initCalendlyAnalytics script in src/layouts/Layout.astro alongside existing Calendly widget setup
- [ ] T008 [US1] Run unit tests (npm run test:unit) and E2E tests (npm run test:e2e) to verify User Story 1 passes

**Checkpoint**: At this point, User Story 1 (MVP) is fully functional and verified by tests.

---

## Phase 4: User Story 2 - Zero Additional Subscription Cost Guarantee (Priority: P2)

**Goal**: Guarantee client-side execution to ensure $0 additional software subscription costs.

**Independent Test**: Verify through tests and code inspection that all tracking logic executes purely client-side via postMessage without external webhooks.

### Tests for User Story 2 ⚠️

- [ ] T009 [P] [US2] Add unit tests in tests/unit/calendly-analytics.test.ts verifying non-booking messages and invalid origins are safely ignored without network calls

### Implementation for User Story 2

- [ ] T010 [US2] Add strict origin and payload validation checks in src/utils/calendly-analytics.ts to ignore non-Calendly postMessages
- [ ] T011 [US2] Verify test suite (make test) passes cleanly with 0 console errors or network dependencies

**Checkpoint**: User Stories 1 AND 2 are both fully complete and independently testable.

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Final verification and documentation

- [ ] T012 Run full validation suite (make test) ensuring unit, E2E, and Lighthouse CI tests pass
- [ ] T013 Validate verification steps outlined in specs/003-calendly-ga-tracking/quickstart.md

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Foundational completion
- **User Story 2 (Phase 4)**: Depends on Foundational completion & User Story 1
- **Polish (Phase 5)**: Depends on all user stories complete

### Parallel Opportunities

- T004 and T005 (US1 tests) can run in parallel
- T009 (US2 tests) can run in parallel

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1 (Setup) & Phase 2 (Foundational)
2. Complete Phase 3 (User Story 1) - Write tests T004/T005 first, implement T006/T007, verify T008
3. **STOP and VALIDATE**: Test MVP independently via `npm test`
