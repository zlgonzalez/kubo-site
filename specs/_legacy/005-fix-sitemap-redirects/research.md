# Phase 0 Research: Sitemap Canonicalization and Redirect Elimination

## Research Topics & Decisions

### 1. Trailing Slash Formatting for Blog Query URLs

- **Decision**: Update blog post URLs in both `astro.config.mjs` (`sitemap` integration) and `src/pages/ai-sitemap.xml.ts` to `https://www.kubomontessori.com/blog/?p=${post.slug}` (with a trailing slash before the query parameter `?`).
- **Rationale**: 
  - Astro renders `src/pages/blog.astro` into `dist/blog/index.html`.
  - On standard web servers (Cloudflare, Vercel, Netlify, Nginx, Apache), any request targeting a directory path without a trailing slash (e.g., `/blog?p=...`) triggers a server-level 301/308 redirect to `/blog/?p=...` so the web server can serve `index.html`.
  - Providing `/blog/?p=${post.slug}` in the sitemap allows search engine bots and AI crawlers to request the canonical URL directly and receive an HTTP 200 OK response on first contact.
- **Alternatives Considered**:
  - *Migrating DropInBlog to fully static dynamic routes (`/blog/[slug].astro`)*: Evaluated, but would require redesigning the blog architecture and DropInBlog integration. Maintaining the query parameter pattern with normalized trailing slash (`/blog/?p=...`) cleanly resolves all crawler redirects with zero architectural disruption.

---

### 2. Normalizing Static Page URLs in `ai-sitemap.xml`

- **Decision**: Ensure all pages listed in `src/pages/ai-sitemap.xml.ts` include trailing slashes:
  - Homepage: `${baseUrl}/`
  - Campuses & Services: `/san-mateo-preschool-daycare/`, `/redwood-city-preschool-center/`, `/foster-city-preschool-daycare/`, `/belmont-ca-montessori-daycare/`, `/san-carlos-montessori-preschool/`, `/burlingame-montessori-preschool/`, `/menlo-park-montessori-preschool/`, `/about/`, `/services/`, `/san-mateo-location-directions/`, `/rw-location-directions/`
  - Educational Resources: `/resources/montessori-vs-traditional-preschool/`, `/resources/potty-training-preschool-guide/`, `/resources/home-vs-center-childcare/`, `/resources/parent-handbook/`
- **Rationale**: 
  - The SEMrush audit specifically flagged all of these URLs under `ai-sitemap.xml` because they lacked the trailing slash and returned redirects.
  - Normalizing these strings directly in `src/pages/ai-sitemap.xml.ts` makes `ai-sitemap.xml` 100% consistent with `sitemap-0.xml` and the site's canonical URL policy.
- **Alternatives Considered**:
  - *Dynamic sitemap crawling*: Overly complex; maintaining the clean list with trailing slashes is deterministic, fast, and simple.

---

### 3. Filtering Out `blog.html` Redirect Stub from Sitemaps

- **Decision**: Add a filter function to the `@astrojs/sitemap` integration in `astro.config.mjs`:
  ```javascript
  sitemap({
    customPages: blogPostUrls,
    filter: (page) => !page.endsWith('/blog.html/') && !page.endsWith('/blog.html')
  })
  ```
- **Rationale**: 
  - `blog.html.astro` is a legacy backward-compatibility stub that issues a client-side JavaScript redirect.
  - Sitemaps must exclusively contain canonical, indexable content. Crawlers discovering redirect stubs flag them as sitemap errors.
- **Alternatives Considered**:
  - *Deleting `blog.html.astro`*: Would break existing external bookmarks or backlinks pointing directly to `blog.html`. Filtering it from sitemap generation preserves backlink compatibility while satisfying sitemap audit compliance.

---

### 4. Deprecating and Removing `sitemap-http.xml`

- **Decision**: 
  - Remove `sitemapHttp()` integration call from `astro.config.mjs`.
  - Remove `sitemap-http.ts` integration file from `src/integrations/`.
  - Remove `'https://www.kubomontessori.com/sitemap-http.xml'` from the `sitemap` list in `robotsTxt()` in `astro.config.mjs`.
  - Clean up any stale `dist/sitemap-http.xml`.
- **Rationale**: 
  - Verified and confirmed in the clarification session (Option A).
  - Modern search engines only accept secure canonical endpoints. Advertising an HTTP sitemap in `robots.txt` encourages crawlers to crawl insecure URLs that trigger HTTP 301 redirects to HTTPS.
- **Alternatives Considered**:
  - *Keeping the file unadvertised*: Retains dead code and potential confusion. Complete removal provides a cleaner build.

---

### 5. Direct Single-Hop Dynamic Redirects

- **Decision**: Update `astro.config.mjs` dynamic blog redirects:
  ```javascript
  postsList.forEach(post => {
    redirects[`/blog/${post.slug}`] = {
      status: 301,
      destination: `/blog/?p=${post.slug}`
    };
  });
  ```
- **Rationale**: 
  - Previously redirected to `/blog?p=${post.slug}`, which in turn triggered a second redirect to `/blog/?p=${post.slug}`.
  - Directly targeting the trailing slash route resolves requests in exactly 1 hop.
- **Alternatives Considered**: None; single-hop redirection is industry standard.
