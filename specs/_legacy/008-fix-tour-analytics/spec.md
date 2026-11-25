# Feature Specification: Restore Tour Booking Analytics Tracking

**Feature Branch**: `008-fix-tour-analytics`  
**Created**: October 28, 2026  
**Status**: Implemented (Ready for Review)  
**Input**: User description: "The tour_booking_scheduled is no longer showing up in analytics.google.com website. Analyze the code base and explore why. Ensure you are using codegraph first to analyze the code base before looking at the entire codebase"

## Clarifications

### Session 2026-10-28

- Q: How should the Google Tag (`gtag.js`) script be loaded to ensure reliable event capture? → A: Option A (Standard `<script async>` in `<head>` to guarantee 100% tag readiness and eliminate idle-callback race conditions).
- Q: How should the Google Search `ReserveAction` structured data target be handled? → A: Option A (Update `ReserveAction` target to `https://www.kubomontessori.com/contact/` so Google Search visitors land on-site with full GA4 tracking).
- Q: Should additional campus attribution parameters be added to `tour_booking_scheduled`? → A: Option B (Keep existing event parameters exactly as-is: `event_category`, `event_label`, and `value` without adding extra campus properties to maintain strict schema consistency).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Reliable In-Page Tour Booking Conversion Capture (Priority: P1)

As a preschool director and site owner, when prospective parents complete a tour booking via Calendly (whether through the floating widget or in-page CTA links across any device/browser), I want the system to reliably record the `tour_booking_scheduled` conversion event in Google Analytics so that our marketing and enrollment acquisition channels are accurately tracked.

**Why this priority**: Tour bookings are the primary business conversion action on the site. If conversions are not recorded in Google Analytics (`analytics.google.com`), marketing attribution, enrollment forecasting, and ad campaign performance are blind.

**Independent Test**: Can be tested by opening the site on desktop and mobile browsers, initiating a booking flow from both the floating badge widget and in-page CTA buttons, completing the simulated or real booking event, and verifying that the `tour_booking_scheduled` event is immediately registered in GA4 Realtime and DebugView.

**Acceptance Scenarios**:

1. **Given** a parent completes a tour booking in the embedded Calendly widget, **When** Calendly emits a completion notification (whether formatted as a parsed object or stringified JSON payload), **Then** the event listener successfully parses the payload and dispatches `tour_booking_scheduled` to Google Analytics without errors.
2. **Given** a parent clicks any "Schedule a Campus Tour" link on the site, **When** the Calendly third-party script is either loading, already loaded, or delayed, **Then** the popup opens smoothly with UTM marketing parameters preserved and does not fail silently or lose tracking capability.
3. **Given** an analytics administrator views `analytics.google.com`, **When** a booking event occurs, **Then** the event appears in the Realtime overview and is recognized under Events/Key Events.

---

### User Story 2 - Resilient Client-Side Analytics Dispatch & Initialization (Priority: P2)

As a site visitor and site owner, I want Google Analytics tracking scripts and event listeners to load reliably using standard asynchronous `<script async>` in `<head>` without artificial delays or dependency on `requestIdleCallback` timeouts so that bookings completed quickly after page load are never dropped.

**Why this priority**: Deferring analytics script loading with aggressive idle callbacks (`requestIdleCallback` + `setTimeout(1000)`) risks dropping conversion events if visitors book or navigate before the script finishes loading.

**Independent Test**: Can be verified by triggering a booking event immediately upon initial page render before idle timeouts elapse, ensuring the analytics queue transmits the conversion payload once connectivity/tags are established.

**Acceptance Scenarios**:

1. **Given** a visitor interacts with the booking modal immediately upon page load, **When** the conversion event fires, **Then** `gtag.js` is already loaded or active via `<head>` `async` script loading, ensuring the conversion event transmits to Google Analytics immediately without race conditions.

---

### User Story 3 - On-Site Funnel for Organic Search Reserve Actions (Priority: P3)

As a site owner, I want prospective parents discovering Kubo Montessori via Google Search rich results (ReserveAction) to land on the website's contact and tour booking page rather than leaving directly to Calendly, ensuring that organic search tour bookings are captured by our on-site conversion tracking.

