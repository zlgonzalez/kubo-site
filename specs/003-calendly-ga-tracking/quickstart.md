# Quickstart: Calendly Analytics Tracking Verification

## Overview
This quickstart guide outlines how to verify that Calendly tour booking events are correctly captured and dispatched to Google Analytics.

## Verification Steps

### 1. Automated Testing (Unit & E2E)
Run the automated test suite to verify event listener registration and event dispatching:
```bash
make test
```
Or run unit/E2E tests specifically:
```bash
npm run test:unit
npm run test:e2e
```

### 2. Manual Browser Verification
1. Open the website locally using `npm run dev` or `make dev`.
2. Open Browser Developer Tools -> Console.
3. Open the Calendly tour booking popup or inline widget.
4. Complete a test booking or simulate the postMessage event in console:
   ```javascript
   window.postMessage({ event: 'calendly.event_scheduled', payload: {} }, '*');
   ```
5. Verify in console or Tag Assistant that `window.dataLayer` contains `{ event: 'tour_booking_scheduled', ... }`.
