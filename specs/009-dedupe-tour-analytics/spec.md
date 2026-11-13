# Feature Specification: Deduplicate Tour Booking Conversion Analytics

**Feature Branch**: `009-dedupe-tour-analytics`  
**Created**: November 12, 2026  
**Status**: Draft  
**Input**: User description: "After deploying 008-fix-tour-analytics, GA4 is receiving significantly more tour_booking_scheduled events than expected compared to actual Calendly bookings. Prevent duplicate and inflated tour_booking_scheduled conversion events in src/utils/calendly-analytics.ts and src/layouts/Layout.astro while preserving valid booking tracking."

## Clarifications

### Session 2026-11-12

- Q: How should conversion events be dispatched to analytics to prevent double-counting? → A: Dispatch exclusively via the Google Tag `gtag('event', 'tour_booking_scheduled', ...)` command (removing the separate custom `dataLayer.push` object) and update automated tests accordingly.
- Q: How long should identical repeat notifications without booking or invitee identifiers be suppressed? → A: 5 seconds.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Accurate One-to-One Tour Booking Conversion Counting (Priority: P1)

As a preschool director and site owner, when a prospective parent completes a single campus tour booking on the website, I want the analytics system to record exactly one `tour_booking_scheduled` conversion event—even if the scheduling widget emits multiple completion notifications (in different formats or in rapid succession)—so that conversion counts in Google Analytics accurately match actual scheduled tours.

**Why this priority**: Inflated conversion counts distort marketing ROI, cost-per-acquisition, and enrollment forecasting, making it impossible to trust analytics reports or compare them against actual Calendly bookings.

**Independent Test**: Can be tested by completing or simulating a tour booking where the scheduling widget emits multiple completion notifications for the same booking (e.g., identical identifiers, mixed object and text-encoded formats, or rapid repeats without identifiers) and verifying that only one `tour_booking_scheduled` conversion event is recorded.

**Acceptance Scenarios**:

1. **Given** a prospective parent completes a tour booking with a unique booking or invitee identifier, **When** the scheduling widget emits two or more completion notifications carrying the same identifier (whether in the same format or mixed object and text-encoded formats), **Then** the system records `tour_booking_scheduled` only once and suppresses subsequent duplicates for that booking.
2. **Given** a prospective parent completes a tour booking whose completion notification does not include a booking or invitee identifier, **When** an identical completion notification is received again in rapid succession, **Then** the system treats the repeat as a duplicate and records only one `tour_booking_scheduled` conversion event.
3. **Given** a prospective parent completes a first tour booking and later completes a second distinct tour booking (with a different booking/invitee identifier), **When** both bookings succeed, **Then** the system records two separate `tour_booking_scheduled` conversion events—one for each distinct booking.

---

### User Story 2 - Single-Dispatch Conversion Reporting Without Double-Counting (Priority: P2)

As a marketing administrator, I want each deduplicated tour booking conversion to be dispatched through a single authoritative analytics reporting path so that a single booking is never counted twice across analytics tags or reporting pipelines, while keeping the existing conversion event name and attributes unchanged.

**Why this priority**: Even when booking notifications are deduplicated, dispatching the same conversion through two parallel reporting mechanisms risks recording two conversions for one booking, undermining reporting accuracy.

**Independent Test**: Can be tested by triggering a single valid tour booking completion on a tracked page and verifying that exactly one conversion dispatch occurs with the expected event name (`tour_booking_scheduled`) and reporting attributes (`engagement`, `Calendly Widget`, value `1`).

**Acceptance Scenarios**:

1. **Given** a valid, non-duplicate tour booking completion occurs, **When** the conversion event is dispatched to analytics, **Then** only a single conversion event is emitted (not two parallel dispatches for the same booking).
2. **Given** historical analytics reports rely on `tour_booking_scheduled`, **When** the conversion event is recorded, **Then** its event name (`tour_booking_scheduled`) and core reporting attributes (category `engagement`, label `Calendly Widget`, value `1`) remain unchanged.

---

### User Story 3 - Conflict-Free Coexistence of Floating Badge and In-Page Popups (Priority: P3)

As a site visitor and site owner, when both the floating tour scheduling badge and in-page tour booking buttons are active on the same page, I want only one active conversion listener to process booking completions so that having multiple scheduling entry points on a page never produces duplicate conversion events.

**Why this priority**: Every page loads both the floating badge scheduler and in-page tour links; ensuring they share a single listener prevents multiplier effects on conversion counts across the site.

