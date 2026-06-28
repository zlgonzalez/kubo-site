# Research: Calendly Tour Booking Analytics Tracking

## Overview
This document consolidates research and decisions for tracking Calendly tour bookings in Google Analytics on the client side without requiring a paid Calendly plan upgrade.

## Decisions & Technical Architecture

### 1. Client-Side Event Interception (Window PostMessage)
- **Decision**: Use `window.addEventListener('message', ...)` to intercept standard postMessage events dispatched by the Calendly embedded widget iframe.
- **Rationale**: Calendly sends postMessage events to the host window across all subscription tiers (including standard/basic plans). This avoids the requirement for paid server-side webhook integrations.
- **Payload Structure**:
  - `event.origin`: Verified to match `https://calendly.com` or end with `.calendly.com`.
  - `event.data.event`: `calendly.event_scheduled` indicates a confirmed booking.

### 2. Google Analytics (GA4) / GTM Dispatch
- **Decision**: Trigger both `window.gtag('event', 'tour_booking_scheduled', ...)` and `window.dataLayer.push(...)`.
- **Rationale**: Provides maximum compatibility whether Google Tag Manager or standard Google Analytics (gtag.js) is active on the page.
- **Event Parameters**:
  - Event Name: `tour_booking_scheduled`
  - Event Category: `engagement`
  - Event Label: `Calendly Widget`

### 3. Explicit Testing Strategy (User Mandate)
- **Decision**: Implement dual-layer testing (Unit Test via Vitest + E2E test via Playwright).
- **Unit Test (Vitest)**:
  - Mock `window.gtag` / `window.dataLayer`.
  - Dispatch a simulated `window.postMessage` containing `event: 'calendly.event_scheduled'`.
  - Assert that `gtag` was called with the exact expected arguments and that non-Calendly messages are safely ignored.
- **E2E Test (Playwright)**:
  - Load a page with the embedded Calendly widget.
  - Evaluate script in browser context to dispatch a postMessage or trigger a booking flow.
  - Validate that `window.dataLayer` or `window.gtag` calls capture the conversion event.

## Alternatives Considered
- **Calendly Server-Side Webhook**: Rejected because it requires upgrading to Calendly Teams/Enterprise plan ($16-20+/user/mo), violating the $0 additional cost constraint.
- **URL Redirect Page Tracking**: Redirecting users to a custom thank-you page after booking requires Calendly Pro features ($12+/mo). Rejected.
