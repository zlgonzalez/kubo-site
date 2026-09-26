# Phase 1 Data Model: Audit Remediation Entities

## Entities & Data Structures

### 1. SitemapEntry

Represents a crawlable URL entry published in standard XML sitemaps (`sitemap-0.xml`, `ai-sitemap.xml`).

| Field | Type | Description | Constraints |
| :--- | :--- | :--- | :--- |
| `loc` | `string` | Absolute URL of the indexed page | MUST be HTTPS, MUST include trailing slash for directory routes, MUST NOT include query parameters (`?p=`) or fragments |
| `changefreq` | `string` | Suggested crawling frequency | e.g. `weekly` |
| `priority` | `string` | Search engine priority relative to other site pages | Range `0.0` to `1.0` (Homepage: `1.0`, Subpages: `0.8`) |
| `isCanonical` | `boolean` | Flag indicating whether this URL matches the page's `<link rel="canonical">` | MUST be `true` for all entries |

---

### 2. GalleryImage

Represents an enriched image asset rendered inside curriculum gallery grids (`rw-gardening`, `rw-gymnastics`, `rw-baking`).

| Field | Type | Description | Constraints |
| :--- | :--- | :--- | :--- |
| `src` | `string` | Relative path to image asset | Valid path under `/images/` |
| `alt` | `string` | Descriptive alternative text for accessibility and search indexing | Non-empty string, min 15 chars, max 125 chars, descriptive of the Montessori activity |

---

### 3. CampusFacultyProfile

Represents faculty and staff information displayed on campus landing pages (`/redwood-city-preschool-center/`).

| Field | Type | Description | Constraints |
| :--- | :--- | :--- | :--- |
| `name` | `string` | Name of educator/staff member | Required |
| `role` | `string` | Title or instructional position | Required |
| `img` | `string` | Path to staff portrait photo | Required, file on disk MUST be strictly `< 1 MB` (target `< 300 KB`) |
| `bio` | `string` | Biographical summary and educational credentials | Required |
