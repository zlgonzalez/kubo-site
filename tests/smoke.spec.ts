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
});
