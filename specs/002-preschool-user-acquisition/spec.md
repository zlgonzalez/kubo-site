# Feature Specification: Local SEO and AI Search Optimization

**Feature Branch**: `002-preschool-user-acquisition`  
**Created**: 2026-06-20  
**Status**: Draft  
**Input**: User description: "Take a look at Analytics_overview.pdf, do an analysis and create a plan to improve new user acquisition based on search criteria when prospective customers in the Peninsula Bay Area is using for a preschool for their children."

## Clarifications

### Session 2026-06-20

- Q: Preferred primary URL structure for the San Mateo campus page → A: `/san-mateo-preschool-daycare`
- Q: Blog post indexing strategy → A: Keep DropInBlog and implement server-side pre-rendering / RSS integration
- Q: Redwood City primary URL structure → A: `/redwood-city-preschool-center` (with 301 redirect from `/rw`)

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Local Search Discovery for San Mateo Campus (Priority: P1)

As a parent living in San Mateo searching for local child care, preschool, or Montessori daycare options, I want to find the Kubo Montessori San Mateo campus easily via Google Search, so that I can discover its programs and schedule an onsite tour.

**Why this priority**: Highly critical because currently, organic search only accounts for 6.6% of new user acquisition, and there is zero organic search visibility or clicks for San Mateo location keywords despite the school operating two campuses there.

**Independent Test**: Can be fully tested by looking up localized queries (e.g., "San Mateo preschool", "Montessori daycare San Mateo") on a search engine simulator and verifying that the San Mateo landing page appears in search results and delivers clear value.

**Acceptance Scenarios**:

1. **Given** a parent in the San Mateo area, **When** they search for "daycare in San Mateo" or "San Mateo preschool", **Then** the Kubo Montessori San Mateo page appears in organic search results.
2. **Given** a searcher clicks the San Mateo organic result, **When** the page loads, **Then** they see localized headlines, programs, addresses, and call-to-actions specifically for the San Mateo campuses.

---

### User Story 2 - Local Search Discovery for Redwood City Campus (Priority: P1)

As a parent living in Redwood City searching for local preschools or nature-based child care, I want to find the Roots N' Wings Redwood City campus easily via Google Search, so that I can explore its classroom environment and schedule a tour.

**Why this priority**: Critical because although Redwood City currently receives some branded clicks and limited generic clicks (e.g., "redwood city preschools"), we need to improve ranking for non-branded high-intent searches.

**Independent Test**: Can be fully tested by executing queries (e.g., "Redwood City preschools", "daycare Redwood City") on a search engine simulator and verifying that the Roots N' Wings Redwood City landing page ranks high.

**Acceptance Scenarios**:

1. **Given** a parent in the Redwood City area, **When** they search for "Redwood City preschools" or "nature-based daycare Redwood City", **Then** the Roots N' Wings Redwood City page is listed prominently.
2. **Given** a searcher clicks the Redwood City result, **When** the page loads, **Then** they are presented with teacher credentials, schedules, calendar, and clear directions.

---

### User Story 3 - AI Search Engine Recommendations (Priority: P2)

As a tech-savvy parent using an AI assistant (like ChatGPT, Gemini, or Perplexity) to find preschool options on the Peninsula, I want the AI to recommend Kubo Montessori with accurate details based on specific criteria (e.g., potty training support, age limits, organic meals).

**Why this priority**: More parents are using LLM-powered search tools to make decisions. The site's content needs to be structured in a way that AI crawlers can easily parse and summarize key school policies.

**Independent Test**: Can be fully tested by prompting AI search engines (or simulating search crawler requests) to look for "Montessori preschools in San Mateo that offer hot lunch and assist with potty training" and verifying that Kubo Montessori is listed with correct attributes.

**Acceptance Scenarios**:

1. **Given** an AI search assistant crawling the site, **When** a user asks "Which preschools in San Mateo do not require potty training?", **Then** the AI assistant extracts this detail directly from the site and lists Kubo Montessori San Mateo.
2. **Given** an AI search query about "Kubo Montessori schedule and age range", **When** queried, **Then** the AI accurately lists the ages (20 months to 6 years) and operating hours for each campus.

---

### User Story 4 - Accessing Local Maps & Directions (Priority: P3)

