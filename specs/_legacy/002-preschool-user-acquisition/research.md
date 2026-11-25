# Research Notes: Local SEO and AI Search Optimization

## 1. Astro 301 Redirects Configuration
* **Decision**: We will configure Astro's built-in redirects config in `astro.config.mjs`.
* **Configuration**:
  ```javascript
  redirects: {
    '/rw': {
      status: 301,
      destination: '/redwood-city-preschool-center'
    },
    '/rw/': {
      status: 301,
      destination: '/redwood-city-preschool-center'
    },
    '/homedaycare': {
      status: 301,
      destination: '/san-mateo-preschool-daycare'
    },
    '/homedaycare/': {
      status: 301,
      destination: '/san-mateo-preschool-daycare'
    }
  }
  ```
* **Rationale**: Defining redirects directly in Astro configuration ensures that Astro's build engine automatically generates redirect files (for static targets) or sets HTTP response headers (for SSR targets), preserving SEO search equity.
* **Alternatives Considered**: Creating physical `.astro` pages with redirect logic. Rejected because it is less clean and harder to manage.

---

## 2. Playwright Redirect Testing
* **Decision**: Write automated Playwright routing tests to assert the 301 HTTP status and `location` header.
* **Test Implementation**:
  ```typescript
  import { test, expect } from '@playwright/test';

  test.describe('SEO URL Redirects', () => {
    test('should redirect /rw to /redwood-city-preschool-center with 301', async ({ request }) => {
      const response = await request.get('/rw', { maxRedirects: 0 });
      expect(response.status()).toBe(301);
      expect(response.headers()['location']).toBe('/redwood-city-preschool-center');
    });

    test('should redirect /homedaycare to /san-mateo-preschool-daycare with 301', async ({ request }) => {
      const response = await request.get('/homedaycare', { maxRedirects: 0 });
      expect(response.status()).toBe(301);
      expect(response.headers()['location']).toBe('/san-mateo-preschool-daycare');
    });
  });
  ```
* **Rationale**: Using Playwright `request.get` with `maxRedirects: 0` lets us directly inspect the HTTP headers and status code returned by the server before any client-side navigation occurs.

---

## 3. Mobile Lighthouse Optimization
* **Decision**: Implement third-party script deferral and modern image optimization.
* **Techniques**:
  * **Deferring Third-Party Scripts**: Defer Google Tag Manager, analytics, and widget scripts to run during browser `requestIdleCallback` or after the first user interaction.
  * **YouTube Facade**: Instead of loading the heavy YouTube player iframe eagerly, we render a static preview image with a play button facade. The actual iframe is only injected when the user clicks the play button.
  * **Image Layout Shifts (CLS)**: Ensure all images on the new landing pages have explicit `width` and `height` attributes and use Astro's `<Image />` component for automatic WebP conversion and responsive resizing.
* **Rationale**: YouTube players and tag managers eagerly loading on mobile devices block the main thread and degrade the Lighthouse Mobile Performance Score down to ~75. Implementing facades and deferral brings the performance score above the 95% threshold.
