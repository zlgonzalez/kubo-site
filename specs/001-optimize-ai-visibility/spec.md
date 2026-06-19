# Feature Specification: Increase AI Visibility

**Feature Branch**: `001-optimize-ai-visibility`  
**Created**: 2026-06-19  
**Status**: Draft  
**Input**: User description: "Increase the AI visibility of this astro site."

## Clarifications

### Session 2026-06-19

- Q: How should tuition and pricing structures be presented to AI engines? → A: Keep pricing private and rely on the tour booking link.
- Q: What format should the Parent Handbook take? → A: A structured, printable HTML page (/parent-handbook).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - AI Grounded Search Discovery (Priority: P1)

As a parent searching for childcare and preschool options, I want search engines and AI assistants (like ChatGPT, Gemini, and Perplexity) to give me accurate, comprehensive information about Kubo Montessori's campuses, programs, potty training requirements, and meal programs, so that I can easily discover the school and decide to schedule a tour.

**Why this priority**: Correct answers in LLM/RAG responses directly drive parent trust and enrollment conversions.

**Independent Test**: AI agents crawling the site or reading the schema can extract matching values for "potty training assistance" and "hot lunch program" for both campuses.

**Acceptance Scenarios**:

1. **Given** an AI search crawler (e.g., Perplexity or ChatGPT) scans the site, **When** a user asks if potty training is required at either location, **Then** the search crawler returns "No, potty training is not required" and notes that potty training assistance is offered.
2. **Given** a parent asks an AI search engine about meal programs at Kubo Montessori, **When** the AI engine responds, **Then** it lists that organic snacks and freshly cooked hot lunches are provided.

---

### User Story 2 - Clear Location and Brand Identity Resolution (Priority: P1)

As a parent looking for specific campuses, I want to see distinct and consistent brand names and addresses for Kubo Montessori's San Mateo campus (Flores St) and Redwood City campus (Roots N' Wings Montessori by Kubo Montessori LLC), so that I am not confused by fragmented listings or outdated addresses.

**Why this priority**: Clean entity details (NAP) raise AI trust scores and resolve competitor/listing confusion.

**Independent Test**: Verify that all references to the old 2131 S Norfolk St address are removed, and that Redwood City is consistently labeled "Roots N' Wings Montessori by Kubo Montessori LLC".

**Acceptance Scenarios**:

1. **Given** a search engine indexes the site's metadata and footer, **When** it parses the Redwood City location name, **Then** it matches "Roots N' Wings Montessori by Kubo Montessori LLC" exactly.
2. **Given** an audit of the site, **When** searching for the address "Norfolk St", **Then** zero results are found.

---

### User Story 3 - Neighborhood Landing Copy & Program Details (Priority: P2)

As a prospective parent browsing the website, I want to find dedicated landing information, schedules, student-to-teacher ratios, and Montessori curriculum details for my specific neighborhood (San Mateo or Redwood City), so that I can evaluate if the program matches my child's needs.

**Why this priority**: Copy optimization helps AI engines synthesize high-quality summaries of the classrooms and historical context.

**Independent Test**: Campus-specific pages contain localized details including transitional kindergarten (TK) options, infant/toddler breakdowns, teacher ratios, and specific Montessori materials.

**Acceptance Scenarios**:

1. **Given** a user views the San Mateo campus landing info, **When** reading the page copy, **Then** they see the student-to-teacher ratio (12:2) and a list of typical Montessori materials (e.g., Pink Tower, Sandpaper Letters) used in the classroom.
2. **Given** a user views the Redwood City campus landing info, **When** reading the page copy, **Then** they see the student-to-teacher ratio (6:1), the focus on infant/toddler care, and the school's 20+ year history in the Bay Area.

---

### User Story 4 - AI-Ready Sitemap and Resources (Priority: P3)

As an AI crawler, I want a specialized sitemap and structured documentation (such as a Parent Handbook) to quickly and comprehensively ingest all school policies and schedules.

