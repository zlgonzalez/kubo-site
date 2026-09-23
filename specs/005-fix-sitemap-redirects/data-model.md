# Phase 1 Data Model: Sitemap & Routing Entities

## Overview

This feature standardizes machine-readable discovery models (XML Sitemaps, robots.txt directives, and redirect mapping structures) to guarantee canonical compliance and eliminate crawl redirects.

---

## Entities

### 1. SitemapItem

Represents an individual indexable URL entry within an XML sitemap document (`sitemap-0.xml` or `ai-sitemap.xml`).

| Field | Type | Required | Description & Constraints |
|-------|------|----------|---------------------------|
| `loc` | `string` | Yes | Absolute URL. Must begin with `https://www.kubomontessori.com`. Path component must strictly end with `/` before any query parameters (e.g. `https://www.kubomontessori.com/blog/?p={slug}`). Must NOT target redirect stubs (e.g. `blog.html`). |
| `changefreq` | `string` | No | Crawl frequency hint (`weekly`, `monthly`). |
| `priority` | `string` | No | Relative priority between `0.0` and `1.0` (`1.0` for root `/`, `0.8` for interior pages). |

#### Validation Rules:
- **HTTPS Only**: Must use `https://` protocol.
- **Canonical Trailing Slash**: Path must terminate in `/` (e.g., `/services/`, `/about/`) or preceding query strings (`/blog/?p=...`).
- **No Redirect Endpoints**: Must resolve directly to a 200 OK static page or server route without HTTP 301/308 redirects.
- **Exclusion of Stubs**: Must not contain `.html` aliases or client-side redirect shims.

---

### 2. RobotsConfiguration

Represents the search engine policy declared in `robots.txt`.

| Field | Type | Description |
|-------|------|-------------|
| `sitemaps` | `string[]` | Array of authoritative XML sitemap URLs advertised to crawlers. |
| `policy` | `object[]` | Crawler permission rules (e.g., User-agent: `*`, Allow: `/`). |

#### Validation Rules:
- All URLs in `sitemaps` must be active, secure (`https://`), and return HTTP 200 OK.
- Obsolete or insecure sitemaps (e.g., `sitemap-http.xml`) are strictly excluded.

---

### 3. RedirectRule

Represents a server-level HTTP redirect definition mapping legacy URLs to current canonical endpoints.

| Field | Type | Description |
|-------|------|-------------|
| `source` | `string` | Legacy or incoming relative path (e.g. `/blog/{slug}`, `/rw`, `/homedaycare`). |
| `status` | `number` | Permanent redirect status: `301`. |
| `destination` | `string` | Final canonical path (e.g. `/blog/?p={slug}`, `/redwood-city-preschool-center`). Must not point to an intermediary redirect. |

#### State Transitions / Lifecycle:
- `Incoming Request` → Matches `source` → Emits HTTP 301 with `Location: destination` (1 hop directly to canonical endpoint).
