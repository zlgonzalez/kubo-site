# Data Model: Calendly Tour Booking Analytics Tracking

## Entities & Schemas

### 1. Calendly PostMessage Event Payload (Incoming)
Represents the browser `MessageEvent` data received from the embedded Calendly iframe.

| Field | Type | Description | Validation Rule |
|-------|------|-------------|-----------------|
| `event` | String | Type of Calendly interaction | Must strictly equal `'calendly.event_scheduled'` |
| `payload` | Object | Event detail metadata | Optional metadata object containing event type and invitee info |
| `origin` | String | Message origin URL | Must match `/^https:\/\/(.*\.)?calendly\.com$/` |

### 2. Google Analytics Conversion Event (Outgoing)
Represents the parameters dispatched to `gtag()` or pushed to `dataLayer`.

| Field | Type | Description | Value / Format |
|-------|------|-------------|----------------|
| `event_name` | String | GA4 custom event identifier | `'tour_booking_scheduled'` |
| `event_category` | String | Event classification | `'engagement'` |
| `event_label` | String | Event source description | `'Calendly Widget'` |
| `value` | Number | Optional conversion value | `1` |
