# Contract: Sitemap & Crawl Discovery Specifications

## 1. Primary Sitemap Output Contract (`/sitemap-index.xml` & `/sitemap-0.xml`)

### Format: XML 1.0 (sitemaps.org standard)
- **Root element**: `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`
- **Item schema**:
  ```xml
  <url>
    <loc>https://www.kubomontessori.com/{path}/</loc>
  </url>
  ```
  Or for blog posts:
  ```xml
  <url>
    <loc>https://www.kubomontessori.com/blog/?p={slug}</loc>
  </url>
  ```

### Requirements & Constraints:
- Every `<loc>` MUST start with `https://www.kubomontessori.com`.
- Every static page `<loc>` MUST have a trailing slash `/`.
- Every blog post `<loc>` MUST have `/blog/?p=` with a trailing slash before the query string.
- The redirect shim `blog.html` MUST NOT appear anywhere in the sitemap.

---

## 2. AI Sitemap Output Contract (`/ai-sitemap.xml`)

### Format: XML 1.0
- **Endpoint**: `https://www.kubomontessori.com/ai-sitemap.xml`
- **Response Headers**: `Content-Type: application/xml; charset=utf-8`
- **Item schema**:
  ```xml
  <url>
    <loc>https://www.kubomontessori.com/{path}/</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  ```
- **Included Paths**:
  - `https://www.kubomontessori.com/` (Homepage, priority `1.0`)
  - `https://www.kubomontessori.com/san-mateo-preschool-daycare/`
  - `https://www.kubomontessori.com/redwood-city-preschool-center/`
  - `https://www.kubomontessori.com/foster-city-preschool-daycare/`
  - `https://www.kubomontessori.com/belmont-ca-montessori-daycare/`
  - `https://www.kubomontessori.com/san-carlos-montessori-preschool/`
  - `https://www.kubomontessori.com/burlingame-montessori-preschool/`
  - `https://www.kubomontessori.com/menlo-park-montessori-preschool/`
  - `https://www.kubomontessori.com/resources/montessori-vs-traditional-preschool/`
  - `https://www.kubomontessori.com/resources/potty-training-preschool-guide/`
  - `https://www.kubomontessori.com/resources/home-vs-center-childcare/`
  - `https://www.kubomontessori.com/resources/parent-handbook/`
  - `https://www.kubomontessori.com/about/`
  - `https://www.kubomontessori.com/services/`
  - `https://www.kubomontessori.com/san-mateo-location-directions/`
  - `https://www.kubomontessori.com/rw-location-directions/`
  - `https://www.kubomontessori.com/blog/?p={slug}` (for each fetched blog post)

---

## 3. Robots Contract (`/robots.txt`)

### Directives:
```text
User-agent: *
Allow: /

Sitemap: https://www.kubomontessori.com/sitemap-index.xml
Sitemap: https://www.kubomontessori.com/ai-sitemap.xml
```
- `sitemap-http.xml` MUST NOT be declared.
