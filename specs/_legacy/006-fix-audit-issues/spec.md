# Feature Specification: Remediate SE Ranking Audit Errors and Warnings

**Feature Branch**: `006-fix-audit-issues`  
**Created**: September 26, 2026  
**Status**: Completed  
**Input**: User description: "Review this audit document and fix the issues called out for both errors and warnings."

## Clarifications

### Session 2026-09-26
- Q: How should the 10 non-canonical blog post query URLs in the XML sitemaps be remediated? → A: Exclude query-parameter blog URLs (`/blog/?p=...`) from XML sitemaps, keeping only clean canonical URLs like `/blog/` to eliminate all 10 sitemap errors.
- Q: Scope of remediation → A: Remediate all 10 errors ("Non-canonical pages in XML sitemap") and all 3 warnings ("Alt text missing" on 2 pages, "Image too big" on 1 page) reported in the SE Ranking audit. Notices (CSS caching/compression, title/description character limits, duplicate H1s, single inbound links) are excluded.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Eliminate Non-Canonical Pages from XML Sitemaps (Priority: P1)

Search engine bots and SEO audit crawlers inspecting `sitemap-0.xml` and `ai-sitemap.xml` encounter 10 non-canonical blog post query URLs (`/blog/?p=...`). Because these query URLs return HTML with `<link rel="canonical" href="https://www.kubomontessori.com/blog/">`, search engines flag them as non-canonical pages within the sitemap, which depletes crawl budgets and degrades SEO indexability scores. The XML sitemaps must only list verified canonical URLs.

**Why this priority**: Non-canonical URLs in sitemaps constitute the entire set of 10 errors flagged in the SE Ranking website audit, directly lowering site health and indexability.

**Independent Test**: Inspect generated XML sitemaps (`sitemap-0.xml` and `ai-sitemap.xml`) to verify that 100% of listed URLs are canonical pages whose self-declared canonical tags match their sitemap URLs.

**Acceptance Scenarios**:

1. **Given** the generated XML sitemaps, **When** crawlers parse all `<loc>` entries, **Then** no entry contains query parameters or points to a URL that redirects or declares a different canonical destination.
2. **Given** an automated SEO audit scanner (e.g., SE Ranking), **When** scanning the XML sitemaps, **Then** 0 "Non-canonical pages in XML sitemap" errors are reported.

---

### User Story 2 - Provide Accessible Alt Text for Curriculum Activity Images (Priority: P2)

Parents using screen readers and search engine image crawlers visiting the Gardening (`/rw-gardening/`) and Gymnastics (`/rw-gymnastics/`) program pages encounter 10 gallery images lacking `alt` attributes. Every image on these pages must include descriptive, contextual alternative text that describes the Montessori activity and educational environment.

**Why this priority**: Missing image alt text is an accessibility compliance failure (WCAG) and triggers 2 of the 3 warnings in the SEO audit, hurting image search rankings.

**Independent Test**: Run automated HTML and accessibility checks against `/rw-gardening/` and `/rw-gymnastics/` to verify every `<img>` tag possesses a meaningful `alt` attribute.

**Acceptance Scenarios**:

1. **Given** the Gardening program page (`/rw-gardening/`), **When** the page renders, **Then** all 5 gallery images provide descriptive `alt` text detailing Montessori gardening and outdoor learning.
2. **Given** the Gymnastics program page (`/rw-gymnastics/`), **When** the page renders, **Then** all 5 gallery images provide descriptive `alt` text detailing child movement, balance, and motor skill activities.
3. **Given** an automated SEO audit scanner, **When** evaluating `/rw-gardening/` and `/rw-gymnastics/`, **Then** 0 "Alt text missing" warnings are reported.

---

### User Story 3 - Optimize Large Images on Campus Landing Pages Below 1 MB (Priority: P2)

