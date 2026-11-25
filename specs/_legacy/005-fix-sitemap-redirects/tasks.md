# Tasks: Full SEMrush Audit Remediation & Sitemap Canonicalization

**Input**: Design documents from `specs/005-fix-sitemap-redirects/`  
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/, quickstart.md

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4, US5, US6)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Test framework preparation for sitemap validation

- [x] T001 Initialize unit test suite for sitemaps in tests/unit/sitemap.test.ts

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Deprecate legacy and insecure sitemap integrations prior to story implementations

**⚠️ CRITICAL**: Must complete before user story modifications

- [x] T002 Delete legacy insecure sitemap integration in src/integrations/sitemap-http.ts
- [x] T003 Remove sitemapHttp integration import and execution from astro.config.mjs
- [x] T004 Remove sitemap-http.xml entry from robotsTxt sitemaps list in astro.config.mjs

**Checkpoint**: Foundation ready - insecure sitemap references removed; user story implementation can begin

---

## Phase 3: User Story 1 - Eliminate Redirected URLs in Primary XML Sitemap (Priority: P1) 🎯 MVP

**Goal**: Ensure all blog post entries in the primary sitemap (`sitemap-0.xml`) include a trailing slash before query parameters (`/blog/?p=${post.slug}`) to prevent web server 301/308 redirect hops.

**Independent Test**: Build the site and verify all `<loc>` tags in `dist/sitemap-0.xml` matching `/blog` use the canonical `/blog/?p=` format with zero trailing-slash discrepancies.

### Tests for User Story 1
- [x] T005 [P] [US1] Add unit test verifying primary sitemap blog post URL canonical formatting in tests/unit/sitemap.test.ts

### Implementation for User Story 1
- [x] T006 [US1] Update blogPostUrls mapping in astro.config.mjs to format URLs as https://www.kubomontessori.com/blog/?p=${post.slug}

**Checkpoint**: At this point, User Story 1 is fully functional and eliminates blog redirect issues in `sitemap-0.xml`

---

## Phase 4: User Story 2 - Normalize Canonical URLs in Secondary / AI Sitemap (Priority: P1)

**Goal**: Normalize all static pages, campuses, resource guides, and dynamic blog post entries in `ai-sitemap.xml` with canonical trailing slashes.

**Independent Test**: Build the site and inspect `dist/ai-sitemap.xml` to verify 100% of URLs end with `/` or `/blog/?p=...` with zero unslashed directory paths.

### Tests for User Story 2
- [x] T007 [P] [US2] Add unit test verifying ai-sitemap.xml paths and query string formatting in tests/unit/sitemap.test.ts

### Implementation for User Story 2
- [x] T008 [US2] Add canonical trailing slashes to all static and resource page entries in src/pages/ai-sitemap.xml.ts
- [x] T009 [US2] Update blog post URLs in src/pages/ai-sitemap.xml.ts to append trailing slash before query string (/blog/?p=${post.slug})

**Checkpoint**: User Stories 1 AND 2 resolve all 35 redirected URLs flagged in the SEMrush audit report

---

## Phase 5: User Story 3 - Remove Redirect Stubs and Ineligible Pages from Sitemaps (Priority: P2)

**Goal**: Exclude client-side redirect shim `blog.html` from appearing in the primary sitemap.

**Independent Test**: Build the site and verify `dist/sitemap-0.xml` does NOT contain any URL referencing `blog.html`.

### Tests for User Story 3
- [x] T010 [P] [US3] Add unit test verifying blog.html is excluded from sitemap output in tests/unit/sitemap.test.ts

### Implementation for User Story 3
- [x] T011 [US3] Add sitemap filter function to @astrojs/sitemap configuration in astro.config.mjs to exclude blog.html

**Checkpoint**: Primary sitemap contains exclusively canonical destination URLs and zero redirect stubs

---

## Phase 6: User Story 4 - Consistent Canonical Destination in Dynamic Redirect Rules (Priority: P3)

**Goal**: Update dynamic blog redirect destinations in `astro.config.mjs` to target `/blog/?p=${post.slug}` in a single hop.

**Independent Test**: Verify that the redirects object in `astro.config.mjs` maps `/blog/{slug}` directly to `/blog/?p={slug}`.

### Tests for User Story 4
- [x] T012 [P] [US4] Add unit test verifying single-hop dynamic blog redirect rules in tests/unit/sitemap.test.ts

### Implementation for User Story 4
- [x] T013 [US4] Update dynamic blog redirect rule destination in astro.config.mjs to /blog/?p=${post.slug}

---

## Phase 7: Full Audit - Structured Data, Titles, Media, Content & Discovery

**Purpose**: Remediate all remaining issues identified in the 60-page SEMrush Full Report

- [x] T017 [US1] Remove invalid typicalAgeRange fields and refine parent entity to EducationalOrganization in src/components/SEO.astro
- [x] T018 [US2] Shorten all title tags exceeding 70 characters in index.astro, home-vs-center-childcare.astro, montessori-vs-traditional-preschool.astro, potty-training-preschool-guide.astro, burlingame-montessori-preschool.astro, foster-city-preschool-daycare.astro, menlo-park-montessori-preschool.astro, san-carlos-montessori-preschool.astro
- [x] T019 [US3] Add descriptive alt attributes to all 5 baking activity images in src/pages/rw-baking.astro
- [x] T020 [US4] Enrich thin pages (contact.astro, rw-baking.astro, rw-location-directions.astro) to exceed 200 words and raise text-to-HTML ratios
- [x] T021 [US4] Eliminate duplicate H1 tag by converting print header to div in src/pages/resources/parent-handbook.astro
- [x] T022 [US5] Add canonical trailing slashes to all internal links in Footer.astro, index.astro, blog.html.astro, redwood-city-preschool-center.astro, rw-gardening.astro, rw-gymnastics.astro, rw-technology.astro, san-mateo-location-directions.astro, san-mateo-preschool-daycare.astro, and services.astro
- [x] T023 [US5] Add descriptive anchor text to blog preview links in src/pages/blog.astro and replace generic 'here.' anchor in src/pages/redwood-city-preschool-center.astro
- [x] T024 [US6] Create public/llms.txt following llmstxt.org standard for AI search engines
- [x] T025 Run full automated test suite (16 passing tests) in tests/unit/sitemap.test.ts and verify production build dist/ output
