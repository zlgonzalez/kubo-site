# Phase 0 Research: Audit Errors and Warnings Remediation

## Research Topics & Decisions

### 1. XML Sitemap Canonicalization (10 Audit Errors)

- **Context**: SE Ranking flagged 10 errors under "Non-canonical pages in XML sitemap" because `sitemap-0.xml` and `ai-sitemap.xml` included `https://www.kubomontessori.com/blog/?p=<slug>`. At runtime, `/blog/?p=...` serves `dist/blog/index.html` whose HTML canonical tag is `<link rel="canonical" href="https://www.kubomontessori.com/blog/">`. Sitemaps must strictly contain self-referencing canonical URLs.
- **Decision**: 
  - Remove `customPages: blogPostUrls` from `@astrojs/sitemap` in `astro.config.mjs`.
  - In `src/pages/ai-sitemap.xml.ts`, include `/blog/` in the static `pages` array and remove the query parameter loop appending `/blog/?p=${post.slug}`.
  - Retain the dynamic 301 redirects in `astro.config.mjs` (`/blog/:slug` -> `/blog/?p=:slug`) so that direct visits to blog article paths continue redirecting to the DropInBlog viewer without breaking links.
- **Rationale**: 
  - Search engines penalize sitemaps containing URLs that redirect or declare another page as canonical.
  - Astro's built-in static sitemap generator will naturally index all canonical pages including `/blog/`.
  - This eliminates 100% of sitemap errors in the SE Ranking audit.
- **Alternatives Considered**:
  - *Generating static `/blog/[slug].astro` pages*: DropInBlog uses client-side JavaScript embedding (`0530ca52-...js`) that queries `window.location.search` for `?p=`. Creating static subpages would decouple from DropInBlog's rendering script and require custom API data synchronization, adding substantial unnecessary complexity.
  - *Modifying canonical tag to self-reference query parameters*: In static Astro SSG, `/blog/?p=...` is served by the pre-rendered `dist/blog/index.html` file. Serving dynamic canonical tags without SSR is not possible and would violate Google's preference against indexing duplicate query parameter variations of a single listing page.

---

### 2. Gallery Image Accessibility & Alt Attributes (2 Audit Warnings)

- **Context**: SE Ranking flagged 2 warnings for "Alt text missing" on `/rw-gardening/` and `/rw-gymnastics/`. Both pages rendered galleries using an array of image strings mapped to `<img src={img} ... />` with no `alt` attribute.
- **Decision**:
  - Refactor the image data structures in `src/pages/rw-gardening.astro` and `src/pages/rw-gymnastics.astro` from `string[]` to `{ src: string; alt: string }[]`, identical to the proven pattern in `src/pages/rw-baking.astro`.
  - Provide descriptive, context-specific alternative text highlighting the Montessori curriculum, hands-on learning, and physical development.
- **Rationale**:
  - Meets WCAG 2.1 AA accessibility guidelines (1.1.1 Non-text Content).
  - Eliminates 2 SE Ranking audit warnings.
  - Enhances image search visibility and screen reader UX.
- **Alternatives Considered**:
  - *Hardcoding alt text as a generic title*: e.g., "Gardening photo 1". Rejected because accessibility guidelines require descriptive, meaningful descriptions of what is happening in each photograph.

---

### 3. Image Payload Optimization (1 Audit Warning)

- **Context**: SE Ranking flagged 1 warning for "Image too big" on `/redwood-city-preschool-center/` (> 1 MB limit). Examination of `public/images/` reveals:
  - `aileen-amar.jpeg`: 1,438,208 bytes (~1.4 MB)
  - `joy-pacaigue.jpg`: 1,061,643 bytes (~1.01 MB)
- **Decision**:
  - Compress `aileen-amar.jpeg` and `joy-pacaigue.jpg` using Node.js `sharp` with MozJPEG optimization (quality: 82), reducing their file sizes to ~150–250 KB (well under the 1 MB ceiling and meeting standard web performance budgets).
  - Maintain the exact file paths and names (`/images/aileen-amar.jpeg`, `/images/joy-pacaigue.jpg`) so that no markup changes are required in `src/pages/redwood-city-preschool-center.astro`.
- **Rationale**:
  - Directly eliminates the audit warning.
  - Improves Largest Contentful Paint (LCP) and mobile bandwidth consumption.
  - Preserves visual fidelity on high-resolution and retina displays.
- **Alternatives Considered**:
  - *Converting to WebP with new filenames*: Would require updating component references and potential cache issues. Optimizing the existing JPEG files maintains backwards compatibility and keeps the diff minimal.

---

### 4. Test Suite Harmonization

- **Context**: Existing tests (`tests/unit/sitemap.test.ts` and `tests/smoke.spec.ts`) checked for the presence of `/blog/?p=` in sitemaps from the earlier implementation.
- **Decision**:
  - Update `tests/unit/sitemap.test.ts` to assert that XML sitemaps contain ONLY canonical URLs and NO query parameters (`/blog/?p=`).
  - Add unit test coverage verifying that all gallery images on `/rw-gardening/` and `/rw-gymnastics/` have `alt` attributes.
  - Add unit test coverage verifying all image files referenced on `/redwood-city-preschool-center/` are strictly < 1 MB.
  - Update `tests/smoke.spec.ts` blog sitemap assertion to verify `/blog/` is present and `/blog/?p=` is absent.
- **Rationale**: Ensures the entire test suite passes (`test:unit`, `test:lighthouse`, `test:e2e`) without regressions.