Prospective families browsing the Redwood City campus center (`/redwood-city-preschool-center/`) experience unnecessary bandwidth usage and potential load delays because teacher portrait images exceed 1 MB in size (`aileen-amar.jpeg` at 1.4 MB and `joy-pacaigue.jpg` at 1.01 MB). All images served on the page must be optimized to under 1 MB without visible degradation of image quality.

**Why this priority**: Images larger than 1 MB trigger the remaining warning in the SE Ranking audit and negatively impact page speed and Core Web Vitals.

**Independent Test**: Measure the file sizes of all images loaded by `/redwood-city-preschool-center/` to ensure every asset is strictly under 1 MB (target < 300 KB).

**Acceptance Scenarios**:

1. **Given** the media assets referenced on `/redwood-city-preschool-center/`, **When** inspecting file sizes on disk and network payload, **Then** all images are strictly less than 1 MB.
2. **Given** an automated SEO audit scanner, **When** evaluating image file sizes on `/redwood-city-preschool-center/`, **Then** 0 "Image too big" warnings are reported.

---

### Edge Cases

- **Dynamic blog post publication**: When new blog posts are published in DropInBlog, sitemaps must remain strictly canonical without introducing query parameters that violate search engine standards.
- **Visual quality on high-resolution screens**: Image compression must preserve crispness for teacher portraits and classroom photography across mobile and retina displays.
- **Alt text quality**: Alt text must remain concise, objective, and context-rich, avoiding redundant phrases such as "image of" or generic filler text.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST ensure all URLs published in XML sitemaps (`sitemap-0.xml` and `ai-sitemap.xml`) are canonical endpoints whose server-rendered `<link rel="canonical">` matches the listed URL.
- **FR-002**: System MUST exclude query-parameter blog post URLs (`/blog/?p=...`) from the XML sitemaps (`sitemap-0.xml` and `ai-sitemap.xml`), ensuring only clean canonical endpoints (such as `/blog/`) are indexed.
- **FR-003**: System MUST provide meaningful, descriptive `alt` attributes for all 5 gallery images on the Gardening page (`/rw-gardening/`).
- **FR-004**: System MUST provide meaningful, descriptive `alt` attributes for all 5 gallery images on the Gymnastics page (`/rw-gymnastics/`).
- **FR-005**: System MUST optimize image assets used on `/redwood-city-preschool-center/` (specifically `aileen-amar.jpeg` and `joy-pacaigue.jpg`) so that each image file size is strictly less than 1 MB.
- **FR-006**: System MUST maintain existing visual styling, responsive layout, and navigation functionality across all updated pages.

### Key Entities *(include if feature involves data)*

- **Sitemap Entry**: A crawlable URL record within `sitemap-0.xml` or `ai-sitemap.xml` that instructs search engines on canonical indexing.
- **Program Gallery Image**: A visual asset representing classroom enrichment activities with associated accessibility metadata (`alt` text).
- **Faculty Profile Asset**: A photographic portrait asset for teaching staff displayed on campus landing pages, governed by file size performance budgets.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 0 "Non-canonical pages in XML sitemap" errors reported in SE Ranking audit (reduced from 10 to 0).
- **SC-002**: 0 "Alt text missing" warnings reported in SE Ranking audit across `/rw-gardening/` and `/rw-gymnastics/` (reduced from 2 to 0).
- **SC-003**: 0 "Image too big" warnings reported in SE Ranking audit for `/redwood-city-preschool-center/` (reduced from 1 to 0; 100% of images < 1 MB).
- **SC-004**: 100% resolution of all 10 errors and 3 warnings called out in the SE Ranking website audit.
- **SC-005**: All existing smoke tests, unit tests, and Lighthouse performance assertions continue to pass with 0 regressions.

## Assumptions

- Audit notices (CSS caching/compression headers, duplicate H1s, title/description character limits, one inbound internal link) are excluded from the scope of this feature as the user specifically requested fixing errors and warnings.
- Teacher portraits will remain visually indistinguishable to human visitors after compression.
- The DropInBlog integration remains the platform for hosting blog articles.
