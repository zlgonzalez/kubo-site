# Quickstart: Verifying Audit Remediation

## Prerequisites

- Node.js 18+ installed.
- Dependencies installed (`npm install`).

## Step-by-Step Verification

### 1. Build Static Output

```bash
npm run build
```

Verify that `dist/sitemap-0.xml` and `dist/ai-sitemap.xml` are generated.

### 2. Verify Sitemap Canonical Entries

```bash
# Check that blog query URLs are not in sitemaps
grep -q "/blog/?p=" dist/sitemap-0.xml && echo "FAIL: Query URLs in sitemap-0.xml" || echo "PASS: sitemap-0.xml is clean"
grep -q "/blog/?p=" dist/ai-sitemap.xml && echo "FAIL: Query URLs in ai-sitemap.xml" || echo "PASS: ai-sitemap.xml is clean"

# Check that canonical /blog/ is in both sitemaps
grep -q "<loc>https://www.kubomontessori.com/blog/</loc>" dist/sitemap-0.xml && echo "PASS: /blog/ present in sitemap-0.xml"
grep -q "<loc>https://www.kubomontessori.com/blog/</loc>" dist/ai-sitemap.xml && echo "PASS: /blog/ present in ai-sitemap.xml"
```

### 3. Verify Image Sizes

```bash
# Check teacher portraits loaded by Redwood City page are under 1 MB (1,000,000 bytes)
ls -l public/images/aileen-amar.jpeg public/images/joy-pacaigue.jpg
```

### 4. Run Automated Test Suite

```bash
# Unit tests
npm run test:unit

# E2E smoke tests
npm run test:e2e

# Full suite (Unit + Lighthouse + E2E)
npm test
```
