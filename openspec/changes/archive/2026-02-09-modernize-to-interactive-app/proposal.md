# Proposal: Modernize to Interactive Web App

## Goal
Transform the existing static website into a modern, interactive web application to improve maintainability, performance, and user experience. The goal is to move from a multi-page static site with global jQuery/CSS to a component-based architecture using a modern framework (Astro or Next.js), enabling state management and optimized performance.

## Context
The current website is built with HTML5, Bootstrap 4, and jQuery.
- **Issues**:
    - Code duplication (header, footer, nav repeated across files).
    - Global state reliance (jQuery for interactions).
    - Performance bottlenecks (unoptimized assets, blocking scripts).
    - Hard to maintain and scale.

## Proposal
Refactor the codebase into a modern web application structure.

### 1. Componentization
Break down the UI into reusable components:
- `NavBar`: Responsive navigation with active state awareness.
- `Footer`: Shared footer with contact details.
- `Layout`: Common wrapper for pages.
- `ProgramCard`: Reusable display for program details.
- `TestimonialCarousel`: Interactive component replacing the jQuery plugin.

## Capabilities

### New Capabilities
- `component-architecture`: Migration to Astro components and Tailwind CSS.
- `interactive-ui`: Client-side state management for menu and carousel.

### 2. State Management
Implement client-side state management for:
- Mobile menu toggling.
- Carousel navigation.
- Active link highlighting.
- Future-proofing for potential features like parent portals or dynamic scheduling.

### 3. Modern Tooling
- **Framework**: Use **Astro**.
- **Styling**: Tailwind CSS to scope styles.
- **Bundling**: Astro handles this.

## Risks
- **SEO**: Must ensure the new app renders static HTML (SSR or SSG) to maintain or improve SEO.
- **Migration Effort**: Manually porting content from HTML files to components.

## Alternatives
- **Refactor in place**: Keep HTML/jQuery but use templates. (Rejected: Doesn't solve global scope issues or modernization).
- **React SPA**: Full Single Page App. (Rejected: Overkill and potential SEO complexity without SSR).

## Plan
1.  Initialize new project structure.
2.  Create core components (`Layout`, `NavBar`, `Footer`).
3.  Migrate `index.html` content to the new structure.
4.  Re-implement interactivity (Carousel) using framework-native solutions.
5.  Verify SEO tags and performance scores.
6.  Verify calendly widget works
