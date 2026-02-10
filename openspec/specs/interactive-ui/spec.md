# Spec: Interactive UI

## Goal
Implement client-side interactivity for key UI elements without relying on jQuery or heavy frameworks, using Astro Islands or vanilla JS.

## Requirements

### 1. Mobile Navigation
- Must toggle visibility of the navigation menu when the "hamburger" icon is clicked.
- Must close the menu when a link is clicked or when clicking outside the menu.
- Must be accessible (keyboard navigation, ARIA attributes).
- State: `isOpen` (boolean).

### 2. Testimonial Carousel
- Must allow users to cycle through testimonials.
- Must support:
  - Previous/Next buttons.
  - Touch swipe gestures on mobile.
  - Auto-play (optional, but if implemented, must pause on hover).
- Must have smooth transitions between slides.
- State: `currentIndex` (number).

### 3. Active Link State
- Must highlight the navigation link corresponding to the current page.
- Implementation: Check `window.location.pathname` or Astro's `Astro.url.pathname` during build/render.

### 4. Third-Party Widgets (Calendly)
- Must integrate Calendly badge widget.
- Must load the widget script without blocking main thread rendering, or use `is:inline` if required for compatibility.
- Requirement: "Schedule a Tour" button/badge must be visible and functional on all pages.

## Data Model
**Menu State**:
- `isOpen`: boolean

**Carousel State**:
- `currentIndex`: integer (0 to n-1)

## API
N/A
