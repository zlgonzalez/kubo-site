# Feature Specification: Local SEO & AI SEO (GEO) Growth Strategy

**Feature Branch**: `004-local-seo-and-geo`  
**Created**: 2026-08-19  
**Status**: Draft  
**Input**: User description: "Read the attached seo.md file and solve the SEO problem for this website by applying the recommendations here that is applicable to this code base."

## Clarifications

### Session 2026-08-19

- Q: Which specific target cities should have dedicated landing pages created in Phase 1? → A: Full Peninsula roll-out: Foster City (`/foster-city-preschool-daycare`), Belmont (`/belmont-ca-montessori-daycare`), San Carlos (`/san-carlos-montessori-preschool`), Burlingame (`/burlingame-montessori-preschool`), and Menlo Park (`/menlo-park-montessori-preschool`) landing pages.
- Q: How should tour booking calls to action (CTAs) behave on the new local landing pages and educational resource pages? → A: Embed real-time Calendly scheduling widget (`CalendarWidget.astro`) directly on local pages for instant tour booking.
- Q: Should high-intent educational guides be published under a dedicated `/resources/` routing namespace or integrated into the existing Astro blog collection (`/blog/`)? → A: Dedicated `/resources/<slug>` routes (e.g. `/resources/montessori-vs-traditional-preschool`) for evergreen SEO guides.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Geo-Targeted Local Discovery for Peninsula Parents (Priority: P1)

As a parent living in neighboring Peninsula communities (such as Foster City, Belmont, San Carlos, Burlingame, Menlo Park, San Mateo, or Redwood City) searching online for toddler or preschool care, I want to land on dedicated local landing pages that explicitly address my location, commute distance, program details, and enrollment options, so that I can evaluate whether Kubo Montessori is the right fit and schedule a private tour.

**Why this priority**: Unbranded local search queries ("Montessori preschool near Foster City", "daycare near Belmont CA", "preschool near San Carlos") represent the primary opportunity to reach new families who do not already know the brand name.

**Independent Test**: Can be tested independently by navigating to new geo-landing pages (e.g. Foster City, Belmont, San Carlos, Burlingame, Menlo Park pages), verifying localized title tags, headers, commute highlights, campus specs, embedded maps, and functioning tour request CTAs.

**Acceptance Scenarios**:

1. **Given** a parent searching for childcare serving Foster City, **When** they visit the Foster City landing page, **Then** they see localized messaging highlighting the short commute to the San Mateo campus, key campus specifications (ratios, ages, hours, potty training support, organic meal program), an interactive campus specs comparison table, and a prominent tour scheduling call to action.
2. **Given** a parent searching for daycare options in Belmont or San Carlos, **When** they visit the corresponding local landing page, **Then** they view targeted campus location details, driving distance context, program highlights, and an instant tour booking path.
3. **Given** a parent viewing any local landing page on a mobile device, **When** they attempt to request a tour, **Then** the form is clear, accessible, and requires minimal input steps to submit.

---

### User Story 2 - AI Search Engine & Generative Engine Visibility (Priority: P2)

As a parent asking generative AI assistants or search engines for childcare recommendations (e.g., "best Montessori preschools near San Mateo with hot lunch and no potty training requirement"), I want search engines and AI engines to cite Kubo Montessori accurately with factual, structured program information, so that I receive complete and trustworthy details about both physical campuses.

**Why this priority**: Generative AI tools and AI search overviews rely on machine-readable structured data and tabular content to recommend local educational facilities in response to complex prompt queries.

**Independent Test**: Can be tested independently by inspecting structured JSON-LD schema markup on all landing pages and verifying the presence of standardized direct answer Quick-Fact tables and structured FAQ sections.

**Acceptance Scenarios**:

1. **Given** a search engine crawler or AI web scraper indexing the site, **When** it parses the home and campus pages, **Then** it finds valid multi-entity structured data linking the parent Educational Organization to both the San Mateo Campus and the Roots N' Wings Redwood City Campus with complete address, geo-coordinates, age ranges, opening hours, and service areas.
2. **Given** a site visitor or AI extractor reading a program or campus landing page, **When** it scans the content, **Then** it encounters a standardized Quick-Fact table detailing student-teacher ratios, operating hours, age limits, meal programs, and potty training policies.
3. **Given** a parent looking for specific answers about enrollment, mixed-age classrooms, or ratios, **When** they inspect the FAQ section on campus pages, **Then** they read collapsible answer engines with corresponding structured FAQ data.

---

### User Story 3 - High-Intent Educational Content & Philosophy Guides (Priority: P3)

As a researching parent comparing early education philosophies or navigating developmental milestones, I want to read authoritative guide articles on topics like Montessori vs. traditional preschool, potty-training support policies, and home-based vs. center-based environments, so that I can make an informed decision and trust Kubo's expertise.

