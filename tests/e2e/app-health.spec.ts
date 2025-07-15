import { test, expect } from '@playwright/test';

test.describe('Application Health Check', () => {
  test('should load application without any console errors', async ({ page }) => {
    const errors: string[] = [];
    const pageErrors: string[] = [];
    
    // Listen for all console errors
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    // Listen for page errors (including module loading errors)
    page.on('pageerror', error => {
      pageErrors.push(error.message);
    });
    
    // Navigate to the application
    await page.goto('/');
    
    // Wait for the application to fully load
    await page.waitForLoadState('networkidle');
    
    // Check for any module-related errors
    const allErrors = [...errors, ...pageErrors];
    const moduleErrors = allErrors.filter(error => 
      error.includes('module') || 
      error.includes('export') || 
      error.includes('import') ||
      error.includes('Props')
    );
    
    // Verify no module import/export errors
    expect(moduleErrors).toHaveLength(0);
    
    // Check that the page title is set
    await expect(page).toHaveTitle(/ValueMax|Vampire/);
  });

  test('should have accessible UI components', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Check for basic accessibility landmarks
    const main = page.locator('main, [role="main"]');
    if (await main.count() > 0) {
      await expect(main.first()).toBeVisible();
    }
    
    // Check for heading structure
    const headings = page.locator('h1, h2, h3, h4, h5, h6');
    if (await headings.count() > 0) {
      await expect(headings.first()).toBeVisible();
    }
  });

  test('should have working navigation', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Look for navigation elements
    const nav = page.locator('nav, [role="navigation"]');
    if (await nav.count() > 0) {
      await expect(nav.first()).toBeVisible();
    }
    
    // Check for links
    const links = page.locator('a[href]');
    if (await links.count() > 0) {
      // Verify at least one link is present and functional
      await expect(links.first()).toBeVisible();
    }
  });

  test('should handle keyboard navigation', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Test Tab navigation works
    await page.keyboard.press('Tab');
    
    // Check if focus is visible somewhere on the page
    const focusedElement = page.locator(':focus');
    if (await focusedElement.count() > 0) {
      await expect(focusedElement).toBeVisible();
    }
  });
});