As a parent who has scheduled a learning tour, I want to find exact directions, maps, and parking information for the campus on the website, so that I can easily navigate to the school.

**Why this priority**: Improves user experience and local search relevance. While Redwood City has a directions page, San Mateo does not.

**Independent Test**: Can be fully tested by clicking the "Directions" link on the San Mateo campus section and verifying that the page renders an interactive map with detailed transit/parking advice.

**Acceptance Scenarios**:

1. **Given** a parent visiting the San Mateo location page, **When** they click "Directions", **Then** they are taken to a dedicated San Mateo directions page containing an embedded Google Map and local parking details.

---

### Edge Cases

- **Adjacent City Queries**: A parent in Foster City, Belmont, or San Carlos searches for preschools. The landing pages should mention these adjacent Peninsula cities to capture near-by traffic.
- **Specific Program Queries**: A parent searches for "Montessori Toddler Care" (San Mateo) or "Transitional Kindergarten (TK)" (Redwood City). The pages must clearly distinguish the ages and programs offered at each location to avoid confusion.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Page titles and meta descriptions for all location-specific pages MUST incorporate high-volume, geo-targeted search terms (e.g., "San Mateo, CA", "Redwood City, CA", "Montessori Preschool", "Daycare").
- **FR-002**: The URL paths for all campus locations MUST be updated or aliased to geo-focused paths to improve SEO relevance (e.g., renaming or redirecting `/homedaycare` and `/rw`).
- **FR-003**: The San Mateo campus landing page MUST be enriched with high-quality media (images/video), teacher bios/profiles, and an interactive map embed to match the content depth of the Redwood City page.
- **FR-004**: A dedicated local directions and campus parking page MUST be created for the San Mateo campus (e.g., `/san-mateo-location-directions`) to mirror the Redwood City directions page.
- **FR-005**: All campus landing pages MUST feature a structured information section (such as a table or key-value list) summarizing key school features (Licensed capacity, Age ranges, Potty training policy, Meal inclusion, Teacher-student ratio, Hours of operation) to facilitate AI web crawler indexing.
- **FR-006**: The site's sitemap and robots.txt MUST be updated to include all new location and directions pages.
- **FR-007**: Structured Schema.org data (JSON-LD) MUST be optimized on a per-page basis to represent `DayCare` (San Mateo) and `Preschool` (Redwood City) with their respective address and geo-coordinates.
- **FR-008**: System MUST support `/san-mateo-preschool-daycare` as the primary URL structure for the San Mateo campus page.
- **FR-009**: System MUST handle blog post indexing by keeping DropInBlog and implementing server-side pre-rendering or RSS feed integration so that posts are indexable by search engines and AI assistants.
- **FR-010**: System MUST support `/redwood-city-preschool-center` as the primary URL structure for the Redwood City campus page, with a 301 redirect from `/rw` to preserve search equity.

### Key Entities

- **Campus Location**: Represents a physical campus of Kubo Montessori (San Mateo or Redwood City). Key attributes: address, geo-coordinates, age range, capacity, potty training policy, meal plan, and operating hours.
- **Teacher Profile**: Represents a Montessori guide at a specific campus. Key attributes: name, bio, photo, and credential type.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Increase monthly organic search impressions for Peninsula-related preschool and daycare keywords (e.g. "San Mateo preschool", "Redwood City daycare") by 150% within 90 days.
- **SC-002**: Double the volume of monthly organic search acquisitions, raising organic channel share from 6.6% to over 20%.
- **SC-003**: AI search assistants (ChatGPT, Gemini, Perplexity) correctly list Kubo Montessori when asked for preschools in San Mateo or Redwood City with specific policies (e.g., potty training not required, hot meals) 95% of the time.
- **SC-004**: Prospective parents can find directions, school hours, and tour scheduling links within 2 clicks from any location landing page.

## Assumptions

- Kubo Montessori operates physical campuses in San Mateo (Flores St) and Redwood City (Euclid Ave).
- Media files, images, and teacher biography details for the San Mateo campus will be provided by school administrators.
- External directory listings (like Google Business Profile, Yelp, Apple Maps) will be updated separately to match the new URLs and titles, but are outside the scope of this repository's codebase.
