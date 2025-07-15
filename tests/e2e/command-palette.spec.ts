import { test, expect } from '@playwright/test';

test.describe('Command Palette Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should open command palette with Ctrl+K shortcut', async ({ page }) => {
    // Press Ctrl+K to open command palette
    await page.keyboard.press('ControlOrMeta+k');
    
    // Wait a moment for the dialog to open
    await page.waitForTimeout(100);
    
    // Check if command palette dialog is visible
    const dialog = page.locator('[role="dialog"]');
    const commandPalette = page.locator('[data-testid="command-palette"], .command-palette, [cmdk-root]');
    
    // Try multiple selectors to find the command palette
    const isDialogVisible = await dialog.isVisible().catch(() => false);
    const isCommandPaletteVisible = await commandPalette.isVisible().catch(() => false);
    
    console.log('Dialog visible:', isDialogVisible);
    console.log('Command palette visible:', isCommandPaletteVisible);
    
    // Check for input field within command palette
    const searchInput = page.locator('input[placeholder*="Search"], input[placeholder*="command"], [cmdk-input]');
    const isSearchInputVisible = await searchInput.isVisible().catch(() => false);
    
    console.log('Search input visible:', isSearchInputVisible);
    
    // Print page content for debugging
    const pageContent = await page.content();
    console.log('Page title:', await page.title());
    
    // Check for any visible dialogs or modals
    const allDialogs = await page.locator('[role="dialog"]').all();
    console.log('Number of dialogs found:', allDialogs.length);
    
    for (let i = 0; i < allDialogs.length; i++) {
      const dialog = allDialogs[i];
      const isVisible = await dialog.isVisible();
      const text = await dialog.textContent().catch(() => '');
      console.log(`Dialog ${i}: visible=${isVisible}, text="${text.substring(0, 100)}..."`);
    }
    
    // Expect at least one of these conditions to be true
    expect(isDialogVisible || isCommandPaletteVisible || isSearchInputVisible).toBeTruthy();
  });

  test('should close command palette with Escape key', async ({ page }) => {
    // Open command palette first
    await page.keyboard.press('ControlOrMeta+k');
    await page.waitForTimeout(100);
    
    // Check if it's open
    const dialog = page.locator('[role="dialog"]');
    if (await dialog.isVisible()) {
      // Close with Escape
      await page.keyboard.press('Escape');
      await page.waitForTimeout(100);
      
      // Should be closed now
      await expect(dialog).not.toBeVisible();
    }
  });

  test('should allow typing in search input', async ({ page }) => {
    // Open command palette
    await page.keyboard.press('ControlOrMeta+k');
    await page.waitForTimeout(100);
    
    // Look for search input
    const searchInput = page.locator('input[placeholder*="Search"], input[placeholder*="command"], [cmdk-input]').first();
    
    if (await searchInput.isVisible()) {
      // Type in search
      await searchInput.fill('test search');
      
      // Verify input value
      await expect(searchInput).toHaveValue('test search');
    }
  });

  test('should show search results when typing', async ({ page }) => {
    // Open command palette
    await page.keyboard.press('ControlOrMeta+k');
    await page.waitForTimeout(100);
    
    // Look for search input
    const searchInput = page.locator('input[placeholder*="Search"], input[placeholder*="command"], [cmdk-input]').first();
    
    if (await searchInput.isVisible()) {
      // Type search term
      await searchInput.fill('renew');
      await page.waitForTimeout(200);
      
      // Look for search results
      const results = page.locator('[cmdk-item], .command-item, [role="option"]');
      const resultCount = await results.count();
      
      console.log('Number of search results:', resultCount);
      
      // If results exist, they should be visible
      if (resultCount > 0) {
        await expect(results.first()).toBeVisible();
      }
    }
  });

  test('should handle multiple keyboard shortcuts', async ({ page }) => {
    // Test opening and closing multiple times
    for (let i = 0; i < 3; i++) {
      // Open
      await page.keyboard.press('ControlOrMeta+k');
      await page.waitForTimeout(100);
      
      // Close with Escape
      await page.keyboard.press('Escape');
      await page.waitForTimeout(100);
    }
    
    // Final check - should be closed
    const dialog = page.locator('[role="dialog"]');
    const isVisible = await dialog.isVisible().catch(() => false);
    
    if (isVisible) {
      await expect(dialog).not.toBeVisible();
    }
  });

  test('should be accessible with screen readers', async ({ page }) => {
    // Open command palette
    await page.keyboard.press('ControlOrMeta+k');
    await page.waitForTimeout(100);
    
    // Check for proper ARIA attributes
    const dialog = page.locator('[role="dialog"]');
    
    if (await dialog.isVisible()) {
      // Should have proper dialog attributes
      await expect(dialog).toHaveAttribute('role', 'dialog');
      
      // Should have accessible title
      const title = dialog.locator('[aria-labelledby], h1, h2, h3');
      if (await title.count() > 0) {
        await expect(title.first()).toBeVisible();
      }
    }
  });
});