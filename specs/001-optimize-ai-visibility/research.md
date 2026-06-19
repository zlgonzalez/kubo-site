# Research Notes: AI Visibility Optimization

**Feature**: Increase AI Visibility  
**Date**: 2026-06-19  

## 1. Schema.org Multi-Location Graph
To solve the entity fragmentation between the San Mateo and Redwood City campuses, we researched the optimal JSON-LD structure for a school with multiple locations.

- **Decision**: Embed a unified `EducationalOrganization` root node containing a `subOrganization` array.
- **Why Chosen**: This informs AI/RAG scrapers that both sites share a single brand ("Kubo Montessori"), while maintaining distinct operations, directories, and licenses (`DayCare` for SM, `Preschool` for RWC).
- **Structure Details**:
  - Parent: `EducationalOrganization` -> Kubo Montessori
  - Sub-organization 1: `DayCare` -> Kubo Montessori - San Mateo Campus (2823 Flores St, typicalAgeRange: "20m-6y", phone: +16504304118, hot lunch and potty training assistance amenities).
  - Sub-organization 2: `Preschool` -> Roots N' Wings Montessori by Kubo Montessori LLC (2323 Euclid Ave, typicalAgeRange: "2y-6y", phone: +14085026198, potty training assistance amenity).
- **Alternatives Considered**: 
  - *Multiple disjoint LocalBusiness schemas*: Rejected because it does not resolve the dual-brand name matching and weakens local SEO authority.

## 2. Dynamic AI Sitemap (`/ai-sitemap.xml`)
We need a dedicated, crawler-friendly sitemap specifically targeting AI agents.

- **Decision**: Create an Astro API endpoint page at `src/pages/ai-sitemap.xml.ts` that dynamically generates the XML sitemap.
- **Why Chosen**: Allows us to control exactly which high-value content pages are exposed to AI scrapers (e.g. homepage, location landing pages, parent handbook page) without bloating it with low-value utility assets.
- **Target Pages**:
  - `/` (Home)
  - `/homedaycare` (San Mateo Campus)
  - `/rw` (Redwood City Campus)
  - `/parent-handbook` (New Handbook)
  - `/about` (History/Pedagogy)
  - `/services` (Enrichment Programs)

## 3. Parent Handbook Delivery
We researched the best delivery format for the Parent Handbook to maximize LLM indexability.

- **Decision**: Create a dedicated, structured HTML page at `/parent-handbook` (stored at `src/pages/parent-handbook.astro`) with a clean print-friendly stylesheet.
- **Why Chosen**: Text-based HTML is read natively by all LLM scrapers without requiring complex PDF parsers. It is also mobile-friendly and can be printed/saved as a PDF by parents using the browser's native print function.
- **Content Outline**:
  - Operating Hours & Schedules
  - Daily Routines (Infant/Toddler vs. Preschool/TK)
  - Potty Training Assistance Policy
  - Organic Meal Program (Freshly Cooked Hot Lunch)
  - Parent Guidelines & Admissions Steps

## 4. Brand Name & Naming Consistency
- **Decision**: Update all page copy references from "Roots N Wings Montessori of Woodside" to "Roots N' Wings Montessori by Kubo Montessori LLC" (or "Roots N' Wings Montessori" in headlines) to match the official AMS Directory.
- **Norfolk St Address Cleanup**: Verify that no page copy or footer links refer to the outdated `2131 S Norfolk St` address (which has already been cleaned up in the current source base, but will be double-checked during compilation/build).
