# Data Model: Deduplicate Tour Booking Conversion Analytics

**Feature**: `009-dedupe-tour-analytics`  
**Date**: November 12, 2026  

## Entities

### 1. BookingCompletionNotification (`CalendlyEventPayload`)
Incoming `window.postMessage` payload from `https://*.calendly.com`.
- `event`: `'calendly.event_scheduled'` (required to trigger conversion)
- `payload` (optional object):
  - `event.uri` (optional string): Unique Calendly scheduled event URI
  - `invitee.uri` (optional string): Unique Calendly invitee URI (preferred deduplication key)

**Validation Rules**:
- `event.origin` must pass `isValidCalendlyOrigin(event.origin)`.
- Stringified `event.data` must be `<= 8192` chars, contain `calendly.event_scheduled`, and parse as a plain JSON object.

### 2. ConversionDeduplicationRecord
Client-side state preventing duplicate `tour_booking_scheduled` dispatches:
- **URI-keyed records** (`Set<string>` + `window.sessionStorage` key `kubo_processed_calendly_bookings`):
  - Key: `payload.invitee.uri?.trim() || payload.event.uri?.trim()`
  - Lifecycle: Persists for the browser tab session (capped at 50 most recent URIs in `sessionStorage`, with in-memory `Set` fallback if `sessionStorage` throws or is unavailable).
- **Fallback fingerprint records** (`Map<string, number>` in memory):
  - Key: Canonical JSON string of `rawData` when neither `invitee.uri` nor `event.uri` is present.
  - Value: Timestamp (`Date.now()`) of the last dispatched conversion.
  - Lifecycle: Suppresses identical repeats where `now - lastTimestamp < 5000` (5 seconds).

### 3. TourBookingConversionEvent (`GAConversionParameters`)
Dispatched exclusively via `window.gtag('event', 'tour_booking_scheduled', params)`:
- Event name: `'tour_booking_scheduled'`
- Parameters:
  - `event_category`: `'engagement'`
  - `event_label`: `'Calendly Widget'`
  - `value`: `1`
