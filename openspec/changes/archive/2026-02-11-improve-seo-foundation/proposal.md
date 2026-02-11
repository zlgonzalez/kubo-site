# Improve SEO Foundation

## Problem

The Kubo Montessori website currently lacks critical SEO configurability and structured data.
- **Social Sharing**: Links shared on Facebook, Twitter, etc., do not generate rich previews due to missing Open Graph and Twitter Card tags.
- **Search Ranking**: Missing canonical tags and duplicate meta descriptions across pages can negatively impact search rankings.
- **Local SEO**: There is no structured data (JSON-LD) to clearly identify the business as a Child Care center to search engines, missing out on rich results in Google Maps and search.

## Solution

Implement a comprehensive SEO foundation using Astro's capabilities.
1.  **Enhanced Layout**: Update `Layout.astro` to accept dynamic SEO props (image, type, canonical URL) and render all necessary meta tags.
2.  **Structured Data**: Inject `application/ld+json` script tags for `LocalBusiness` / `ChildCare` schema, dynamically populated with business details.
3.  **Page Level Updates**: Update all top-level pages to provide unique titles, descriptions, and Open Graph images.

## Capabilities

### New Capabilities
- `seo-system`: A system for managing per-page SEO metadata and social sharing tags.
- `structured-data`: Implementation of Schema.org JSON-LD for LocalBusiness and ChildCare.

### Modified Capabilities
<!-- None -->

## Impact

- `src/layouts/Layout.astro`: Will be modified to accept new props and render tags.
- `src/pages/*.astro`: All pages will be updated to use the new Layout props.
