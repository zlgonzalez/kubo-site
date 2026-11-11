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
      expect(response.headers()['location']).toBe('/redwood-city-preschool-center/');
    });

    test('should redirect /rw/ to /redwood-city-preschool-center with 301', async ({ request }) => {
      const response = await request.get('/rw/', { maxRedirects: 0 });
      expect(response.status()).toBe(301);
      expect(response.headers()['location']).toBe('/redwood-city-preschool-center/');
    });

    test('should redirect /homedaycare to /san-mateo-preschool-daycare with 301', async ({ request }) => {
      const response = await request.get('/homedaycare', { maxRedirects: 0 });
      expect(response.status()).toBe(301);
      expect(response.headers()['location']).toBe('/san-mateo-preschool-daycare/');
    });

    test('should redirect /homedaycare/ to /san-mateo-preschool-daycare with 301', async ({ request }) => {
      const response = await request.get('/homedaycare/', { maxRedirects: 0 });
      expect(response.status()).toBe(301);
      expect(response.headers()['location']).toBe('/san-mateo-preschool-daycare/');
    });

    test('should redirect /rw.html to /redwood-city-preschool-center with 301', async ({ request }) => {
      const response = await request.get('/rw.html', { maxRedirects: 0 });
      expect(response.status()).toBe(301);
      expect(response.headers()['location']).toBe('/redwood-city-preschool-center/');
    });

    test('should redirect /about.html to /about with 301', async ({ request }) => {
      const response = await request.get('/about.html', { maxRedirects: 0 });
      expect(response.status()).toBe(301);
      expect(response.headers()['location']).toBe('/about/');
    });

    test('should redirect /homedaycare.html to /san-mateo-preschool-daycare with 301', async ({ request }) => {
      const response = await request.get('/homedaycare.html', { maxRedirects: 0 });
      expect(response.status()).toBe(301);
      expect(response.headers()['location']).toBe('/san-mateo-preschool-daycare/');
    });

    test('should redirect /roots-n-wings-montessori-school to /redwood-city-preschool-center with 301', async ({ request }) => {
      const response = await request.get('/roots-n-wings-montessori-school', { maxRedirects: 0 });
      expect(response.status()).toBe(301);
      expect(response.headers()['location']).toBe('/redwood-city-preschool-center/');
    });

    test('should redirect /parent-handbook to /resources/parent-handbook', async ({ page }) => {
      await page.goto('/parent-handbook');
      await page.waitForURL('**/resources/parent-handbook**');
      expect(page.url()).toContain('/resources/parent-handbook');
    });

    test('should redirect /parent-handbook.html to /resources/parent-handbook', async ({ page }) => {
      await page.goto('/parent-handbook.html');
      await page.waitForURL('**/resources/parent-handbook**');
      expect(page.url()).toContain('/resources/parent-handbook');
    });

    test('should redirect /blog/:slug to /blog?p=:slug with 301', async ({ request }) => {
      const res = await request.get('https://api.dropinblog.com/v1/json/?b=0530ca52-f373-4292-800a-b93c30543ee4');
      expect(res.status()).toBe(200);
      const json = await res.json();
      const posts = json.data?.posts || [];
      expect(posts.length).toBeGreaterThan(0);
      const slug = posts[0].slug;

      const response = await request.get(`/blog/${slug}`, { maxRedirects: 0 });
      expect(response.status()).toBe(301);
      expect(response.headers()['location']).toBe(`/blog/?p=${slug}`);
    });

    test('should redirect /blog.html?p=slug client-side to /blog?p=slug', async ({ page }) => {
      await page.goto('/blog.html?p=some-post-slug');
      // Verify client-side redirect preserves query parameter
      expect(page.url()).toContain('/blog/?p=some-post-slug');
    });
  });

  test.describe('New SEO Location Pages', () => {
    test('should load /san-mateo-preschool-daycare successfully', async ({ page }) => {
      await page.goto('/san-mateo-preschool-daycare');
      await expect(page).toHaveTitle(/San Mateo/);
      const h1 = page.locator('h1').first();
      await expect(h1).toContainText(/San Mateo/);
    });

    test('should load /redwood-city-preschool-center successfully', async ({ page }) => {
      await page.goto('/redwood-city-preschool-center');
      await expect(page).toHaveTitle(/Redwood City/);
      const h1 = page.locator('h1').first();
      await expect(h1).toContainText(/Redwood City/);
    });

    test('should load /san-mateo-location-directions successfully', async ({ page }) => {
      await page.goto('/san-mateo-location-directions');
      await expect(page).toHaveTitle(/Directions/);
      const h1 = page.locator('h1').first();
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

    test('sitemap should contain canonical blog URL and omit query parameters', async ({ request }) => {
      const response = await request.get('/sitemap-0.xml');
      expect(response.status()).toBe(200);
      const text = await response.text();
      expect(text).toContain('/blog/');
      expect(text).not.toContain('/blog/?p=');
    });

    test('clicking a blog post should navigate to details page successfully', async ({ page }) => {
      await page.goto('/blog');
      
      const firstPostLink = page.locator('a.blog-post-link, a.dib-post, #dib-posts h2 a').first();
      await expect(firstPostLink).toBeVisible();
      
      const href = await firstPostLink.getAttribute('href');
      expect(href).not.toBeNull();
      const localHref = href!.replace('https://www.kubomontessori.com', '').replace('https://kubomontessori.com', '');
      expect(localHref).toMatch(/\/blog\/?\?p=/);
      
      await page.goto(localHref);
      
      expect(page.url()).toContain(localHref.split('p=')[1]);
      
      const h1 = page.locator('h1').first();
      await expect(h1).toBeVisible();
      await expect(h1).not.toContainText('404');
      
      const container = page.locator('#dib-posts');
      await expect(container).toBeVisible();
      
      const singlePost = page.locator('#dib-posts .dib-post-single');
      await expect(singlePost).toBeVisible({ timeout: 10000 });
    });
  });

  test.describe('Parent Handbook Navigation & Relocation', () => {
    test('should show "Parent Handbook" link in Resources dropdown', async ({ page }) => {
      await page.goto('/');
      const link = page.locator('nav a[href="/resources/parent-handbook/"]');
      await expect(link).toBeAttached();
      await expect(link).toHaveText('Parent Handbook');
    });

    test('Parent Handbook nav link should point to /resources/parent-handbook', async ({ page }) => {
      await page.goto('/');
      const link = page.locator('nav a[href="/resources/parent-handbook/"]');
      await expect(link).toHaveAttribute('href', '/resources/parent-handbook/');
    });

    test('should load /resources/parent-handbook successfully with correct title and heading', async ({ page }) => {
      await page.goto('/resources/parent-handbook');
      await expect(page).toHaveTitle(/Parent Handbook/);
      const h1 = page.locator('h1').filter({ hasText: /Parent Handbook/ }).first();
      await expect(h1).toBeVisible();
      await expect(h1).toContainText('Parent Handbook');
    });
  });

  test.describe('Calendly Analytics Event Tracking', () => {
    test('should load gtag.js async in head with low fetchpriority and capture pre-idle conversions', async ({ page }) => {
      await page.route('**/assets/external/widget.js', (route) =>
        route.fulfill({ status: 200, contentType: 'application/javascript', body: '' })
      );

      await page.goto('/', { waitUntil: 'domcontentloaded' });

      // Verify exact gtag.js script tag is in <head> with async and fetchpriority="low"
      const gtagScript = page.locator('head script[src="https://www.googletagmanager.com/gtag/js?id=G-BE43SM2H4T"]');
      await expect(gtagScript).toHaveAttribute('async', '');
      await expect(gtagScript).toHaveAttribute('fetchpriority', 'low');

      // Verify window.dataLayer and gtag are immediately initialized and capture pre-idle events
      const capturedImmediateEvent = await page.evaluate(() => {
        const hasGtag = typeof (window as any).gtag === 'function' && Array.isArray((window as any).dataLayer);
        window.dispatchEvent(
          new MessageEvent('message', {
            data: JSON.stringify({ event: 'calendly.event_scheduled', payload: {} }),
            origin: 'https://calendly.com',
          })
        );
        const dl = (window.dataLayer || []) as Array<Record<string, unknown> | ArrayLike<unknown>>;
        const dataLayerEntry = dl.find((item: any) => item && item.event === 'tour_booking_scheduled');
        return { hasGtag, dataLayerEntry };
      });
      expect(capturedImmediateEvent.hasGtag).toBe(true);
      expect(capturedImmediateEvent.dataLayerEntry).toMatchObject({
        event: 'tour_booking_scheduled',
        event_category: 'engagement',
        event_label: 'Calendly Widget',
        value: 1,
      });
    });

    test('SEO structured data should point all ReserveAction targets to on-site contact page and preserve city areaServed', async ({ page }) => {
      for (const route of ['/san-mateo-preschool-daycare/', '/belmont-ca-montessori-daycare/']) {
        await page.goto(route);

        const schemaScript = page.locator('head script[type="application/ld+json"]').first();
        const content = await schemaScript.textContent();
        expect(content).not.toBeNull();

        const schema = JSON.parse(content!);
        const items = Array.isArray(schema) ? schema : schema['@graph'] || [schema];
        const reserveActionItems = items.filter(
          (item: any) => item.potentialAction && item.potentialAction['@type'] === 'ReserveAction'
        );

        expect(reserveActionItems).toHaveLength(3);
        for (const item of reserveActionItems) {
          expect(item.potentialAction.target).toBe('https://www.kubomontessori.com/contact/');
        }

        if (route === '/belmont-ca-montessori-daycare/') {
          const orgItem = items.find((item: any) => item['@type'] === 'EducationalOrganization');
          expect(orgItem?.areaServed).toContain('Belmont');
        }
      }
    });

    test('should capture object and stringified calendly.event_scheduled postMessages to dataLayer', async ({ page }) => {
      await page.route('**/assets/external/widget.js', (route) =>
        route.fulfill({ status: 200, contentType: 'application/javascript', body: '' })
      );
      await page.goto('/');

      // Simulate both object and stringified Calendly postMessage payloads with valid origin
      await page.evaluate(() => {
        window.dispatchEvent(
          new MessageEvent('message', {
            data: { event: 'calendly.event_scheduled', payload: {} },
            origin: 'https://calendly.com',
          })
        );
        window.dispatchEvent(
          new MessageEvent('message', {
            data: JSON.stringify({ event: 'calendly.event_scheduled', payload: {} }),
            origin: 'https://calendly.com',
          })
        );
      });

      // Verify dataLayer captures both conversion events
      const matchingEvents = await page.evaluate(() => {
        return ((window.dataLayer || []) as Record<string, unknown>[]).filter(
          (item) => item && item.event === 'tour_booking_scheduled'
        );
      });

      expect(matchingEvents).toHaveLength(2);
      for (const dataLayerEvent of matchingEvents) {
        expect(dataLayerEvent).toMatchObject({
          event: 'tour_booking_scheduled',
          event_category: 'engagement',
          event_label: 'Calendly Widget',
          value: 1,
        });
      }
    });

    test('San Mateo and Contact tour buttons should open Calendly popup on-page and track tour_booking_scheduled', async ({ page }) => {
      await page.route('**/assets/external/widget.js', (route) =>
        route.fulfill({ status: 200, contentType: 'application/javascript', body: '' })
      );

      for (const routeCase of [
        { path: '/san-mateo-preschool-daycare/', buttonName: /Schedule a Private Campus Tour/i },
        { path: '/contact/', buttonName: /Book a School Tour/i },
      ]) {
        await page.goto(routeCase.path);

        await page.evaluate(() => {
          (window as any).__popupUrls = [];
          window.Calendly = {
            initPopupWidget: ({ url }: { url: string }) => {
              (window as any).__popupUrls.push(url);
            },
          };
        });

        const tourButton = page.getByRole('link', { name: routeCase.buttonName });
        await expect(tourButton).toBeVisible();
        await tourButton.click();

        expect(page.url()).toContain(routeCase.path);
        const popupUrls = await page.evaluate(() => (window as any).__popupUrls);
        expect(popupUrls).toEqual(['https://calendly.com/mary-kubo']);

        await page.evaluate(() => {
          window.dispatchEvent(
            new MessageEvent('message', {
              data: JSON.stringify({ event: 'calendly.event_scheduled', payload: {} }),
              origin: 'https://calendly.com',
            })
          );
        });

        const dataLayerEvent = await page.evaluate(() => {
          return ((window.dataLayer || []) as Record<string, unknown>[]).find(
            (item) => item && item.event === 'tour_booking_scheduled'
          );
        });

        expect(dataLayerEvent).toMatchObject({
          event: 'tour_booking_scheduled',
          event_category: 'engagement',
          event_label: 'Calendly Widget',
          value: 1,
        });
      }
    });

    test('falls back to a single new tab without double-navigating the parent page when widget script fails', async ({ page, context }) => {
      await context.route('https://calendly.com/**', (route) =>
        route.fulfill({ status: 200, contentType: 'text/html', body: '<html><body>Calendly</body></html>' })
      );
      await page.route('**/assets/external/widget.js', (route) => route.abort());

      // 1. Immediate click after module load (before idle badge script settles) triggers window.open(..., 'noopener,noreferrer')
      await page.goto('/san-mateo-preschool-daycare/?utm_source=e2e_immediate');
      const tourButton = page.getByRole('link', { name: /Schedule a Private Campus Tour/i });
      await expect(tourButton).toBeVisible();

      const [immediatePopup] = await Promise.all([
        context.waitForEvent('page'),
        tourButton.click(),
      ]);
      await immediatePopup.waitForLoadState('domcontentloaded');
      expect(immediatePopup.url()).toBe('https://calendly.com/mary-kubo?utm_source=e2e_immediate');
      await immediatePopup.close();

      // Parent tab must remain on Kubo Montessori (never double-navigated via location.assign)
      await page.waitForTimeout(200);
      expect(page.url()).toContain('/san-mateo-preschool-daycare/');

      // 2. Subsequent click once script is already marked error (allows native <a target="_blank"> with UTMs)
      await page.waitForSelector('head script[data-calendly-status="error"]', { state: 'attached' });
      const [nativePopup] = await Promise.all([
        context.waitForEvent('page'),
        tourButton.click(),
      ]);
      await nativePopup.waitForLoadState('domcontentloaded');
      expect(nativePopup.url()).toBe('https://calendly.com/mary-kubo?utm_source=e2e_immediate');
      await nativePopup.close();

      await page.waitForTimeout(200);
      expect(page.url()).toContain('/san-mateo-preschool-daycare/');
    });
  });
});