**Why this priority**: When parents book directly through external Google Search actions on `calendly.com`, client-side browser events cannot fire on `kubomontessori.com`. Funneling through on-site scheduling ensures full marketing attribution in GA4.

**Independent Test**: Can be tested by inspecting the JSON-LD schema on campus pages and verifying that `potentialAction.target` points to `https://www.kubomontessori.com/contact/`.

**Acceptance Scenarios**:

1. **Given** a prospective parent clicks "Schedule a Campus Tour" via Google Search structured data, **When** they navigate through the schema `ReserveAction` target, **Then** they land on `https://www.kubomontessori.com/contact/` where on-page booking and conversion tracking are active.

---

### Edge Cases

- **Stringified postMessage payload**: In some browsers, webviews, and embedded iframe configurations, `event.data` arrives as a JSON string rather than a pre-parsed JavaScript object. The system must attempt JSON parsing before discarding the message.
- **Race conditions with `window.Calendly`**: If the Calendly script was already loaded by the background loader, adding a `load` event listener will never trigger because the `load` event already fired. The modal launcher must verify existing script state and readiness.
- **Content blockers / ad blockers**: If a user runs uBlock Origin, Brave Shields, or Safari Content Blockers, the Google Analytics script may be blocked. The system must fail silently without breaking the user's booking experience.
- **GA4 UI changes ("Key Events")**: In GA4, custom events do not appear in conversion reports unless explicitly marked as a "Key Event" in Google Analytics Admin.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The Calendly message listener MUST accept and process `event.data` payloads delivered as both JavaScript objects and JSON-encoded strings.
- **FR-002**: The popup widget loader MUST safely handle cases where the external Calendly script has already finished loading, is currently loading, or fails to load.
- **FR-003**: The Google Analytics tag (`gtag.js`) MUST be loaded via standard `<script async fetchpriority="low" src="https://www.googletagmanager.com/gtag/js?id=G-BE43SM2H4T">` in `<head>` to guarantee tag readiness and prevent idle-callback execution delays while avoiding LCP contention.
- **FR-004**: All campus and SEO landing pages containing tour scheduling CTAs MUST use the intercepted popup widget rather than direct external navigation to ensure postMessage events can be captured.
- **FR-005**: The conversion dispatcher MUST dispatch standard GA4 event `gtag('event', 'tour_booking_scheduled', { event_category: 'engagement', event_label: 'Calendly Widget', value: 1 })` without modifying the event parameter signature, maintaining strict consistency with existing reports.
- **FR-006**: The feature MUST provide explicit verification instructions for locating `tour_booking_scheduled` in the Google Analytics 4 dashboard (Realtime, Events, and Key Events).
- **FR-007**: Structured data `ReserveAction` targets in `src/components/SEO.astro` MUST point to `https://www.kubomontessori.com/contact/` rather than external `calendly.com` links so organic search referrals are captured on-site.

---

### Key Entities *(include if feature involves data)*

- **CalendlyPostMessageEvent**: Represents incoming messages from `https://calendly.com`, containing an `event` name (`calendly.event_scheduled`) and optional payload with booking resource URIs.
- **GAConversionEvent**: The analytics payload dispatched to GA4 containing event name `tour_booking_scheduled`, category `engagement`, label `Calendly Widget`, and conversion value `1`.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of tour bookings completed through on-page widgets and CTAs dispatch a verified network request to Google Analytics.
- **SC-002**: Message listener handles both string and object postMessage payloads with 0% dropped valid booking events.
- **SC-003**: In-page popup CTAs work reliably across 100% of supported Peninsula landing pages and campus comparison tables.
- **SC-004**: Zero user-facing JavaScript runtime errors or broken clicks when third-party scripts load with variable network latency.
- **SC-005**: 100% of schema markup `ReserveAction` actions resolve to on-site tracked landing pages.

---

## Assumptions

- The site uses GA4 property measurement ID `G-BE43SM2H4T`.
- The user operates on the standard Calendly subscription without paid webhook integrations, requiring client-side postMessage tracking.
- Google Analytics configuration requires marking `tour_booking_scheduled` as a Key Event in the GA4 admin console for it to appear in conversion-specific reporting tabs.
