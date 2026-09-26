# Interface & Compliance Contract: SEO & Accessibility Audit

## Contract Specifications

### 1. XML Sitemap Output Contract (`sitemap-0.xml` and `ai-sitemap.xml`)

- **Schema**: Valid XML according to `http://www.sitemaps.org/schemas/sitemap/0.9`.
- **Invariants**:
  - Every `<loc>` element MUST begin with `https://www.kubomontessori.com/`.
  - Every `<loc>` element representing a page route MUST end with a trailing slash (`/`).
  - No `<loc>` element may contain a query string (`?`) or hash fragment (`#`).
  - Specifically, `/blog/?p=` MUST NOT appear in any sitemap.
  - The canonical blog listing page `https://www.kubomontessori.com/blog/` MUST appear in both sitemaps.

---

### 2. Gallery Component Image Contract (`/rw-gardening/` & `/rw-gymnastics/`)

- **Markup Requirement**:
  - Every `<img>` rendered within `.grid` galleries MUST contain a populated, non-empty `alt` attribute.
  - No `<img>` tag may have `alt=""` (unless explicitly decorative, which gallery photos are not) or omit `alt`.
- **Validation Rule**:
  - HTML parser verifying `img:not([alt])` on `/rw-gardening/` and `/rw-gymnastics/` yields `0` matches.

---

### 3. Media Asset Payload Contract (`/redwood-city-preschool-center/`)

- **File Size Budget**:
  - For every image loaded by `/redwood-city-preschool-center/`:
    `fileSizeBytes < 1,000,000` (strictly under 1 MB).
  - Target optimization range: `100 KB - 300 KB`.
- **Format & Visual Integrity**:
  - Preserves JPEG format.
  - Preserves original dimensions.