**Why this priority**: Educational content targets parents early in their decision funnel when they are researching concepts rather than specific school names, converting early research into tour requests.

**Independent Test**: Can be tested independently by publishing accessible resource guide pages under `/resources/<slug>` with clear navigation back to campus landing pages and tour booking prompts.

**Acceptance Scenarios**:

1. **Given** a parent researching preschool potty training prerequisites, **When** they read the potty training guide resource page at `/resources/potty-training-preschool-guide`, **Then** they learn about Kubo's collaborative toilet-learning approach and find a direct link to book a campus tour.
2. **Given** a parent evaluating Montessori vs. traditional preschools, **When** they visit the philosophy guide article at `/resources/montessori-vs-traditional-preschool`, **Then** they view a clear comparison of 3-hour work cycles, multi-age classrooms, and emotional regulation, with CTAs for visiting both campuses.

---

### Edge Cases

- What happens when a user visits a geo-landing page for a city where Kubo does not have a physical mailbox (e.g., Foster City, Belmont, San Carlos)? The page must clearly explain the exact commute distance, driving route from that city, and specific campus location details without misrepresenting physical office address.
- How does the system handle structured schema validation when multiple campus entities exist on one site? The structured data must use a multi-entity graph structure where each campus references the main parent organization without duplicating main brand identity.
- What happens when a user attempts to book a tour on a small screen mobile device? Form fields must remain responsive, easy to tap, and validate inputs without blocking layout or losing submission context.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide dedicated geo-targeted landing pages for target Peninsula communities (Foster City, Belmont, San Carlos, Burlingame, and Menlo Park) optimized for local parent search terms.
- **FR-002**: Every city landing page MUST include localized title tags, meta descriptions, localized H1 headers, commute/distance highlights from the target city, interactive campus specifications, embedded map orientation, and direct tour request calls to action.
- **FR-003**: System MUST embed multi-entity machine-readable structured schema markup across website pages, defining the primary Educational Organization as well as separate campus entities for San Mateo (Casa dei Bambini) and Redwood City (Roots N' Wings).
- **FR-004**: System MUST include standardized "At a Glance" Quick-Fact comparison tables on all campus and program pages displaying student-to-teacher ratios, age ranges, operating hours, potty training policy, daily meal programs, and licensing information.
- **FR-005**: System MUST present structured, collapsible FAQ sections on campus pages with corresponding machine-readable FAQ structured data covering key parent inquiries (potty training support, ratios, mixed-age benefits, and enrollment process).
- **FR-006**: System MUST provide educational guide resources published under a dedicated `/resources/<slug>` routing structure addressing key parent research topics (including Montessori vs. traditional preschool comparisons, potty training support policies, and small home-based vs. center-based childcare advantages).
- **FR-007**: System MUST embed real-time Calendly scheduling widget integration (via `CalendarWidget.astro`) directly on local landing pages and campus pages to provide an instant, low-friction tour booking workflow across desktop and mobile screens.

### Key Entities

- **Educational Organization**: The overarching institutional entity representing Kubo Montessori, including founder credentials, brand identity, and foundational values.
- **Campus Entity**: Physical operational sites (San Mateo Campus on Flores St and Redwood City Campus on Euclid Ave) with specific physical addresses, geographic coordinates, age groups served, ratios, operating hours, and localized service areas.
- **Geo Landing Page**: A localized web page designed for a specific target municipality (e.g., Foster City, Belmont, San Carlos, Burlingame, Menlo Park) highlighting proximity, commute routes, campus features, and local tour booking paths.
- **Quick-Fact Table**: A standardized tabular data structure summarizing key operational metrics across campuses for human readers and automated generative AI indexers.
- **Educational Resource Guide**: Deep-dive content articles addressing parent decision criteria and philosophy comparisons published under `/resources/` to capture early-stage search traffic.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Increase non-branded search visibility by establishing indexable local landing pages and resources targeting key Peninsula search terms across Foster City, Belmont, San Carlos, Burlingame, Menlo Park, San Mateo, and Redwood City.
- **SC-002**: 100% of campus and local landing pages validate without errors on structured data validation engines for EducationalOrganization, Preschool, ChildCare, and FAQPage schemas.
- **SC-003**: 100% of program and campus pages feature machine-readable Quick-Fact summary tables that render cleanly across desktop and mobile screen sizes.
- **SC-004**: Tour request conversion path on mobile devices can be completed in 3 or fewer simple form interaction steps.

## Assumptions

- Target audience consists of Bay Area Peninsula parents searching for infant, toddler, preschool, and daycare programs on desktop and mobile devices.
- Physical campus addresses and operating details remain centered at San Mateo (Flores St) and Redwood City (Euclid Ave).
- Existing site design and layout components can be extended to support new localized pages, Quick-Fact tables, FAQ sections, and structured data headers.
