# Quickstart: Testing & Verifying Sitemap Canonicalization

## Overview

This guide explains how to build the site, inspect generated sitemaps, and verify that 0 redirecting or non-canonical URLs exist.

---

## 1. Build the Site

Run the Astro production build:
```bash
npm run build
```

This compiles the static site into `dist/`, including:
- `dist/sitemap-index.xml`
- `dist/sitemap-0.xml`
- `dist/ai-sitemap.xml`
- `dist/robots.txt`

---

## 2. Verify Generated Sitemap Files

### Check for 0 Trailing Slash Discrepancies in `ai-sitemap.xml`:
Inspect `dist/ai-sitemap.xml`:
```bash
grep "<loc>" dist/ai-sitemap.xml
```
Verify that:
- Every path has a trailing slash before query parameters (e.g. `.../blog/?p=...`, `.../services/`, `.../about/`).
- The homepage is `https://www.kubomontessori.com/`.

### Check for Excluded Redirect Stubs in `sitemap-0.xml`:
Ensure `blog.html` is not in `dist/sitemap-0.xml`:
```bash
grep "blog.html" dist/sitemap-0.xml
# Expected: no matches (exit code 1)
```

### Check `robots.txt`:
Verify that `sitemap-http.xml` is NOT present in `dist/robots.txt`:
```bash
grep "sitemap-http.xml" dist/robots.txt
# Expected: no matches (exit code 1)
```

---

## 3. Run Automated Tests

Execute unit tests to validate sitemap generation and routing rules:
```bash
npm run test:unit
```
