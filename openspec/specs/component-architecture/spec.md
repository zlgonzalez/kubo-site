# Spec: Component Architecture

## Goal
Establish a modular, component-based frontend architecture using Astro to replace the existing HTML/Bootstrap structure.

## Requirements

### 1. Component Structure
The UI must be broken down into the following reusable components:
- `Layout.astro`:
  - Must wrap all pages.
  - Must include `<head>` with global meta tags and styles.
  - Must include `NavBar` and `Footer`.
- `NavBar.astro`:
  - Must display the logo and navigation links.
  - Must highlight the active link based on the current URL.
  - Must be responsive (collapsible on mobile).
- `Footer.astro`:
  - Must display contact information and location addresses.
  - Must match existing design.
- `ProgramCard.astro`:
  - Must accept props for Title, Description, Image, and Link.
  - Must be used on the "Our Programs" page/section.
- `TestimonialCarousel.astro`:
  - Must display a rotating list of testimonials.
  - Must support touch/swipe on mobile.

### 2. Styling
- Must use Tailwind CSS for styling.
- Must replicate the existing visual design (colors, fonts, spacing).
- Global styles (fonts, resets) must be defined in a global CSS file or `Layout.astro`.

### 3. Build & Performance
- Must build to static HTML/CSS/JS.
- Must achieve a Lighthouse Performance score of >90.
- Must use `optimised` images (WebP) via Astro's `<Image />` component.

## Data Model
**Testimonials** (Array of Objects):
- `author`: string
- `role`: string (e.g., "Parent")
- `text`: string
- `image`: string (path)

**Programs** (Array of Objects):
- `title`: string
- `description`: string
- `image`: string
- `link`: string

## API
N/A (Static Site)
