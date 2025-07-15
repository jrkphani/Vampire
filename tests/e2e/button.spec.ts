import { test, expect } from '@playwright/test';

test.describe('Button Component', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should render buttons without errors', async ({ page }) => {
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
    
    // Check if any buttons are rendered on the page
    const buttons = page.locator('button');
    
    // Expect at least one button to be present
    await expect(buttons.first()).toBeVisible();
  });

  test('should not have console errors related to ButtonProps import', async ({ page }) => {
    const errors: string[] = [];
    const pageErrors: string[] = [];
    
    // Listen for console errors
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    // Listen for page errors (including module loading errors)
    page.on('pageerror', error => {
      pageErrors.push(error.message);
    });
    
    // Wait for page to fully load
    await page.waitForLoadState('networkidle');
    
    // Check that there are no errors related to ButtonProps export
    const allErrors = [...errors, ...pageErrors];
    const buttonPropsErrors = allErrors.filter(error => 
      error.includes('ButtonProps') && (error.includes('export') || error.includes('module'))
    );
    
    expect(buttonPropsErrors).toHaveLength(0);
  });

  test('should be able to interact with buttons', async ({ page }) => {
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
    
    // Find all buttons on the page
    const buttons = page.locator('button:not([disabled])');
    
    if (await buttons.count() > 0) {
      const firstButton = buttons.first();
      
      // Check if button is clickable
      await expect(firstButton).toBeEnabled();
      
      // Try to click the button
      await firstButton.click();
      
      // No errors should occur from clicking
    }
  });
});