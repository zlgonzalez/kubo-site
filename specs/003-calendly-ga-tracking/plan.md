# Implementation Plan: Calendly Tour Booking Analytics Tracking

**Branch**: `003-calendly-ga-tracking` | **Date**: June 28, 2026 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/003-calendly-ga-tracking/spec.md`

## Summary

Implement client-side event listening for Calendly embedded widget events to send conversion tracking data to Google Analytics (`G-BE43SM2H4T`) whenever a prospective parent schedules a tour. This architecture operates entirely through browser `window.postMessage` interception, guaranteeing zero additional subscription costs or platform upgrades on Calendly's $8/month basic tier. Comprehensive unit and Playwright E2E tests will explicitly validate event capturing and dispatching.

## Technical Context

**Language/Version**: TypeScript / JavaScript (Astro v7.0.3)  
**Primary Dependencies**: Astro v7, Tailwind CSS v3  
**Storage**: N/A (Client-side browser events)  
**Testing**: Vitest v4.1.9 (Unit/Component), Playwright v1.61.1 (E2E), Lighthouse CI  
**Target Platform**: Modern Web Browsers (Desktop & Mobile)  
**Project Type**: Static Web Application (Astro)  
**Performance Goals**: Zero impact on page load time or interactive thread (<5ms message handling execution time)  
**Constraints**: $0 additional subscription cost; client-side only; robust error handling if analytics/ad-blockers fail  
**Scale/Scope**: All pages embedding Calendly widgets (`Layout.astro`, `parent-handbook.astro`, etc.)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Library-First & Self-Contained**: Utility function for Calendly analytics tracking encapsulated cleanly in a modular script/helper. (PASSED)
- **Test-First (NON-NEGOTIABLE)**: Explicit unit and E2E test suites designed and verified to capture conversion events before and during implementation. (PASSED)
- **Integration Testing**: Playwright E2E tests validating window postMessage events and `dataLayer` pushes. (PASSED)
- **Simplicity & YAGNI**: No unnecessary backend or third-party webhooks; relies directly on standard web APIs. (PASSED)

## Project Structure

### Documentation (this feature)

```text
specs/003-calendly-ga-tracking/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code & Test Layout

```text
src/
├── utils/
│   └── calendly-analytics.ts    # Standalone event listener logic for Calendly postMessage & GA dispatch
├── layouts/
│   └── Layout.astro             # Global layout where Calendly & GA scripts are initialized

tests/
├── unit/
│   └── calendly-analytics.test.ts # Explicit unit tests mocking window.postMessage & verifying GA calls
└── smoke.spec.ts                # Playwright E2E tests validating event capturing in browser runtime
```

**Structure Decision**: Single Astro web application layout. The tracking listener logic will be placed in a clean utility module (`src/utils/calendly-analytics.ts`) imported into `Layout.astro` and tested via dedicated Vitest unit tests and Playwright smoke tests.

## Explicit Testing Architecture & Verification Plan

As requested, the test plan explicitly targets capturing the Calendly booking event:

1. **Unit Tests (`tests/unit/calendly-analytics.test.ts`)**:
   - Test registration of the window `message` event listener.
   - Test dispatching a valid `calendly.event_scheduled` event and asserting `window.gtag` and `window.dataLayer.push` receive `{ event: 'tour_booking_scheduled', event_category: 'engagement', event_label: 'Calendly Widget' }`.
   - Test ignoring unrelated window messages (e.g., random cross-origin messages or non-booking Calendly events).
   - Test safety and zero-throw execution when `window.gtag` or `window.dataLayer` is undefined.

2. **E2E Tests (`tests/smoke.spec.ts`)**:
   - Add a dedicated test block in Playwright E2E test suite.
   - Load homepage/pages with Calendly widget.
   - Trigger a simulated Calendly booking postMessage event in the active page context.
   - Assert that `window.dataLayer` array contains the expected conversion event.