**Independent Test**: Can be tested by loading a campus or contact page with both the floating badge and an in-page booking CTA active, triggering a booking completion, and confirming only one conversion listener processes the event and records one conversion.

**Acceptance Scenarios**:

1. **Given** a visitor is on any page with both the floating scheduling badge and in-page tour booking buttons initialized, **When** a tour booking is completed through either entry point, **Then** only one conversion listener handles the notification and records a single `tour_booking_scheduled` event.
2. **Given** a visitor remains on the same page across re-renders or repeats a booking interaction within the same browsing session, **When** the same booking identifier is seen again, **Then** the duplicate suppression continues to prevent re-recording that booking.

---

### Edge Cases

- **Mixed-format duplicate notifications**: The scheduling widget sends both a structured object notification and a text-encoded notification for the exact same booking.
- **Missing booking identifiers**: A booking completion notification arrives without an invitee or event URI; rapid duplicate repeats within a short window must still be suppressed without blocking legitimate separate bookings later in the session.
- **Distinct back-to-back bookings**: A parent books two separate tours (e.g., for two children or two campuses) in the same session with different booking/invitee identifiers; both must be recorded.
- **Short-term session persistence**: If a page re-renders or reloads shortly after a booking with the same booking identifier, the system must avoid re-counting the same booking within that session.
- **Privacy / storage-restricted browsers**: If browser session storage is unavailable or restricted (e.g., private browsing or strict storage policies), duplicate suppression must still work in memory without breaking the booking flow.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST deduplicate incoming booking completion notifications using the booking's invitee identifier or event identifier when present, ensuring each unique booking records at most one conversion event.
- **FR-002**: Duplicate suppression for identified bookings MUST persist across in-page re-renders and short-term repeats within the active browsing session, with graceful fallback to in-memory tracking if session storage is unavailable.
- **FR-003**: When booking and invitee identifiers are absent from a completion notification, the system MUST suppress rapid duplicate identical notifications within a 5-second deduplication window while still allowing genuinely separate bookings after the 5-second window elapses.
- **FR-004**: The system MUST dispatch each deduplicated conversion exclusively via the Google Tag `gtag('event', 'tour_booking_scheduled', ...)` command (without pushing a separate custom event object to `dataLayer`) so one booking never triggers two conversion events.
- **FR-005**: The system MUST preserve the existing conversion event name (`tour_booking_scheduled`) and core reporting attributes (`event_category`: `engagement`, `event_label`: `Calendly Widget`, `value`: `1`) for continuity with existing analytics reports.
- **FR-006**: Initializing both the floating scheduling badge and on-demand in-page booking popups on the same page MUST NOT register duplicate conversion listeners or emit duplicate conversion events for a single booking.
- **FR-007**: Automated unit and end-to-end tests MUST verify duplicate suppression for mixed object and text-encoded notifications, repeated notifications with identical booking/invitee identifiers, rapid repeats without identifiers, and single-dispatch conversion reporting.

### Key Entities *(include if feature involves data)*

- **BookingCompletionNotification**: Represents an incoming scheduling completion signal from the booking provider, optionally carrying a unique event identifier and/or invitee identifier.
- **ConversionDeduplicationRecord**: Tracks recently processed booking identifiers (or short-term notification fingerprints when identifiers are absent) to ensure at-most-once conversion recording per booking.
- **TourBookingConversionEvent**: The single analytics conversion payload (`tour_booking_scheduled`) with category `engagement`, label `Calendly Widget`, and value `1`.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of single tour bookings produce exactly 1 `tour_booking_scheduled` conversion event, even when multiple completion notifications (object, text-encoded, or repeated) are emitted for the same booking.
- **SC-002**: 0% duplicate conversion dispatches occur from parallel analytics reporting paths or multiple scheduling widgets active on the same page.
- **SC-003**: 100% of distinct tour bookings (with unique booking/invitee identifiers) continue to be recorded accurately with no false suppression.
- **SC-004**: 100% of recorded `tour_booking_scheduled` events retain the exact event name and core reporting attributes required by existing analytics dashboards.

## Assumptions

- Each distinct tour booking completed through the scheduling provider carries a unique event or invitee identifier in standard payloads; rapid-repeat fingerprinting is only a fallback for payloads lacking identifiers.
- Retaining the existing `tour_booking_scheduled` event schema is required so historical comparisons and GA4 Key Event configurations remain unbroken.
- Automated verification in the local test suite is sufficient to validate deduplication and single-dispatch behavior prior to production deployment.
