# Product Behavioral Baseline: Kubo Montessori Website

**Status**: Canonical Baseline (`000-product-baseline`)
**Scope**: Observable user-facing behavior, SEO/AI discovery contracts, conversion tracking, interactive widgets, redirects, security headers, and quality invariants currently shipped in production.
**Companion Architecture Map**: `.specify/memory/blueprint.md` (owns file layout, module ownership, and dependency edges — do not duplicate implementation internals here).

---

## User Roles

- **Prospective Parent / Visitor**: Explores San Mateo (Casa dei Bambini) and Redwood City (Roots N' Wings) Montessori programs, compares campuses, reads parent guides and blog articles, and schedules an in-person campus tour.
- **Current Family**: Accesses the Parent Handbook, upcoming school calendar events, daily classroom schedules, campus directions/parking, and the external Brightwheel portal.
- **Search Engine / AI Crawler**: Indexes canonical pages, structured JSON-LD entities, XML sitemaps, `robots.txt`, and `llms.txt`, and follows redirects from legacy URLs.
- **Site Operator**: Builds, tests, audits (Lighthouse CI), and deploys the static site to production hosting.

---

## 1. Navigation, Site Structure & Campus Discovery

- **FR-001 (Primary Navigation & Mobile Menu)**: Every standard page MUST display a top navigation bar containing the Kubo Montessori brand logo, Home, About, Our Programs (dropdown: Roots N' Wings Montessori School, Montessori Home Daycare), Locations Served (dropdown covering 7 Peninsula cities: San Mateo, Redwood City, Foster City, Belmont, San Carlos, Burlingame, Menlo Park), Resources (dropdown: Parent Handbook, Montessori vs. Traditional, Potty Training Policy, Home vs. Center Daycare), Blog, Brightwheel (external link opening in a new tab with `noopener noreferrer`), and Contact. On viewports below the desktop breakpoint, navigation links MUST be hidden by default behind a mobile menu toggle button and toggle visibility on click.
- **FR-002 (Core, Campus & Local City Pages)**: The site MUST serve core pages (`/`, `/about/`, `/services/`), dedicated campus pages for San Mateo (`/san-mateo-preschool-daycare/`) and Redwood City (`/redwood-city-preschool-center/`), directions/parking pages for both campuses (`/san-mateo-location-directions/`, `/rw-location-directions/`), enrichment pages (`/rw-baking/`, `/rw-gardening/`, `/rw-gymnastics/`, `/rw-technology/`), and local landing pages for Foster City, Belmont, San Carlos, Burlingame, and Menlo Park.
- **FR-003 (Parent Resources & Parent Handbook)**: The site MUST serve parent guide pages under `/resources/` including `/resources/parent-handbook/`, `/resources/montessori-vs-traditional-preschool/`, `/resources/potty-training-preschool-guide/`, and `/resources/home-vs-center-childcare/`.
- **FR-004 (Contact & Admissions Information)**: The Contact page (`/contact/`) MUST present address, operating hours, clickable phone (`tel:`) and email (`mailto:`) links, directions links for both campuses, and a tour booking call-to-action.
- **FR-005 (Global Footer)**: Every standard page MUST render a footer listing both campus addresses, contact email, links to all 7 Peninsula community pages, links to parent resources, and a copyright notice.

### Acceptance Scenarios

- **Given** a visitor on a 375x667 mobile viewport loads the homepage, **When** they click the mobile menu toggle button, **Then** the navigation menu becomes visible.
- **Given** a visitor opens the homepage navigation, **When** they inspect the Resources menu, **Then** a "Parent Handbook" link pointing to `/resources/parent-handbook/` is present and loads a page whose title and primary heading include "Parent Handbook".

---

## 2. Tour Booking, Calendly Popup & Conversion Analytics

- **FR-006 (Async Analytics Bootstrap)**: Every page MUST load Google Analytics asynchronously with low fetch priority and initialize the analytics command queue immediately in the document head so conversions occurring before browser idle are captured.
- **FR-007 (On-Page Calendly Popup Interception)**: Unmodified primary-button clicks on valid `https://calendly.com` (or valid subdomain) anchor links MUST be intercepted to open the embedded Calendly popup widget on the current page rather than navigating away. Modified clicks (Cmd/Ctrl/Shift/Alt or non-primary button) and non-Calendly links MUST NOT be intercepted.
- **FR-008 (Marketing Parameter Forwarding)**: When opening a Calendly popup, badge, or fallback URL, inbound marketing query parameters (`utm_source`, `utm_medium`, `utm_campaign`, `utm_term`, `utm_content`, `gclid`, `fbclid`) up to 256 characters each MUST be forwarded to the Calendly URL without overwriting parameters already present on the target URL. Non-marketing parameters MUST NOT be forwarded.
- **FR-009 (Deferred Floating Tour Badge)**: After initial paint/idle (with a 1-second deferral), pages MUST lazily load the Calendly widget assets and initialize a floating "Click to Schedule a Tour" badge at most once per page session, forwarding marketing parameters.
- **FR-010 (Widget Load Timeout & Single-Tab Fallback)**: If the Calendly widget script fails to load, throws synchronously, or does not settle within 5 seconds of a click, the site MUST fall back to opening the Calendly URL (with forwarded marketing parameters) in a single new tab (`noopener,noreferrer`) without double-navigating the parent tab. If the widget script has already settled in an error/unavailable state before a subsequent click, the link MUST preserve forwarded parameters and allow native anchor navigation. Rapid clicks while loading MUST NOT reset the 5-second failover timer or stack duplicate listeners.
- **FR-011 (Strict Origin & URL Validation)**: Incoming `postMessage` booking events and outbound Calendly link/popup URLs MUST be accepted only for `https:` URLs on `calendly.com` or valid DNS subdomains without credentials or custom ports. HTTP URLs, spoofed hostnames, `javascript:`, `data:`, `blob:`, and malformed or oversized (> 8192 chars) message payloads MUST be ignored without throwing.
- **FR-012 (Exclusive `gtag` Conversion Dispatch)**: Upon receiving a valid `calendly.event_scheduled` `postMessage` (object or JSON-stringified) from a trusted Calendly origin, the site MUST dispatch a single `tour_booking_scheduled` event exclusively via `window.gtag` (`event_category: 'engagement'`, `event_label: 'Calendly Widget'`, `value: 1`) and MUST NOT push duplicate custom event objects directly onto `window.dataLayer`.
- **FR-013 (Booking Conversion Deduplication)**: Deduplication MUST resolve a booking key in strict precedence order: first `payload.invitee.uri` (trimmed non-empty string), then `payload.event.uri` (trimmed non-empty string). Duplicate `calendly.event_scheduled` messages (including paired object + stringified deliveries) sharing the same resolved URI MUST be suppressed across the browser session (persisted in `sessionStorage` capped at the 50 most recent URIs, with graceful in-memory fallback if storage throws). Distinct URIs MUST each be recorded. When both URIs are absent, identical payloads MUST be suppressed within a 5-second window and allowed again after 5 seconds.

### Acceptance Scenarios

- **Given** a visitor on `/san-mateo-preschool-daycare/` or `/contact/` clicks the tour booking CTA while the Calendly SDK is available, **When** they complete a booking that posts `calendly.event_scheduled` from `https://calendly.com`, **Then** the page remains on Kubo Montessori, the Calendly popup opens for `https://calendly.com/mary-kubo`, and `gtag` receives exactly one `tour_booking_scheduled` event.
- **Given** two `calendly.event_scheduled` messages (one object, one JSON string) arrive for the same invitee URI followed by a third message for a distinct invitee URI, **When** processed, **Then** `gtag` is invoked exactly twice and zero custom event objects are pushed directly to `window.dataLayer`.
- **Given** the Calendly widget script is blocked or fails to load on `/san-mateo-preschool-daycare/?utm_source=e2e_immediate`, **When** the visitor clicks the tour button, **Then** a single new tab opens to `https://calendly.com/mary-kubo?utm_source=e2e_immediate` and the parent tab remains on `/san-mateo-preschool-daycare/`.

---

## 3. Blog Publishing, Crawlability & Legacy Redirects

- **FR-014 (No-JS Crawlability of Blog Listings)**: The `/blog/` page MUST statically pre-render blog post titles, publication dates, summaries, and links into `#dib-posts` at build time so search engines and visitors without JavaScript can read and navigate post listings, while also loading the interactive blog embed for single-post rendering (`?p=<slug>`).
- **FR-015 (Legacy Route Redirects)**: Legacy routes MUST redirect to canonical trailing-slash destinations:
  - **Server-side Apache HTTP 301 redirects**: `/rw`, `/rw/` → `/redwood-city-preschool-center/`; `/homedaycare`, `/homedaycare/` → `/san-mateo-preschool-daycare/`.
  - **Static HTML `<meta http-equiv="refresh">` redirects**:
    - Emulated as HTTP 301 in local E2E preview: `/rw.html`, `/roots-n-wings-montessori-school` → `/redwood-city-preschool-center/`; `/homedaycare.html` → `/san-mateo-preschool-daycare/`; `/about.html` → `/about/`; `/services.html` → `/services/`; `/contact.html` → `/contact/`; `/rw-location-directions.html` → `/rw-location-directions/`; `/rw-baking.html` → `/rw-baking/`; `/rw-gardening.html` → `/rw-gardening/`; `/rw-gymnastics.html` → `/rw-gymnastics/`.
    - Served as static HTML refresh in both production and local E2E preview: `/parent-handbook`, `/parent-handbook.html` → `/resources/parent-handbook/`.
- **FR-016 (Single-Hop Dynamic Blog Post Redirects)**: Published blog post slug routes (`/blog/<slug>`) MUST redirect in a single hop to `/blog/?p=<slug>` (emitted as static HTML `<meta http-equiv="refresh">` pages in production static output and HTTP 301 in local E2E preview).
- **FR-017 (Query-Preserving Legacy Blog Redirect)**: Requests to `/blog.html` (including query parameters such as `/blog.html?p=<slug>`) MUST redirect client-side to `/blog/` while preserving the original query string.

### Acceptance Scenarios

- **Given** JavaScript is disabled in the browser, **When** a crawler visits `/blog/`, **Then** `#dib-posts` is visible and contains links to published blog posts.
- **Given** a visitor requests `/rw` or `/homedaycare`, **When** served by production hosting, **Then** the server returns HTTP 301 with `Location: /redwood-city-preschool-center/` or `/san-mateo-preschool-daycare/`.
- **Given** a visitor requests `/blog.html?p=some-post-slug`, **When** the page loads, **Then** the browser redirects to `/blog/?p=some-post-slug`.

---

## 4. URL Canonicalization, Sitemaps & AI Discovery

- **FR-018 (HTTPS & WWW Canonicalization)**: Production HTTP (port 80) requests for `kubomontessori.com` or `www.kubomontessori.com` MUST redirect to `https://www.kubomontessori.com/<path>` preserving the requested path (currently implemented as HTTP 302 `[R,L]`; `[NEEDS CLARIFICATION: whether to upgrade to 301 and also canonicalize apex https://kubomontessori.com to www]`).
- **FR-019 (Trailing-Slash Internal Links & Redirect Targets)**: All internal page links and all configured redirect destinations MUST end with a trailing slash (excluding static asset filenames with extensions).
- **FR-020 (Primary XML Sitemap Hygiene)**: The generated primary sitemap MUST index canonical static pages including `/blog/`, MUST exclude the `/blog.html` redirect shim, and MUST NOT include non-canonical query-parameterized URLs (such as `/blog/?p=...`) or legacy HTTP-only sitemap integrations.
- **FR-021 (AI Sitemap Endpoint)**: `/ai-sitemap.xml` MUST return valid XML (`application/xml; charset=utf-8`) listing the 18 curated canonical static pages with trailing slashes (homepage, 2 campus pages, 5 local city pages, 4 parent resource pages, About, Contact, Services, 2 directions pages, and `/blog/`), priority `1.0` for `/` and `0.8` for all other pages, and zero query-parameterized blog URLs.
- **FR-022 (Robots & Sitemap Discovery)**: `/robots.txt` MUST allow all user agents (`User-agent: *`, `Allow: /`) and declare both `https://www.kubomontessori.com/sitemap-index.xml` and `https://www.kubomontessori.com/ai-sitemap.xml`.
- **FR-023 (LLM Discovery Manifest)**: `/llms.txt` MUST be publicly served with a structured Markdown overview of Kubo Montessori, its San Mateo and Redwood City campuses, parent resources, and canonical HTTPS links.

### Acceptance Scenarios

- **Given** a crawler requests `/sitemap-0.xml` or `/ai-sitemap.xml`, **When** the XML is parsed, **Then** `/blog/` is present, `/blog.html` and `/blog/?p=` are absent, and every listed route ends with `/`.
- **Given** an AI crawler requests `/llms.txt`, **When** the response is returned, **Then** it includes the `# Kubo Montessori` heading, `## Campuses & Programs`, and canonical HTTPS links to both campuses.

---

## 5. Structured Data, Accessibility & Performance Budgets

- **FR-024 (Multi-Entity JSON-LD Schema)**: Every standard page MUST emit a valid Schema.org JSON-LD `@graph` containing an `EducationalOrganization` (Kubo Montessori), the San Mateo `DayCare`/`Preschool` campus, and the Redwood City `Preschool`/`ChildCare` campus. All three entities' `ReserveAction` targets MUST point to `https://www.kubomontessori.com/contact/`. When a page specifies a `targetCity`, that city MUST appear in the organization's `areaServed` list. Invalid properties (such as `typicalAgeRange`) MUST NOT be emitted.
- **FR-025 (FAQ Structured Data)**: Pages rendering the FAQ section MUST display expandable question/answer items and emit a corresponding Schema.org `FAQPage` JSON-LD script.
- **FR-026 (SEO Heading & Title Constraints)**: Every page title MUST be 70 characters or fewer. The Parent Handbook page MUST contain exactly one `<h1>` element.
- **FR-027 (Image Alt Text & Payload Budget)**: Enrichment gallery images (baking, gardening, gymnastics) MUST include descriptive `alt` attributes. Every image referenced on the Redwood City campus page MUST be strictly under 1 MB (`< 1,000,000` bytes).
- **FR-028 (Lighthouse Quality Thresholds)**: Automated Lighthouse CI assertions across core pages (`/`, `/san-mateo-preschool-daycare/`, `/redwood-city-preschool-center/`, `/san-mateo-location-directions/`, `/blog/`) MUST enforce Accessibility >= 0.95 (error), SEO >= 0.95 (error), Performance >= 0.90 (warn), and Cumulative Layout Shift <= 0.10 (warn).

### Acceptance Scenarios

- **Given** a crawler inspects `/belmont-ca-montessori-daycare/`, **When** it parses the JSON-LD `@graph`, **Then** all three `ReserveAction` targets equal `https://www.kubomontessori.com/contact/` and `EducationalOrganization.areaServed` contains `"Belmont"`.
- **Given** the automated audit suite runs across all pages and Redwood City images, **When** validated, **Then** every `<title>` is <= 70 characters, `/resources/parent-handbook/` has exactly one `<h1>`, and every referenced Redwood City image is < 1,000,000 bytes.

---

## 6. Interactive Campus Information Widgets

- **FR-029 (Paginated School Calendar)**: The Calendar widget MUST display school events sorted chronologically by date. When more than 5 events exist, it MUST paginate at 5 events per page with Previous/Next buttons and a `Page X of Y` indicator, disabling Previous on page 1 and Next on the final page. When 5 or fewer events exist, pagination controls MUST remain hidden.
- **FR-030 (Classroom Daily Schedules)**: The Schedule widget MUST render time-and-activity rows from campus classroom schedule data with a notice that schedules are subject to change based on weather and children's needs.
- **FR-031 (Campus Comparison & Testimonials)**: The Quick Fact Table MUST present a side-by-side comparison of San Mateo and Redwood City programs (ages, ratios, hours, potty training policy, meals, environment, enrichment, state license numbers) with a tour booking CTA. The Testimonial Carousel MUST allow horizontal stepping through parent testimonials via Previous and Next controls.

### Acceptance Scenarios

- **Given** the school calendar contains more than 5 events, **When** a parent views the Calendar widget, **Then** only the first 5 chronological events are shown, Previous is disabled, Next is enabled, and clicking Next advances to page 2.
- **Given** a parent views the Testimonial Carousel on the homepage, **When** they click Next or Previous, **Then** the carousel track scrolls horizontally by one testimonial card width.

---

## 7. Security Headers & Static Deployment

- **FR-032 (HTTP Security & Privacy Headers)**: Production responses MUST include `X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`, `Referrer-Policy: strict-origin-when-cross-origin`, and `Permissions-Policy: geolocation=(), microphone=(), camera=()`.
- **FR-033 (Safe Static Site Deployment)**: The deployment workflow MUST refuse to run if credentials are missing, required transfer tooling is unavailable, or the local build directory is missing or empty; MUST pass credentials via stdin rather than transfer-tool CLI arguments; and MUST support a `--dry-run` mode that simulates mirroring without transferring or deleting remote files.
- **FR-034 (Image Optimization Utility)**: The image optimization workflow MUST resize configured campus/staff JPEG assets to fit within 1600x1600 without enlargement and re-encode them in place to reduce payload size.

### Acceptance Scenarios

- **Given** a site operator invokes deployment with an empty or nonexistent build directory, **When** the command runs, **Then** it exits non-zero with an error message and performs zero remote modifications.
- **Given** a site operator invokes deployment with `--dry-run`, **When** the command runs, **Then** it reports planned mirror operations without transferring or deleting remote files.
