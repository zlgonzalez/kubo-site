# Design: Improve SEO Foundation

## Context
The current site uses hardcoded meta tags in `Layout.astro` with limited configurability. We need a flexible system to manage SEO on a per-page basis and inject structured data.

## Goals
- **Flexible Metadata**: Allow every page to define its own title, description, and social image.
- **Automated Defaults**: Fallback to default values if page-specific data is missing.
- **Structured Data**: Automatically inject `LocalBusiness` schema on all pages (or at least the home page).
- **Clean Code**: Extract SEO logic into a dedicated component to keep `Layout.astro` clean.

## Decisions

### 1. Dedicated `SEO.astro` Component
We will create `src/components/SEO.astro` to handle all meta tag rendering.
- **Props**: `title`, `description`, `image`, `article` (boolean or type).
- **Logic**: Handles constructing full URLs from paths, setting canonical URL based on `Astro.url`.

### 2. Schema Injection
We will inject a `<script type="application/ld+json">` tag in `Layout.astro` (or the new `SEO` component).
- Content will be a simplified `ChildCare` schema object.
- Hardcoded business details (address, hours) to ensure consistency.

### 3. Image Handling
- Use a default social image (`/images/social-share.jpg` - need to verify if exists or pick one) if none provided.
- Pages can override this.

## Risks
- **Broken Links**: ensuring `Astro.site` is configured correctly so `Astro.url` functions as expected for canonicals.
- **Duplicate Tags**: Need to ensure we remove the old hardcoded tags from `Layout.astro` when switching to the component.
