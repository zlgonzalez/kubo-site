# Design: Modernize to Interactive Web App

## Context
The current Kubo Montessori website is a static site built with Bootstrap 4 and jQuery. It suffers from code duplication, reliance on global state for interactivity, and unoptimized assets. The goal is to modernize it using Astro and Tailwind CSS.

## Goals / Non-Goals

**Goals:**
- **Componentize UI**: Replace repeated HTML with reusable Astro components.
- **Remove jQuery**: Implement interactivity using standard browser APIs or lightweight framework islands (React/Preact if needed, but likely vanilla JS is sufficient for this scope).
- **Optimize Performance**: Achieve green Lighthouse scores (90+) for Performance, Accessibility, Best Practices, and SEO.
- **Maintain SEO**: Ensure all content is rendered statically at build time.
- **Preserve Design**: Maintain the current visual identity while cleaning up the implementation.
- **Create Makefile**: Create a Makefile to automate the build process.

**Non-Goals:**
- **Backend**: We are not building a backend API or database.
- **CMS**: We are not integrating a Content Management System at this stage (content will remain in code/markdown).

## Decisions

### 1. Framework: Astro
**Rationale**: Astro is optimized for content-focused websites. It defaults to zero-JS (shipping only HTML/CSS), which fits our use case perfectly. We can use "Islands" for the few interactive bits (Carousel, Mobile Menu).
**Impact**: Faster load times, better SEO, easier developer experience than raw HTML.

### 2. Styling: Tailwind CSS
**Rationale**: Replaces global `style.css` and Bootstrap classes with utility-first CSS. This scopes styles to components and reduces unused CSS in the final build.
**Impact**: Smaller CSS bundle, no style leakage between components.

### 3. Interactivity: Vanilla JS / Astro Islands
**Rationale**: The site's interactivity is low complexity (menu toggle, carousel). We don't need a heavy framework like React loaded globally.
**Implementation**:
- **Mobile Menu**: Simple vanilla JS script tag inside `NavBar.astro`.
- **Carousel**: Use a lightweight library like `Swiper` initialized in a `<script>` tag within `TestimonialCarousel.astro`, or a CSS-scroll-snap implementation for max performance.
- **Calendly**: Verify widget integration works with Astro's script processing (may need `is:inline` directive).

## Risks / Trade-offs

### SEO Migration
**Risk**: Changing URL structures or HTML semantics could hurt search rankings.
**Mitigation**:
- Keep file names same as current (`index.html`, `about.html` -> `pages/index.astro`, `pages/about.astro`) to preserve URLs.
- Ensure `<meta>` tags for title, description, and keywords are faithfully ported.

### Calendly Integration
**Risk**: Third-party widgets sometimes conflict with framework hydrations.
**Mitigation**: Use Astro's `is:inline` for the Calendly script to prevent Astro from processing/deferring it incorrectly.

### Asset Paths
**Risk**: Images referenced in CSS or HTML might break during move.
**Mitigation**: Audit all image paths. Move images to `public/` so they are served at root, preserving `/images/filename.jpg` paths if possible, or update references to `src/assets/` for optimization.
