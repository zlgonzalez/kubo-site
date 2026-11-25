# Quickstart & Verification Guide: Deduplicate Tour Booking Conversion Analytics

**Feature**: `009-dedupe-tour-analytics`  
**Date**: November 12, 2026  

## Local Verification

1. **Run unit tests**:
   ```bash
   npm run test:unit
   ```
   Verifies:
   - Duplicate `calendly.event_scheduled` messages with the same `invitee.uri` or `event.uri` (object + stringified) dispatch `gtag('event', 'tour_booking_scheduled', ...)` only once.
   - `sessionStorage` persistence and graceful fallback to in-memory `Set` when `sessionStorage` throws.
   - 5-second deduplication window when URIs are absent (blocked within 5s, allowed after 5s).
   - Distinct bookings with different URIs both dispatch.
   - `dispatchGAConversionEvent()` calls `window.gtag` exclusively without pushing a separate custom `{ event: 'tour_booking_scheduled' }` object to `window.dataLayer`.

2. **Build & run Playwright smoke tests**:
   ```bash
   npm run build && npm run test:e2e
   ```
   Verifies end-to-end in a real browser that:
   - Duplicate `calendly.event_scheduled` `postMessage` events (object + JSON string) result in exactly one `tour_booking_scheduled` `gtag` command in `window.dataLayer`.
   - Badge + popup coexistence on `/san-mateo-preschool-daycare/` and `/contact/` dispatches a single conversion event per booking.
