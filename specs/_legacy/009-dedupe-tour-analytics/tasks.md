# Tasks: Deduplicate Tour Booking Conversion Analytics

**Input**: Design documents from `/specs/009-dedupe-tour-analytics/`
**Prerequisites**: `plan.md` (required), `spec.md` (required), `research.md`, `data-model.md`, `contracts/analytics-event.json`, `quickstart.md`

**Tests**: Automated unit and Playwright smoke tests are explicitly required by `FR-007` in `spec.md`.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., `US1`, `US2`, `US3`)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Establish baseline test status and review existing analytics dispatch/test assertions before modifying behavior.

- [X] T001 Verify baseline unit tests and build pass before changes via `npm run test:unit` and `npm run build` in `package.json`
- [X] T002 [P] Audit existing `dataLayer` and `gtag` assertions in `tests/unit/calendly-analytics.test.ts` and `tests/smoke.spec.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared deduplication constants and deterministic test-isolation helpers required by all user stories.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [X] T003 Add deduplication constants (`CALENDLY_DEDUPE_STORAGE_KEY`, `CALENDLY_DEDUPE_MAX_URIS = 50`, `CALENDLY_FALLBACK_DEDUPE_WINDOW_MS = 5000`) and in-memory `processedBookingUris` (`Set<string>`) / `recentFallbackDispatches` (`Map<string, number>`) state in `src/utils/calendly-analytics.ts`
- [X] T004 Export `resetCalendlyDeduplicationForTests()` helper (and clear in-memory deduplication state cleanly) in `src/utils/calendly-analytics.ts`

**Checkpoint**: Foundation ready — user story implementation can now begin.

---

## Phase 3: User Story 1 - Accurate One-to-One Tour Booking Conversion Counting (Priority: P1) 🎯 MVP

**Goal**: Deduplicate incoming `calendly.event_scheduled` `postMessage` notifications by `invitee.uri` / `event.uri` (persisted in `sessionStorage` + in-memory `Set` with graceful fallback) and suppress rapid duplicate identical payloads within 5 seconds when URIs are absent.

**Independent Test**: Simulate duplicate `calendly.event_scheduled` notifications (identical URI, mixed object + JSON-stringified payloads, and rapid repeats without URIs) and verify only one conversion is dispatched, while distinct URIs dispatch separately.

### Tests for User Story 1

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [X] T005 [P] [US1] Add unit tests for URI deduplication (`invitee.uri`, `event.uri`, mixed object + JSON string, `sessionStorage` persistence, `sessionStorage` error fallback, distinct back-to-back URIs) in `tests/unit/calendly-analytics.test.ts`
- [X] T006 [P] [US1] Add unit tests for 5-second fallback deduplication window when URIs are absent (suppressed `< 5000ms`, allowed `>= 5000ms` via fake timers) in `tests/unit/calendly-analytics.test.ts`
- [X] T007 [P] [US1] Add Playwright smoke test verifying duplicate object + JSON-stringified `calendly.event_scheduled` messages with the same `invitee.uri` produce only one conversion in `tests/smoke.spec.ts`

### Implementation for User Story 1

- [X] T008 [US1] Implement `extractBookingDedupeKey()`, `hasProcessedBookingUri()`, and `markProcessedBookingUri()` with `try/catch` `window.sessionStorage` persistence (capped at 50 entries) in `src/utils/calendly-analytics.ts`
- [X] T009 [US1] Implement 5-second fallback fingerprint deduplication (`shouldSuppressFallbackDuplicate()`) and integrate URI + fallback checks into `handleCalendlyMessage()` in `src/utils/calendly-analytics.ts`

**Checkpoint**: User Story 1 is independently functional and passes its unit & smoke tests.

---

## Phase 4: User Story 2 - Single-Dispatch Conversion Reporting Without Double-Counting (Priority: P2)

**Goal**: Emit `tour_booking_scheduled` exclusively via `window.gtag('event', 'tour_booking_scheduled', { event_category: 'engagement', event_label: 'Calendly Widget', value: 1 })` without pushing a separate custom `{ event: 'tour_booking_scheduled' }` object to `window.dataLayer`.

**Independent Test**: Trigger a single valid booking completion and verify `window.gtag` is called once with the exact event name and parameters from `specs/009-dedupe-tour-analytics/contracts/analytics-event.json`, with no separate custom `dataLayer` object pushed.

### Tests for User Story 2

- [X] T010 [P] [US2] Update and add unit tests verifying `dispatchGAConversionEvent()` calls `window.gtag('event', 'tour_booking_scheduled', { event_category: 'engagement', event_label: 'Calendly Widget', value: 1 })` exclusively and does not push a custom `{ event: 'tour_booking_scheduled' }` object to `window.dataLayer` in `tests/unit/calendly-analytics.test.ts`
- [X] T011 [P] [US2] Update Playwright smoke test assertions to verify `window.dataLayer` receives exactly one `gtag` `event` command entry for `tour_booking_scheduled` per booking (and zero standalone custom event objects) in `tests/smoke.spec.ts`

### Implementation for User Story 2

- [X] T012 [US2] Update `dispatchGAConversionEvent()` to call `window.gtag('event', GA_CONVERSION_EVENT, ...)` exclusively, remove the separate `window.dataLayer.push(eventData)` call, and clean up or update `GAConversionEventPayload` and any remaining references in `src/utils/calendly-analytics.ts`

**Checkpoint**: User Stories 1 and 2 both work independently with single-dispatch semantics.

---

## Phase 5: User Story 3 - Conflict-Free Coexistence of Floating Badge and In-Page Popups (Priority: P3)

**Goal**: Ensure having both `scheduleCalendlyBadge()` and `openCalendlyPopup()` active on the same page maintains a single `window` `message` listener and emits at most one conversion per booking.

**Independent Test**: Load a page with both the floating badge scheduler and an in-page CTA button active, trigger a booking completion, and verify only one `tour_booking_scheduled` event is dispatched.

### Tests & Verification for User Story 3

- [X] T013 [P] [US3] Add unit test verifying `initCalendlyAnalytics()` + `scheduleCalendlyBadge()` + `openCalendlyPopup()` register only one `message` listener and dispatch once for a booking in `tests/unit/calendly-analytics.test.ts`
- [X] T014 [P] [US3] Verify Playwright smoke test on `/san-mateo-preschool-daycare/` and `/contact/` with both badge and popup active asserts single `tour_booking_scheduled` dispatch per booking in `tests/smoke.spec.ts`
- [X] T015 [US3] Audit `src/layouts/Layout.astro` to confirm `initCalendlyAnalytics()` and `scheduleCalendlyBadge()` are invoked once per page without duplicate listener registration

**Checkpoint**: All three user stories are independently functional and verified.

---

## Phase 6: Polish & Cross-Cutting Verification

**Purpose**: Full build and end-to-end validation across unit and Playwright test suites.

- [X] T016 Run full unit test suite (`npm run test:unit`) and fix any regressions
- [X] T017 Run production build and Playwright E2E smoke suite (`npm run build && npm run test:e2e`) per `specs/009-dedupe-tour-analytics/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: Can start immediately.
- **Phase 2 (Foundational)**: Depends on Phase 1 — blocks all user story implementation.
- **Phase 3 (US1 - P1)**: Depends on Phase 2.
- **Phase 4 (US2 - P2)**: Depends on Phase 2 (can be implemented in parallel with US1 in `src/utils/calendly-analytics.ts`, or sequentially right after US1).
- **Phase 5 (US3 - P3)**: Depends on US1 and US2 test assertions being aligned.
- **Phase 6 (Polish)**: Depends on all user stories being complete.

### Parallel Opportunities

- Within **US1**: `T005`, `T006`, and `T007` can be authored in parallel before `T008`–`T009`.
- Within **US2**: `T010` and `T011` can be updated in parallel with `T012`.
- Within **US3**: `T013`, `T014`, and `T015` can run in parallel.

### Implementation Strategy

1. Complete **Phase 1–2** to establish baseline and deduplication primitives.
2. Deliver **US1 (P1)** as the MVP to stop duplicate `calendly.event_scheduled` processing immediately.
3. Deliver **US2 (P2)** to eliminate dual `dataLayer.push` + `gtag` dispatch.
4. Deliver **US3 (P3)** and **Phase 6** to verify full-suite green status (`npm run test:unit` + `npm run build && npm run test:e2e`).
