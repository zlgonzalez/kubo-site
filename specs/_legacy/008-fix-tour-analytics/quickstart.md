# Quickstart: Tour Booking Analytics Verification

**Feature**: `008-fix-tour-analytics`  
**Date**: October 28, 2026  

This guide describes how to verify that the `tour_booking_scheduled` conversion event fires and reaches Google Analytics 4 (`G-BE43SM2H4T`).

---

## 1. Automated Build, Unit, E2E & Lighthouse Verification

Run the full verification suite (Astro build, Vitest unit tests, Lighthouse CI assertions, and Playwright E2E smoke tests):

```bash
npm test
```

Or run targeted test suites individually:

```bash
npx vitest run tests/unit/calendly-analytics.test.ts
npm run test:e2e
```

The tests verify:
- Inbound stringified JSON messages are parsed and handled.
- Standard object messages continue to work seamlessly.
- Non-Calendly origins and invalid JSON strings are safely ignored.
- `window.gtag` and `window.dataLayer` receive the exact event signature.

---

## 2. In-Browser Runtime Verification (Console)

1. Start the local preview or dev server:
   ```bash
   npm run build && npm run preview
   ```
2. Navigate to `http://localhost:4321/` in Google Chrome.
3. Open the Developer Tools Console (`Cmd + Option + I`).
4. Dispatch a simulated Calendly postMessage event:
   ```javascript
   // Test object payload
   window.dispatchEvent(new MessageEvent('message', {
     origin: 'https://calendly.com',
     data: { event: 'calendly.event_scheduled', payload: {} }
   }));

   // Test stringified payload
   window.dispatchEvent(new MessageEvent('message', {
     origin: 'https://calendly.com',
     data: JSON.stringify({ event: 'calendly.event_scheduled', payload: {} })
   }));
   ```
5. Check the data layer:
   ```javascript
   console.log(window.dataLayer.filter(e => e && e.event === 'tour_booking_scheduled'));
   ```
   Both calls should register a corresponding conversion event in `window.dataLayer`.

---

## 3. Google Analytics 4 Verification (`analytics.google.com`)

1. **Realtime Overview**:
   - Log into [analytics.google.com](https://analytics.google.com).
   - Select property `G-BE43SM2H4T`.
   - Go to **Reports** > **Realtime**.
   - Under the **Event count by Event name** card, trigger a test booking or simulated event.
   - You should see `tour_booking_scheduled` increment immediately.

2. **Standard Events Report (24–48 hours)**:
   - Go to **Reports** > **Engagement** > **Events**.
   - Filter or search for `tour_booking_scheduled` to confirm aggregated event counts and engagement parameters.

3. **GA4 DebugView**:
   - Install the official **Google Analytics Debugger** Chrome extension and toggle it ON.
   - Navigate to `https://www.kubomontessori.com/contact/`.
   - In GA4 Admin, open **Admin** > **Data display** > **DebugView**.
   - Trigger a tour booking; watch the timeline populate with `tour_booking_scheduled` and its parameters (`event_category`, `event_label`, `value`).

4. **Key Events (formerly Conversions)**:
   - Navigate to **Admin** > **Data display** > **Key events**.
   - Ensure `tour_booking_scheduled` is toggled as a **Key Event**.
