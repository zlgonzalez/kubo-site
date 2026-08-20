# Quickstart & Verification Guide: Local SEO & GEO Implementation

**Feature Branch**: `004-local-seo-and-geo`  
**Date**: 2026-08-19  

## Local Development & Build Commands

### 1. Install Dependencies & Start Dev Server
```bash
npm install
npm run dev
```
The site will run locally at `http://localhost:4321`.

### 2. Verify Local Landing Pages
Navigate to local city landing pages and resource guides:
- `http://localhost:4321/foster-city-preschool-daycare`
- `http://localhost:4321/belmont-ca-montessori-daycare`
- `http://localhost:4321/san-carlos-montessori-preschool`
- `http://localhost:4321/burlingame-montessori-preschool`
- `http://localhost:4321/menlo-park-montessori-preschool`
- `http://localhost:4321/resources/montessori-vs-traditional-preschool`
- `http://localhost:4321/resources/potty-training-preschool-guide`
- `http://localhost:4321/resources/home-vs-center-childcare`

### 3. Verify Build & Type Check
```bash
npm run build
```
Ensure static generation completes with zero errors and all HTML pages render cleanly in `dist/`.

### 4. Verify Calendly Tour Booking Analytics Event
1. Open any new local landing page in Google Chrome.
2. Open DevTools Console and execute:
   ```javascript
   window.addEventListener('message', (e) => console.log('Message event:', e.data));
   ```
3. Trigger a test event or inspect `window.dataLayer` after interacting with Calendly widget:
   ```javascript
   console.log(window.dataLayer);
   ```
4. Verify that event object contains `{ event: 'tour_booking_scheduled', event_category: 'engagement', event_label: 'Calendly Widget', value: 1 }`.

### 5. Verify JSON-LD Schema Validation
Run page HTML through Schema Markup Validator or Google Rich Results Test to confirm valid `@graph` JSON-LD schemas (`EducationalOrganization`, `Preschool`, `ChildCare`, `FAQPage`).
