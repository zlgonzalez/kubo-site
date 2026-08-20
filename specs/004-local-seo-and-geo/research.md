# Research & Architectural Decisions: Local SEO & GEO Strategy

**Feature Branch**: `004-local-seo-and-geo`  
**Date**: 2026-08-19  

## Technical Decisions

### 1. Framework & Routing Architecture
- **Decision**: Continue using **Astro** SSG (Static Site Generation) with explicit page routes in `src/pages/`:
  - Geo Landing Pages:
    - `src/pages/foster-city-preschool-daycare.astro` (`/foster-city-preschool-daycare`)
    - `src/pages/belmont-ca-montessori-daycare.astro` (`/belmont-ca-montessori-daycare`)
    - `src/pages/san-carlos-montessori-preschool.astro` (`/san-carlos-montessori-preschool`)
    - `src/pages/burlingame-montessori-preschool.astro` (`/burlingame-montessori-preschool`)
    - `src/pages/menlo-park-montessori-preschool.astro` (`/menlo-park-montessori-preschool`)
  - Educational Resource Guides:
    - `src/pages/resources/montessori-vs-traditional-preschool.astro` (`/resources/montessori-vs-traditional-preschool`)
    - `src/pages/resources/potty-training-preschool-guide.astro` (`/resources/potty-training-preschool-guide`)
    - `src/pages/resources/home-vs-center-childcare.astro` (`/resources/home-vs-center-childcare`)
- **Rationale**: Direct Astro static pages guarantee sub-second page loads, explicit canonical URLs, clean route hierarchy (`/resources/`), and localized static content optimized for search engines and AI indexers.
- **Alternatives Considered**: Dynamic `[city].astro` route was considered, but static explicit pages allow tailored commute descriptions, custom driving map pins, and localized user journey content per city.

### 2. Tour Scheduling & Analytics Event Tracking Integration
- **Decision**: Leverage existing Calendly integration infrastructure:
  - Embed Calendly widgets (`CalendarWidget.astro` or inline/badge Calendly widget triggers) on all new city landing pages and resource pages.
  - All new pages use `Layout.astro`, which globally executes `initCalendlyAnalytics()` from `src/utils/calendly-analytics.ts`.
  - `initCalendlyAnalytics()` listens to client-side `window.postMessage` events from embedded Calendly iframes for `calendly.event_scheduled` events and automatically pushes `tour_booking_scheduled` conversion events to `window.dataLayer` and Google Analytics `gtag`.
- **Rationale**: Guarantees 100% conversion tracking accuracy across all 5 new local landing pages and 3 resource guide pages with zero tracking gaps or custom webhook dependencies.
- **Alternatives Considered**: Direct form posts without Calendly - rejected because direct real-time tour booking via Calendly is preferred by parents and already fully instrumented with GA conversion tracking.

### 3. Multi-Entity JSON-LD Schema & AI Search Optimization (GEO)
- **Decision**: Extend `src/components/SEO.astro` to generate `@graph` multi-entity JSON-LD structured data for `EducationalOrganization`, `Preschool`, `ChildCare`, and `FAQPage`:
  - Parent organization: Kubo Montessori
  - Sub-organizations: San Mateo Campus (Flores St, ages 20m-6y, hot organic meals, potty training support, areaServed: San Mateo, Foster City, Belmont, Hillsdale) and Roots N' Wings Redwood City Campus (Euclid Ave, ages 2y-6y, TK program, areaServed: Redwood City, San Carlos, Menlo Park, Woodside).
  - City-specific `areaServed` and location distance properties attached per local landing page.
  - Inline `FAQPage` JSON-LD schema generated for collapsible FAQ sections.
- **Rationale**: Maximizes rich results eligibility in Google Search and provides machine-readable structured facts for AI Overviews, SearchGPT, and Perplexity.

### 4. Structured Quick-Fact Data Component
- **Decision**: Build a dedicated component `src/components/QuickFactTable.astro`:
  - Renders accessible HTML tabular data comparing metrics (Ages, Student-Teacher Ratios, Hours, Potty Training Policy, Meal Program, Licensing) across campuses.
  - Formatted explicitly for mobile responsiveness and AI web scraper parsing.
- **Rationale**: Generative AI models favor HTML/Markdown tables for extracting direct facts when formulating answers for local childcare queries.
