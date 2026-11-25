# Technical Research: Restore Tour Booking Analytics Tracking

**Feature**: `008-fix-tour-analytics`  
**Date**: October 28, 2026  

## 1. Calendly `postMessage` Payload Ingestion

### Decision
Enhance `handleCalendlyMessage` in `src/utils/calendly-analytics.ts` to safely accept both native object payloads and stringified JSON payloads.

```typescript
let data = event.data;
if (typeof data === 'string') {
  try {
    data = JSON.parse(data);
  } catch {
    return; // Ignore non-JSON strings
  }
}

if (data && typeof data === 'object' && data.event === CALENDLY_BOOKING_EVENT) {
  dispatchGAConversionEvent();
}
```

### Rationale
- Different browsers, mobile WebViews (such as Facebook/Instagram in-app browsers, iOS WKWebView, Chrome Custom Tabs), and versions of Calendly's embed can pass `event.data` as serialized JSON strings rather than pre-parsed objects.
- Checking `typeof data === 'string'` and safely running `JSON.parse` ensures 100% compatibility across all device types without throwing uncaught runtime exceptions when third-party non-JSON messages arrive.

### Alternatives Considered
- *Strict Object check only*: Existing implementation fails silently on all stringified payloads.
- *Unconditional JSON.parse*: Throws syntax errors when browser extensions or other tools post non-JSON strings (e.g. webpack dev server, react dev tools).

---

## 2. Google Tag (`gtag.js`) Loading & Execution Architecture

### Decision
Replace the deferred `requestIdleCallback` + `setTimeout(1000)` pattern in `src/layouts/Layout.astro` with the standard asynchronous `<script async fetchpriority="low" src="https://www.googletagmanager.com/gtag/js?id=G-BE43SM2H4T"></script>` in `<head>`.

```html
<!-- Global site tag (gtag.js) - Google Analytics -->
<script async fetchpriority="low" src="https://www.googletagmanager.com/gtag/js?id=G-BE43SM2H4T"></script>
<script is:inline>
  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function() { dataLayer.push(arguments); };
  gtag('js', new Date());
  gtag('config', 'G-BE43SM2H4T');
</script>
```

### Rationale
- `requestIdleCallback` is often throttled or postponed by mobile operating systems (especially iOS Safari and low-power modes).
- When parents book a tour within the first few seconds of page load, the deferred loader may not yet have downloaded `gtag.js`, meaning the analytics network dispatch never occurs if the page redirects or the session ends.
- Asynchronous scripts (`async`) download in parallel and do not block DOM parsing or critical path rendering, maintaining strong Core Web Vitals while guaranteeing tag readiness.

### Alternatives Considered
- *Eager triggering on CTA hover/click*: Adds complexity, does not help if user books from floating badge, and still leaves a race condition on immediate clicks.
- *Relying only on dataLayer buffering*: Without `gtag.js` loaded, `dataLayer` accumulates events in local memory but cannot send HTTP beacons to `google-analytics.com/g/collect`.

---

## 3. Calendly Widget Script Ready State & Race Conditions

### Decision
Update `openCalendlyPopup` in `src/utils/calendly-analytics.ts` to share a unified `<script>` loader and `dataset.calendlyStatus` state machine (`loading` / `loaded` / `error`) with `scheduleCalendlyBadge`, bound a single time per `<script>` element with a 5s load timeout and native/new-tab fallback without chaining `window.location.assign` after `window.open(..., '_blank', 'noopener,noreferrer')`.

```typescript
// Pseudocode summary — see src/utils/calendly-analytics.ts for full implementation:
// 1. Validate URL with `isValidCalendlyUrl()` and append allowlisted UTMs (`buildCalendlyUrlWithUtms`).
// 2. If `window.Calendly?.initPopupWidget` is ready, invoke inside `try/catch` (fallback on throw).
// 3. Check `ensureCalendlyScriptElement()`: if `status` is `'error'` or `'loaded'` without SDK, fall back immediately.
// 4. Otherwise arm a non-starving 5s timeout, attach a single `{ once: true }` load/error launcher, and append if new.
```

### Rationale
- Prevents deadlocks where a click occurs after `widget.js` is already appended to the DOM.
- Guarantees an immediate graceful fallback to `window.open` if the widget fails or is blocked by privacy extensions.

---

## 4. Google Search `ReserveAction` Schema Target

### Decision
Update the `potentialAction` target in `src/components/SEO.astro` from `https://calendly.com/mary-kubo` to `https://www.kubomontessori.com/contact/`.

### Rationale
- Direct links in search results to `calendly.com` take the user away from the site. Because the user is on `calendly.com`, our client-side postMessage listener on `kubomontessori.com` cannot run, resulting in unrecorded conversions.
- Routing to `https://www.kubomontessori.com/contact/` brings prospective parents to our branded contact page which opens the intercepted Calendly popup scheduler and captures the conversion event.

---

## 5. Google Analytics 4 Dashboard Verification Guide

### Decision
Document the GA4 verification steps:
1. **Realtime**: Check `analytics.google.com` > **Reports** > **Realtime** > **Event count by Event name** (`tour_booking_scheduled`).
2. **DebugView**: Test using the Google Analytics Debugger Chrome extension or adding `?debug_mode=true` to view live event parameters.
3. **Key Events Setup**: In GA4 Admin > **Data display** > **Key events**, verify that `tour_booking_scheduled` is marked as a Key Event (formerly "Conversion") so it surfaces in attribution and acquisition reports.
