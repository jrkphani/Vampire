import { test, expect } from '@playwright/test';

test.describe('Dashboard Functionality', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to login page
    await page.goto('/');
    
    // Login with test credentials
    await page.fill('input[placeholder="Enter staff code"]', 'SC001');
    await page.fill('input[placeholder="Enter PIN"]', '1234');
    await page.click('button:has-text("Sign In")');
    
    // Wait for dashboard to load
    await page.waitForURL('/dashboard');
    await page.waitForLoadState('networkidle');
  });

  test('should load dashboard with correct data', async ({ page }) => {
    // Check page title
    await expect(page).toHaveTitle(/ValueMax Vampire/);
    
    // Verify dashboard header
    await expect(page.locator('h1')).toContainText('Dashboard');
    
    // Check current time display
    await expect(page.locator('text=Current Time')).toBeVisible();
    
    // Verify KPI cards are loaded with data
    await expect(page.locator('text=Today\'s Renewals')).toBeVisible();
    await expect(page.locator('text=Today\'s Redemptions')).toBeVisible();
    await expect(page.locator('text=Active Tickets')).toBeVisible();
    await expect(page.locator('text=Today\'s Amount')).toBeVisible();
    
    // Check that metrics show actual numbers (not loading states)
    await expect(page.locator('[data-testid="renewals-count"]').or(page.locator('text=/^\\d+$/'))).toBeVisible();
  });

  test('should display Quick Actions correctly', async ({ page }) => {
    // Verify all Quick Action cards are present
    await expect(page.locator('text=Ticket Renewals')).toBeVisible();
    await expect(page.locator('text=Ticket Redemptions')).toBeVisible();
    await expect(page.locator('text=Universal Enquiry')).toBeVisible();
    await expect(page.locator('text=Lost Pledges')).toBeVisible();
    await expect(page.locator('text=Combined Operations')).toBeVisible();
    await expect(page.locator('text=Credit Rating')).toBeVisible();
    
    // Check keyboard shortcuts are displayed
    await expect(page.locator('text=F1')).toBeVisible();
    await expect(page.locator('text=F2')).toBeVisible();
    await expect(page.locator('text=F3')).toBeVisible();
    await expect(page.locator('text=F4')).toBeVisible();
    await expect(page.locator('text=F5')).toBeVisible();
    await expect(page.locator('text=F6')).toBeVisible();
  });

  test('should load Recent Transactions', async ({ page }) => {
    // Wait for Recent Transactions section
    await expect(page.locator('text=Recent Transactions')).toBeVisible();
    
    // Check that transactions are loaded (not showing "No recent transactions")
    await expect(page.locator('text=No recent transactions available')).not.toBeVisible();
    
    // Verify transaction entries exist
    await expect(page.locator('text=/B\/\\d{4}\/\\d{4}/')).toBeVisible(); // Ticket number format
  });

  test('should not display any \\n characters in UI', async ({ page }) => {
    // Check the entire page content for literal \n characters
    const pageContent = await page.locator('body').textContent();
    expect(pageContent).not.toContain('\\n');
    expect(pageContent).not.toMatch(/\\n/);
  });

  test('should have proper responsive layout', async ({ page }) => {
    // Test desktop layout
    await page.setViewportSize({ width: 1920, height: 1080 });
    
    // Verify grid layout is working
    const kpiCards = page.locator('[class*="grid"][class*="grid-cols"]').first();
    await expect(kpiCards).toBeVisible();
    
    // Test tablet layout
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(500); // Allow layout to adjust
    
    // Elements should still be visible and properly arranged
    await expect(page.locator('text=Dashboard')).toBeVisible();
    await expect(page.locator('text=Quick Actions')).toBeVisible();
  });

  test('should handle MSW mock responses correctly', async ({ page }) => {
    // Listen for network requests to verify MSW is working
    const responses = [];
    page.on('response', response => {
      if (response.url().includes('/api/')) {
        responses.push({
          url: response.url(),
          status: response.status()
        });
      }
    });
    
    // Reload to trigger API calls
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Wait a bit for responses to be captured
    await page.waitForTimeout(1000);
    
    // Verify we have API responses and they're successful
    expect(responses.length).toBeGreaterThan(0);
    
    // Check for specific endpoints that should be working
    const transactionResponse = responses.find(r => r.url.includes('/api/transactions/recent'));
    if (transactionResponse) {
      expect(transactionResponse.status).toBe(200);
    }
  });

  test('should display monetary values correctly', async ({ page }) => {
    // Check that monetary values are formatted properly
    await expect(page.locator('text=/\\$[\\d,]+\\.\\d{2}/')).toBeVisible();
    
    // Verify Today's Amount shows currency formatting
    const todayAmount = page.locator('text=Today\'s Amount').locator('..').locator('text=/\\$[\\d,]+\\.\\d{2}/');
    await expect(todayAmount).toBeVisible();
  });

  test('should have accessible navigation elements', async ({ page }) => {
    // Check sidebar navigation exists
    await expect(page.locator('[role="navigation"]').or(page.locator('nav'))).toBeVisible();
    
    // Verify main navigation links are accessible
    await expect(page.locator('text=Dashboard')).toBeVisible();
    
    // Check that the page has proper heading structure
    const h1Elements = await page.locator('h1').count();
    expect(h1Elements).toBeGreaterThanOrEqual(1);
  });
});