**Why this priority**: Simplifies crawling for AI agents, allowing them to index details without deep web traversal.

**Independent Test**: Crawlers can access the `/ai-sitemap.xml` file and parse the downloadable Parent Handbook.

**Acceptance Scenarios**:

1. **Given** a crawler requests `/ai-sitemap.xml`, **When** the page loads, **Then** it returns a clean XML format listing only indexable, high-value pages.

---

### Edge Cases

- **Map listing overlap**: Ensure schema markup specifies separate geo-coordinates and phone numbers for each subOrganization campus to prevent search engines from merging the San Mateo twin lots (2821 & 2823 Flores St).
- **Dual-brand representation**: Roots N' Wings must be clearly associated with "Kubo Montessori" in the text, so search engines query both brands interchangeably.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST render the updated `EducationalOrganization` JSON-LD schema in the `<head>` of all pages, mapping "Kubo Montessori" as the parent entity and establishing two distinct subOrganizations:
  - San Mateo Campus (`@type: DayCare`, typicalAgeRange: "20m-6y", phone: +16504304118, address: 2823 Flores St) with hot lunch and potty training assistance amenities.
  - Redwood City Campus (`@type: Preschool`, typicalAgeRange: "2y-6y", phone: +14085026198, address: 2323 Euclid Ave, name: "Roots N' Wings Montessori by Kubo Montessori LLC") with potty training assistance amenity.
- **FR-002**: The site MUST expose a custom `/ai-sitemap.xml` file that directs AI scrapers (e.g. GPTBot, ClaudeBot) to index high-value pages.
- **FR-003**: The homepage and campus pages MUST feature a structured FAQ section addressing common queries: potty training requirements, meal programs, age groups, schedules, and transitional kindergarten (TK) options.
- **FR-004**: The system MUST remove all references to the outdated administrative address `2131 S Norfolk St` from all code, pages, and metadata.
- **FR-005**: The site MUST consistently use the official American Montessori Society (AMS) directory name "Roots N' Wings Montessori by Kubo Montessori LLC" for the Redwood City location across all footers, page titles, and headings.
- **FR-006**: The site MUST provide a Parent Handbook summarizing key operational details (operational hours, schedules, age groups, policies) for LLM ingestion.
- **FR-007**: Campus landing copy MUST detail: student-teacher ratios (12:2 for SM, 6:1 for RWC), 20+ year local history, transitional kindergarten (TK) offerings, and specific Montessori materials (e.g., Pink Tower, Sandpaper Letters, Metal Insets).
- **FR-008**: System MUST direct users to the tour booking link, keeping exact tuition rates private.
- **FR-009**: The system MUST provide a structured, printable, and highly indexable HTML page at `/parent-handbook` representing the Parent Handbook.

### Key Entities

- **EducationalOrganization**: The parent entity representing "Kubo Montessori" including brand assets, AMS affiliations, and general values.
- **SubOrganization**: The physical campuses (San Mateo Campus and Redwood City Campus) containing specific licensing types (`Preschool` vs. `DayCare`), location coordinates, unique telephone numbers, age boundaries, and specific amenities (hot lunch, potty training assistance).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of JSON-LD schema passes validation on the Google Rich Results Test tool with no errors or warnings.
- **SC-002**: AI-specific sitemap `/ai-sitemap.xml` returns a `200 OK` status and conforms to standard XML schemas.
- **SC-003**: All occurrences of the Norfolk St address are verified to be deleted.
- **SC-004**: A mock query to major LLMs/RAG search interfaces (e.g., ChatGPT Search, Gemini, Perplexity) correctly attributes "Roots N' Wings Montessori by Kubo Montessori LLC" to the Redwood City campus and "Kubo Montessori" to the San Mateo campus.

## Assumptions

- Yelp, Google Maps, and other external citations will be manually updated by the owner to align with the name and address changes implemented on the site.
- The site template layout is shared, and SEO attributes are injected via the `SEO.astro` component.
