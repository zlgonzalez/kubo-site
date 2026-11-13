# Technical Research: Deduplicate Tour Booking Conversion Analytics

**Feature**: `009-dedupe-tour-analytics`  
**Date**: November 12, 2026  

## 1. Booking Identity Extraction & Session Deduplication

### Decision
Extract a canonical booking key from `CalendlyEventPayload.payload` in `handleCalendlyMessage`:
1. Prefer `payload.invitee.uri` (trimmed non-empty string).
2. Fall back to `payload.event.uri` (trimmed non-empty string) if `invitee.uri` is absent.
3. Track processed URIs in an in-memory `Set<string>` **and** persist them in `window.sessionStorage` under a bounded key (e.g., `kubo_processed_calendly_bookings`, capped at a safe maximum like 50 entries) wrapped in `try/catch` so private browsing or restricted WebViews fall back cleanly to the in-memory `Set`.

### Rationale
- `invitee.uri` uniquely identifies a single invitee's scheduled booking even if Calendly emits `calendly.event_scheduled` multiple times (e.g., as both a native object and a JSON string, or across badge/popup widget layers).
- Persisting in `sessionStorage` prevents duplicate counting if the parent reloads or navigates back within the same tab session.
- Wrapping `sessionStorage` access in `try/catch` ensures zero runtime errors in strict privacy browsers.

### Alternatives Considered
- *In-memory `Set` only*: Loses deduplication across page reloads/navigations in the same tab.
- *`localStorage`*: Persists indefinitely across sessions, which is unnecessary and could risk stale state if a user books again weeks later (though URIs are unique, `sessionStorage` is cleaner and auto-clears).

---

## 2. Fallback 5-Second Time-Window Guard (Missing URIs)

### Decision
When a valid `calendly.event_scheduled` message has neither `payload.invitee.uri` nor `payload.event.uri`, compute a lightweight fingerprint from the normalized payload (e.g., `JSON.stringify(rawData)`) and record its timestamp in an in-memory `Map<string, number>`. Suppress identical repeats arriving within `5000` ms (`DEDUPE_WINDOW_MS = 5000`), and allow subsequent dispatches once 5 seconds have elapsed.

### Rationale
- Clarified in `FR-003`: 5 seconds is long enough to absorb duplicate `postMessage` bursts (object + stringified pair or widget re-broadcast) for a single submission, while allowing legitimate separate bookings later in the session.

### Alternatives Considered
- *Permanent suppression without URIs*: Would block legitimate second bookings in test or multi-child scenarios where payloads omit URIs.
- *No fallback guard*: Leaves URI-less payloads vulnerable to double-firing.

---

## 3. Exclusive `gtag('event', ...)` Dispatch

### Decision
Update `dispatchGAConversionEvent()` in `src/utils/calendly-analytics.ts` to call `window.gtag('event', GA_CONVERSION_EVENT, { event_category: 'engagement', event_label: 'Calendly Widget', value: 1 })` exclusively, removing the separate `window.dataLayer.push({ event: GA_CONVERSION_EVENT, ... })` object.

### Rationale
- Clarified in `FR-004`: `Layout.astro` initializes `window.dataLayer` and `window.gtag = function() { dataLayer.push(arguments); }` before loading `gtag.js` (`G-BE43SM2H4T`). Calling `gtag('event', ...)` pushes the standard `Arguments` command array to `dataLayer` and sends a single GA4 hit, eliminating the risk of double-counting if GTM or custom `dataLayer` triggers are ever active.
- Existing unit and Playwright smoke tests that inspected `window.dataLayer` for `{ event: 'tour_booking_scheduled' }` will be updated to inspect `window.gtag` calls and/or `window.dataLayer` command arrays (`args[0] === 'event' && args[1] === 'tour_booking_scheduled'`).

### Alternatives Considered
- *Keep `dataLayer.push` as fallback when `gtag` is undefined*: Unnecessary because `Layout.astro` always defines `window.gtag` synchronously in `<head>`, and keeping a dual path risks accidental double-counting in tests/production.

---

## 4. Testability & Coexistence Verification

### Decision
Export a deterministic test-reset helper (e.g., `resetCalendlyDeduplicationForTests()` or reset inside `cleanup()` / dedicated helper) so Vitest unit tests can isolate state between cases, and verify in `tests/unit/calendly-analytics.test.ts` and `tests/smoke.spec.ts` that `initCalendlyAnalytics()` + `scheduleCalendlyBadge()` + `openCalendlyPopup()` only register one `message` listener.

### Rationale
- Module-level `Set` / `Map` state persists across unit tests in the same Vitest worker unless explicitly cleared.
