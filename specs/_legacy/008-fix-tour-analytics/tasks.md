# Tasks: Restore Tour Booking Analytics Tracking

**Input**: Design documents from `/specs/008-fix-tour-analytics/` (`spec.md`, `plan.md`, `research.md`, `data-model.md`, `contracts/`, `quickstart.md`)  
**Prerequisites**: `plan.md` (required), `spec.md` (required for user stories), `research.md`, `data-model.md`, `contracts/`  
**Tests**: Unit tests (Vitest) and E2E tests (Playwright) are included per feature requirements.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `- [ ] [TaskID] [P?] [Story] Description with file path`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (`US1`, `US2`, `US3`)
- Includes exact file paths in every task description

---

## Phase 1: Setup

**Purpose**: Establish test baseline and verification harness

- [X] T001 Verify existing Vitest test harness and mocks in tests/unit/calendly-analytics.test.ts

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Ensure core TypeScript types and payload contracts are defined before story implementation

- [X] T002 Update TypeScript interfaces (`CalendlyEventPayload`, `GAConversionEventPayload`, and `Window` globals) in src/utils/calendly-analytics.ts

---

## Phase 3: User Story 1 - Reliable In-Page Tour Booking Conversion Capture (Priority: P1) 🎯 MVP

**Goal**: Ensure all in-page Calendly tour bookings trigger `tour_booking_scheduled` in GA4, safely parsing both stringified and object postMessage payloads and resolving popup script loading race conditions.

**Independent Test**: Simulate both object and stringified `calendly.event_scheduled` window messages and assert `window.dataLayer` and `window.gtag` receive `tour_booking_scheduled`.

### Tests for User Story 1

> **NOTE: Write these tests FIRST, ensure they fail before implementation**

- [X] T003 [P] [US1] Add unit tests for stringified JSON payloads, malformed strings, and script ready states in tests/unit/calendly-analytics.test.ts

### Implementation for User Story 1

- [X] T004 [US1] Implement safe JSON string parsing and object validation in `handleCalendlyMessage` in src/utils/calendly-analytics.ts
- [X] T005 [US1] Harden script ready-state checking and fallback launch logic in `openCalendlyPopup` in src/utils/calendly-analytics.ts

**Checkpoint**: User Story 1 is functional and verifiable independently via `tests/unit/calendly-analytics.test.ts`.

---

## Phase 4: User Story 2 - Resilient Client-Side Analytics Dispatch & Initialization (Priority: P2)

**Goal**: Guarantee Google Tag (`gtag.js`) is loaded reliably via `<head>` asynchronous script tag, eliminating race conditions caused by `requestIdleCallback` timeouts.

**Independent Test**: Verify that `googletagmanager.com/gtag/js?id=G-BE43SM2H4T` is defined in `<head>` and conversion calls made immediately on page load are flushed to GA4 without delays.

### Implementation for User Story 2

- [X] T006 [US2] Move `googletagmanager.com/gtag/js` loading to `<script async fetchpriority="low">` in `<head>`, initialize dataLayer/gtag immediately, and delegate badge scheduling to `scheduleCalendlyBadge` in src/layouts/Layout.astro
- [X] T007 [US2] Update E2E smoke tests for immediate page-load event capture in tests/smoke.spec.ts

**Checkpoint**: User Stories 1 AND 2 are both operational and validated.

---

## Phase 5: User Story 3 - On-Site Funnel for Organic Search Reserve Actions (Priority: P3)

**Goal**: Route prospective parents using Google Search `ReserveAction` structured data to on-site tracked landing pages rather than external `calendly.com` URLs.

**Independent Test**: Verify JSON-LD output in campus schema contains `potentialAction.target` pointing to `https://www.kubomontessori.com/contact/`.

### Implementation for User Story 3

- [X] T008 [P] [US3] Update `ReserveAction` schema target URL to `https://www.kubomontessori.com/contact/` in src/components/SEO.astro
- [X] T009 [US3] Add test assertion verifying `ReserveAction` target points to on-site contact page in tests/smoke.spec.ts

**Checkpoint**: All three user stories are implemented and testable.

---

## Phase 6: Polish & Verification

**Purpose**: End-to-end verification and documentation

- [X] T010 [P] Update verification guide with GA4 Key Event troubleshooting steps in specs/008-fix-tour-analytics/quickstart.md
- [X] T011 Run full test suite (Vitest and Playwright smoke tests) to verify clean pass across all scenarios

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately.
- **Foundational (Phase 2)**: Depends on Phase 1 completion - BLOCKS User Stories.
- **User Story 1 (Phase 3)**: Depends on Foundational completion.
- **User Story 2 (Phase 4)**: Depends on Foundational completion; integrates with User Story 1.
- **User Story 3 (Phase 5)**: Depends on Foundational completion; can proceed in parallel with US2.
- **Polish (Phase 6)**: Depends on all user stories being complete.

### User Story Dependencies

- **User Story 1 (P1)**: Independent of other stories.
- **User Story 2 (P2)**: Operates on layout tag loading; complements US1 postMessage listener.
- **User Story 3 (P3)**: Operates on `SEO.astro`; independent of US1 and US2 implementation.

### Parallel Opportunities

- T003 (US1 unit tests) and T008 (US3 schema update) can run in parallel.
- T010 (documentation polish) can run in parallel with final verification checks.

---

## Parallel Example: User Story 1 & User Story 3

```bash
# Launch test creation for US1 and schema target update for US3 in parallel:
Task: "Add unit tests for stringified JSON payloads in tests/unit/calendly-analytics.test.ts"
Task: "Update ReserveAction schema target URL in src/components/SEO.astro"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1 (Setup) and Phase 2 (Foundational).
2. Write unit tests for User Story 1 (`T003`).
3. Implement `handleCalendlyMessage` fix and `openCalendlyPopup` hardening (`T004`, `T005`).
4. **STOP and VALIDATE**: Run `npx vitest run tests/unit/calendly-analytics.test.ts` to confirm 100% pass.

### Incremental Delivery

1. Foundation ready (Phases 1 & 2).
2. Deliver US1 (In-page postMessage fix & popup ready-state hardening) -> MVP complete!
3. Deliver US2 (Standard `<head>` async tag loading in `Layout.astro`).
4. Deliver US3 (Organic search schema funnel in `SEO.astro`).
5. Deliver Polish (Full verification and quickstart updates).
