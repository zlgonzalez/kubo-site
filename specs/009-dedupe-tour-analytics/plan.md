# Implementation Plan: Deduplicate Tour Booking Conversion Analytics

**Branch**: `009-dedupe-tour-analytics` | **Date**: November 12, 2026 | **Spec**: [spec.md](file:///Users/zlgonzalez/Documents/code/kubo/kubo-site/specs/009-dedupe-tour-analytics/spec.md)
**Input**: Feature specification from `/specs/009-dedupe-tour-analytics/spec.md`

## Summary

Eliminate duplicate and inflated `tour_booking_scheduled` GA4 conversion events in `src/utils/calendly-analytics.ts` while preserving valid booking tracking across `src/layouts/Layout.astro`:
1. **Booking Deduplication (`handleCalendlyMessage`)**: Extract a deterministic booking key from `payload.invitee.uri` (preferred) or `payload.event.uri` (fallback), tracked in both an in-memory `Set` and `window.sessionStorage` (with `try/catch` fallback to in-memory only). When neither URI is present, apply a 5-second time-window deduplication guard against repeated identical `calendly.event_scheduled` messages.
2. **Exclusive `gtag` Dispatch (`dispatchGAConversionEvent`)**: Emit `tour_booking_scheduled` exclusively via `window.gtag('event', 'tour_booking_scheduled', { event_category: 'engagement', event_label: 'Calendly Widget', value: 1 })`, removing the separate custom `window.dataLayer.push({ event: 'tour_booking_scheduled', ... })` object to prevent double-counting.
3. **Coexistence & Test Coverage**: Verify `initCalendlyAnalytics()`, `scheduleCalendlyBadge()`, and `openCalendlyPopup()` maintain a single active `message` listener per page, and update/expand `tests/unit/calendly-analytics.test.ts` and `tests/smoke.spec.ts` to cover mixed object + stringified duplicates, `sessionStorage` + in-memory fallback, the 5-second fallback window, distinct back-to-back bookings, and single-dispatch `gtag` verification.

## Technical Context

**Language/Version**: TypeScript (strict Astro/Vite bundling), HTML/Astro 7.0.3  
**Primary Dependencies**: Astro (`^7.0.3`), `@astrojs/tailwind`, Google Analytics 4 (`gtag.js`, ID `G-BE43SM2H4T`), Calendly external widget (`widget.js`)  
**Storage**: Client-side `window.sessionStorage` (keyed JSON array/set for session-scoped booking URIs) with in-memory `Set<string>` and `Map<string, number>` fallback  
**Testing**: Vitest (`^4.1.9`) for unit tests (`tests/unit/calendly-analytics.test.ts`), Playwright (`^1.61.1`) for E2E smoke tests (`tests/smoke.spec.ts`)  
**Target Platform**: Modern desktop and mobile browsers (Chrome, Safari, Firefox, iOS Safari, Android Chrome, in-app WebViews)  
**Project Type**: Static / SSG marketing website (Astro)  
**Performance Goals**: Zero additional network requests; O(1) in-memory deduplication check on `postMessage` events; no impact on LCP/INP  
**Constraints**: Must gracefully degrade when `sessionStorage` is unavailable or throws (`SecurityError` / `QuotaExceededError`); must preserve exact GA4 event name (`tour_booking_scheduled`) and parameters (`event_category`, `event_label`, `value`)  
**Scale/Scope**: Global layout (`src/layouts/Layout.astro`) + shared client utility (`src/utils/calendly-analytics.ts`) + unit & smoke test suites

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

The repository `.specify/memory/constitution.md` is currently unconfigured (template placeholders only). No project-specific constitutional gates block this change. Standard code quality, test-first verification, and minimal blast-radius practices apply.

## Project Structure

### Documentation (this feature)

```text
specs/009-dedupe-tour-analytics/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   └── analytics-event.json
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
src/
├── layouts/
│   └── Layout.astro             # Global head with gtag.js + initCalendlyAnalytics() & scheduleCalendlyBadge()
└── utils/
    └── calendly-analytics.ts    # Message listener, URI/time-window deduplication, exclusive gtag dispatch

tests/
├── unit/
│   └── calendly-analytics.test.ts  # Unit tests for deduplication, storage fallback, and single gtag dispatch
└── smoke.spec.ts                   # Playwright E2E smoke tests for Calendly + GA4 tracking
```

**Structure Decision**: Single Astro web project structure. All analytics and deduplication logic resides in `src/utils/calendly-analytics.ts`, initialized once globally in `src/layouts/Layout.astro`.

## Complexity Tracking

No constitution violations or architectural complexity exceptions required.
