import { test, expect } from '@playwright/test';

test.describe('Kubo Montessori Smoke Tests', () => {
  test('homepage loads and shows core elements', async ({ page }) => {
    // Go to homepage
    await page.goto('/');

    // Check title
    await expect(page).toHaveTitle(/Preschool/);

    // Verify main navigation bar is visible
    const nav = page.locator('nav');
    await expect(nav).toBeVisible();

    // Verify "Our Programs" exists in navigation
    const programsLink = page.locator('nav').getByText('Our Programs');
    await expect(programsLink).toBeVisible();

    // Verify logo is visible
    const logo = page.locator('nav img[alt="Kubo Logo"]');
    await expect(logo).toBeVisible();
  });

  test('navbar mobile menu toggles visibility', async ({ page }) => {
    // Resize viewport to mobile dimensions
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    // Verify mobile menu toggle button is visible, but nav items are hidden
    const toggleButton = page.locator('#mobile-menu-toggle');
    await expect(toggleButton).toBeVisible();
    
    const navContent = page.locator('#nav-content');
    await expect(navContent).toHaveClass(/hidden/);

    // Click toggle button
    await toggleButton.click();

    // Verify menu items are now shown
    await expect(navContent).not.toHaveClass(/hidden/);
  });

  test.describe('SEO URL Redirects', () => {
    test('should redirect /rw to /redwood-city-preschool-center with 301', async ({ request }) => {
      const response = await request.get('/rw', { maxRedirects: 0 });
      expect(response.status()).toBe(301);
      expect(response.headers()['location']).toBe('/redwood-city-preschool-center');
    });

    test('should redirect /rw/ to /redwood-city-preschool-center with 301', async ({ request }) => {
      const response = await request.get('/rw/', { maxRedirects: 0 });
      expect(response.status()).toBe(301);
      expect(response.headers()['location']).toBe('/redwood-city-preschool-center');
    });

    test('should redirect /homedaycare to /san-mateo-preschool-daycare with 301', async ({ request }) => {
      const response = await request.get('/homedaycare', { maxRedirects: 0 });
      expect(response.status()).toBe(301);
      expect(response.headers()['location']).toBe('/san-mateo-preschool-daycare');
    });

    test('should redirect /homedaycare/ to /san-mateo-preschool-daycare with 301', async ({ request }) => {
      const response = await request.get('/homedaycare/', { maxRedirects: 0 });
      expect(response.status()).toBe(301);
      expect(response.headers()['location']).toBe('/san-mateo-preschool-daycare');
    });
  });

  test.describe('New SEO Location Pages', () => {
    test('should load /san-mateo-preschool-daycare successfully', async ({ page }) => {
      await page.goto('/san-mateo-preschool-daycare');
      await expect(page).toHaveTitle(/San Mateo/);
      const h1 = page.locator('h1');
      await expect(h1).toContainText(/San Mateo/);
    });

    test('should load /redwood-city-preschool-center successfully', async ({ page }) => {
      await page.goto('/redwood-city-preschool-center');
      await expect(page).toHaveTitle(/Redwood City/);
      const h1 = page.locator('h1');
      await expect(h1).toContainText(/Redwood City/);
    });

    test('should load /san-mateo-location-directions successfully', async ({ page }) => {
      await page.goto('/san-mateo-location-directions');
      await expect(page).toHaveTitle(/Directions/);
      const h1 = page.locator('h1');
      await expect(h1).toContainText(/Directions/);
    });
  });

  test.describe('Blog Crawlability and Indexing', () => {
    test('blog posts should be present in DOM when JavaScript is disabled', async ({ browser }) => {
      const context = await browser.newContext({ javaScriptEnabled: false });
      const page = await context.newPage();
      await page.goto('/blog');
      
      const container = page.locator('#dib-posts');
      await expect(container).toBeVisible();
      
      const postLinks = page.locator('#dib-posts a, .blog-post-link');
      await expect(postLinks.first()).toBeVisible();
      
      await context.close();
    });

    test('sitemap should contain blog post URLs', async ({ request }) => {
      const response = await request.get('/sitemap-0.xml');
      expect(response.status()).toBe(200);
      const text = await response.text();
      expect(text).toContain('/blog/');
    });
  });
  test.describe('Parent Handbook Navigation', () => {
    test('should show "Parent Handbook" link in desktop navbar', async ({ page }) => {
      await page.goto('/');
      const link = page.locator('nav a[href="/parent-handbook"]');
      await expect(link).toBeVisible();
      await expect(link).toHaveText('Parent Handbook');
    });

    test('Parent Handbook nav link should point to the correct href', async ({ page }) => {
      await page.goto('/');
      const link = page.locator('nav a[href="/parent-handbook"]');
      await expect(link).toHaveAttribute('href', '/parent-handbook');
    });

    test('should load /parent-handbook successfully with correct title and heading', async ({ page }) => {
      await page.goto('/parent-handbook');
      await expect(page).toHaveTitle(/Parent Handbook/);
      // The page has a second hidden print-only h1, so filter to the visible one
      const h1 = page.locator('h1').filter({ hasText: /Parent Handbook/ }).first();
      await expect(h1).toBeVisible();
      await expect(h1).toContainText('Parent Handbook');
    });

    test('should show "Parent Handbook" link in mobile navbar after menu opens', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/');

      // Menu is hidden on mobile — open it first
      await page.locator('#mobile-menu-toggle').click();

      const link = page.locator('#nav-content a[href="/parent-handbook"]');
      await expect(link).toBeVisible();
      await expect(link).toHaveText('Parent Handbook');
    });
  });

  test.describe('Calendly Analytics Event Tracking', () => {
    test('should capture calendly.event_scheduled postMessage and push tour_booking_scheduled to dataLayer', async ({ page }) => {
      await page.goto('/');

      // Simulate Calendly widget dispatching event_scheduled message with valid origin
      await page.evaluate(() => {
        window.dispatchEvent(
          new MessageEvent('message', {
            data: { event: 'calendly.event_scheduled', payload: {} },
            origin: 'https://calendly.com',
          })
        );
      });

      // Verify dataLayer captures conversion event
      const dataLayerEvent = await page.evaluate(() => {
        return (window.dataLayer || []).find((item) => item.event === 'tour_booking_scheduled');
      });

      expect(dataLayerEvent).toBeDefined();
      expect(dataLayerEvent).toMatchObject({
        event: 'tour_booking_scheduled',
        event_category: 'engagement',
        event_label: 'Calendly Widget',
        value: 1,
      });
    });
  });
});

