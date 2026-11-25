# Data Model: AI Visibility structured entities

This document defines the structured data entities and attributes used to optimize Kubo Montessori's representation in schema graphs and copy indexing.

## 1. EducationalOrganization (Parent Entity)

Represents the core brand profile for Kubo Montessori.

| Property | Type | Description / Validation |
| :--- | :--- | :--- |
| `@type` | String | Must be `"EducationalOrganization"` |
| `name` | String | Must be `"Kubo Montessori"` |
| `url` | URL | Must be `"https://www.kubomontessori.com"` |
| `logo` | URL | Must be `"https://www.kubomontessori.com/images/logo.png"` |
| `sameAs` | Array<URL> | Must include the AMS school directory URL: `https://amshq.org/schools/roots-n-wings-montessori-by-kubo-montessori-llc-128193/` |
| `knowsAbout` | Array<String> | Pedagogy tags: `["Montessori Method", "Early Childhood Education", "Child Development"]` |
| `subOrganization` | Array<SubOrganization> | List of physical campuses |

---

## 2. SubOrganization (Campus Entity)

Represents each individual campus, detailing its specific type, contact info, and features.

### A. San Mateo Campus
- **`@type`**: `DayCare`
- **`name`**: `Kubo Montessori - San Mateo Campus`
- **`address`**:
  - `streetAddress`: `2823 Flores St` (primary operational lot)
  - `addressLocality`: `San Mateo`
  - `addressRegion`: `CA`
  - `postalCode`: `94403`
  - `addressCountry`: `US`
- **`telephone`**: `+16504304118` (San Mateo phone)
- **`typicalAgeRange`**: `20m-6y`
- **`amenityFeature`**:
  - `name`: `"Fresh Cooked Hot Lunch"`
  - `value`: `true`
  - `name`: `"Potty Training Assistance"`
  - `value`: `true`

### B. Redwood City Campus
- **`@type`**: `Preschool`
- **`name`**: `Roots N' Wings Montessori by Kubo Montessori LLC`
- **`address`**:
  - `streetAddress`: `2323 Euclid Ave`
  - `addressLocality`: `Redwood City`
  - `addressRegion`: `CA`
  - `postalCode`: `94061`
  - `addressCountry`: `US`
- **`telephone`**: `+14085026198` (Redwood City phone)
- **`typicalAgeRange`**: `2y-6y`
- **`amenityFeature`**:
  - `name`: `"Potty Training Assistance"`
  - `value`: `true`

---

## 3. FAQItem (Structured QA Entity)

Used to build homepage copy that directly answers standard scraper queries.

| Property | Type | Description |
| :--- | :--- | :--- |
| `question` | String | The query asked by parents (e.g. potty training policies). |
| `answer` | String | Concise, fact-filled answer for AI ingestion. |
