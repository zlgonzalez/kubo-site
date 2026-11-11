# Implementation Plan: Restore Tour Booking Analytics Tracking

**Branch**: `008-fix-tour-analytics` | **Date**: October 28, 2026 | **Spec**: [spec.md](./spec.md)  
**Input**: Feature specification from `/specs/008-fix-tour-analytics/spec.md`

## Summary

Restore reliable Google Analytics tracking for the `tour_booking_scheduled` conversion event across the Kubo Montessori website. The implementation fixes a silent payload drop for stringified Calendly `postMessage` events, replaces the deferred `requestIdleCallback` loader with standard asynchronous `<script async>` in `<head>` for immediate `gtag.js` readiness, eliminates a potential race condition in `openCalendlyPopup` when scripts are already loaded, and points Google Search `ReserveAction` schema markup to the tracked on-site contact page.

## Technical Context

**Language/Version**: TypeScript / JavaScript (Astro v7.0.3 / Node.js 22+)  
**Primary Dependencies**: Astro v7, Tailwind CSS v3, Calendly Embed API, Google Analytics 4 (`gtag.js`)  
**Storage**: N/A (Client-side browser events and GA4 data layer)  
**Testing**: Vitest (Unit tests), Playwright (E2E / Smoke tests)  
**Target Platform**: Modern Web Browsers (Chrome, Safari, Firefox, Edge, Mobile WebViews)  
**Project Type**: Static Web Application (Astro SSG)  
**Performance Goals**: Core Web Vitals LCP < 2.5s; postMessage processing execution < 5ms  
**Constraints**: $0 additional subscription cost (zero paid Calendly webhook dependencies); client-side only; robust error handling for ad-blockers  
**Scale/Scope**: Site-wide (`Layout.astro`, `src/utils/calendly-analytics.ts`, `SEO.astro`, all campus CTA buttons)

## Engineering Principles Check

*Note: `.specify/memory/constitution.md` is currently an unpopulated template; alignment is verified against project development standards and `AGENTS.md`.*

- **Library-First & Self-Contained**: Calendly popup/badge loading, UTM forwarding, and `postMessage` analytics handling are encapsulated in `src/utils/calendly-analytics.ts`. (PASSED)
- **Test-First & Complete Coverage**: Vitest unit tests in `tests/unit/calendly-analytics.test.ts` validate object and stringified JSON payloads, URL/origin hardening, and `openCalendlyPopup` script ready-state and fallback paths. (PASSED)
- **Integration Testing**: Playwright smoke tests in `tests/smoke.spec.ts` validate `gtag.js` head loading, pre-idle conversion capture, all 3 `ReserveAction` targets, popup triggers across campus and contact pages, and script-error fallback. (PASSED)
- **Simplicity & YAGNI**: No heavy third-party packages or server infrastructure; uses standard web APIs (`window.postMessage`, `JSON.parse`, `URL`, `gtag`). (PASSED)

## Project Structure

### Documentation (this feature)

```text
specs/008-fix-tour-analytics/
├── spec.md              # Feature specification (/speckit.specify)
├── plan.md              # This file (/speckit.plan command output)
├── tasks.md             # Ordered implementation tasks (/speckit.tasks)
├── research.md          # Technical research & decisions (Phase 0 output)
├── data-model.md        # Event payload schemas & state transitions (Phase 1 output)
├── quickstart.md        # Testing and verification instructions (Phase 1 output)
├── contracts/           # Event schema contract definition
│   └── analytics-event.json
└── checklists/
    └── requirements.md  # Spec quality checklist
```

### Source Code Layout

```text
src/
├── layouts/
│   └── Layout.astro             # Global layout with standard gtag.js in <head> & targetCity prop forwarding
├── utils/
│   └── calendly-analytics.ts    # Robust postMessage listener, badge scheduler & popup widget launcher
├── components/
│   ├── SEO.astro                # ReserveAction schema targeting tracked on-site URL & escaped JSON-LD
│   └── FAQSection.astro         # Escaped FAQ JSON-LD structured data
├── pages/
│   └── ai-sitemap.xml.ts        # Includes /contact/ and XML entity escaping

public/
└── .htaccess                    # Baseline HTTP security/privacy headers

tests/
├── unit/
│   ├── calendly-analytics.test.ts # Vitest unit suite covering payloads, validation, lifecycle & fallbacks
│   └── sitemap.test.ts            # Unit suite verifying canonical routes, /contact/, and 301 trailing slashes
└── smoke.spec.ts                  # Playwright E2E verification
```

**Structure Decision**: Static Astro website architecture. Changes are contained within existing modular utility files and the root layout, preserving project organization without introducing new layers.

---

## Planned Implementation Phases

### Phase 1: Robust Event Ingestion (`src/utils/calendly-analytics.ts`)
- Update `handleCalendlyMessage` to safely inspect `typeof event.data`.
- Parse stringified JSON payloads with `try / catch`, discarding non-JSON strings cleanly.
- Verify `data.event === CALENDLY_BOOKING_EVENT` and dispatch `tour_booking_scheduled`.
- Update `openCalendlyPopup` to safely launch widget even if `widget.js` is already appended or loaded.

### Phase 2: Analytics Tag Reliability (`src/layouts/Layout.astro`)
- Transition Google Tag (`gtag.js`) from deferred `requestIdleCallback` to standard asynchronous `<script async fetchpriority="low" src="https://www.googletagmanager.com/gtag/js?id=G-BE43SM2H4T"></script>` in `<head>`.
- Initialize `window.dataLayer = window.dataLayer || [];` and `window.gtag = window.gtag || function() { dataLayer.push(arguments); };` immediately in `<head>`.
- Delegate Calendly floating badge scheduling (`scheduleCalendlyBadge`) into `src/utils/calendly-analytics.ts` and forward `targetCity` to `SEO.astro`.

### Phase 3: Organic Funnel & Hardening (`src/components/SEO.astro`, `FAQSection.astro`, `ai-sitemap.xml.ts`, `public/.htaccess`)
- Update `ReserveAction` schema markup `target` property to `${siteOrigin}/contact/` (`https://www.kubomontessori.com/contact/` in production).
- Escape `<` in JSON-LD `set:html`, include `/contact/` with XML entity escaping (`escapeXml`) in `ai-sitemap.xml.ts`, and configure baseline security/privacy headers (`X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`) in `public/.htaccess`.

### Phase 4: Test Suite & Verification (`tests/unit/calendly-analytics.test.ts`)
- Add unit test cases for stringified JSON payloads from `https://calendly.com`.
- Add unit test cases for malformed JSON strings (must not throw).
- Add unit test cases verifying `openCalendlyPopup` script handling.
- Verify all unit and smoke tests pass.
