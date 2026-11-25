# Feature Specification: Full SEMrush SEO Audit Remediation

**Feature Branch**: `005-fix-sitemap-redirects` (reused per user request)  
**Created**: September 13, 2026  
**Status**: In Progress  
**Input**: User description: "Read the full audit in the attached document and also fix it. Do not create a new git branch and use the existing branch."

## Clarifications

### Session 2026-09-13
- Q: Branch selection for full audit → A: Reuse existing branch `005-fix-sitemap-redirects` without creating a new branch.
- Q: Scope of remediation → A: Fix all issues identified in the SEMrush Full Report: invalid structured data (172 items), title lengths > 70 characters, missing image alt attributes, low word count pages, multiple H1 tags, unslashed internal links causing permanent redirects, non-descriptive anchor text, and missing `llms.txt`.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Eliminate Invalid Structured Data Errors (Priority: P1)

Search engines validating JSON-LD schema across the website encounter 172 validation errors caused by invalid property `typicalAgeRange` and missing `address` on parent organization entities. The structured data must conform strictly to Google Search guidelines and Schema.org standards.

**Why this priority**: Structured data errors prevent Google from generating rich snippets and knowledge graph entries, directly harming organic search visibility.

**Independent Test**: Validate schema output on all pages via schema validation to ensure 0 errors and 0 missing required fields.

**Acceptance Scenarios**:
1. **Given** any page using `SEO.astro`, **When** Google's Rich Results validator parses the JSON-LD `@graph`, **Then** the root `EducationalOrganization` has no missing required fields and contains no invalid properties.
2. **Given** campus schemas for San Mateo and Redwood City, **When** validated, **Then** all properties (`address`, `geo`, `telephone`, `openingHoursSpecification`) are valid Schema.org fields.

---

### User Story 2 - Optimize Title Tag Lengths (Priority: P1)

Search engine result pages (SERPs) truncate page titles longer than 70 characters with ellipses (`...`). All page titles must be concise (under 70 characters) while preserving primary keywords and school branding.

**Why this priority**: Truncated titles decrease click-through rate (CTR) and appear unpolished in search listings.

**Independent Test**: Measure title lengths across all rendered HTML pages; all must be between 20 and 70 characters.

**Acceptance Scenarios**:
1. **Given** the homepage and resource guide pages, **When** the `<title>` tag is generated, **Then** its character count is strictly $\le 70$ characters.

---

### User Story 3 - Provide Alt Text for Images & Accessibility (Priority: P2)

All instructional and activity images on the website must provide clear, meaningful `alt` attributes to satisfy search engine image indexing and assistive technology accessibility standards.

**Why this priority**: Missing alt attributes hurt image search rankings and degrade accessibility for visually impaired parents.

**Independent Test**: Audit HTML to ensure every `<img>` element contains a descriptive `alt` attribute.

**Acceptance Scenarios**:
1. **Given** the Baking program page (`/rw-baking/`), **When** page images render, **Then** all 5 activity photos have descriptive alt attributes describing Montessori baking activities.

---

### User Story 4 - Enrich Low Word Count Pages & Eliminate Multiple H1 Tags (Priority: P2)

Pages with thin content (< 200 words) or low text-to-HTML ratio signal low quality to crawlers. Thin pages must be enriched with valuable, informative content for parents. Pages must also have exactly one `<h1>` heading.

**Why this priority**: Search engines demote thin content pages. Multiple H1 tags confuse heading hierarchy and user accessibility.

**Independent Test**: Verify that `/contact/`, `/rw-baking/`, and `/rw-location-directions/` each contain over 200 meaningful words, and `/resources/parent-handbook/` contains exactly one `<h1>` tag.

**Acceptance Scenarios**:
1. **Given** `/contact/`, `/rw-baking/`, and `/rw-location-directions/`, **When** crawled, **Then** word counts exceed 200 words.
2. **Given** `/resources/parent-handbook/`, **When** inspected, **Then** there is exactly one `<h1>` tag.

---

### User Story 5 - Eliminate Internal Link Permanent Redirects & Non-Descriptive Anchors (Priority: P2)

Internal links across headers, footers, breadcrumbs, and page bodies currently omit trailing slashes, causing 696 internal 301 redirect hops. Furthermore, links using generic text ("Read more →", "here.") hinder contextual understanding.

**Why this priority**: Internal redirect chains deplete crawler budget, slow mobile navigation, and dilute internal PageRank. Descriptive anchors enhance keyword relevance.

**Independent Test**: Scan all internal `<a href="...">` links to verify 100% link directly to canonical trailing-slash destinations and avoid generic anchor text.

**Acceptance Scenarios**:
1. **Given** navigation and in-page links, **When** clicked or crawled, **Then** destinations include canonical trailing slashes (`/about/`, `/services/`, etc.) with zero redirect hops.
2. **Given** blog preview cards and directional links, **When** inspected, **Then** anchor text clearly specifies the target article or resource.

---

### User Story 6 - Provide `llms.txt` for AI Crawlers (Priority: P3)

AI search engines (ChatGPT, Perplexity, Claude) utilize `llms.txt` in the root directory to ingest clean, structured summaries and references about the school.

**Why this priority**: SEMrush AI Search Health tracks `llms.txt` presence to support AI bot discoverability.

**Independent Test**: Requesting `/llms.txt` returns HTTP 200 with valid markdown following `llmstxt.org` specifications.

**Acceptance Scenarios**:
1. **Given** an AI crawler requests `https://www.kubomontessori.com/llms.txt`, **Then** the server responds with a markdown overview of Kubo Montessori, campuses, curriculum, and canonical links.

---

## Success Criteria *(mandatory)*

- **SC-001**: 0 structured data errors across all site pages in schema validation.
- **SC-002**: 100% of page `<title>` tags contain 70 characters or less.
- **SC-003**: 0 images with missing `alt` attributes across the entire site.
- **SC-004**: 0 indexable public pages with fewer than 200 words.
- **SC-005**: Exactly 1 `<h1>` tag on every page, including `/resources/parent-handbook/`.
- **SC-006**: 0 internal navigation links targeting unslashed redirect URLs.
- **SC-007**: 0 generic "here." anchor text; all blog "Read more" links provide descriptive context.
- **SC-008**: `llms.txt` successfully served at root `/llms.txt`.
