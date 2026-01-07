import { test, expect } from '@playwright/test';

test.describe('Backup Flow', () => {
    const email = `backup-test-${Date.now()}@dbsnap.com`;
    const password = 'Password123!';

    test.beforeAll(async ({ browser }) => {
        // Ideally create user via API or signup once
        const page = await browser.newPage();
        await page.goto('/register');
        await page.fill('input[name="email"]', email);
        await page.fill('input[name="password"]', password);
        await page.fill('input[name="confirmPassword"]', password);
        await page.click('button[type="submit"]');
        await expect(page).toHaveURL(/\/dashboard/);
        await page.close();
    });

    test.beforeEach(async ({ page }) => {
        await page.goto('/login');
        await page.fill('input[name="email"]', email);
        await page.fill('input[name="password"]', password);
        await page.click('button[type="submit"]');
        await expect(page).toHaveURL('/dashboard');
    });

    test('should create a project and trigger manual backup', async ({ page }) => {
        // 1. Create Project
        await page.click('text=New Project'); // Assuming button exists
        await page.fill('input[name="name"]', 'E2E Backup Project');
        await page.selectOption('select[name="environment"]', 'production');
        await page.click('button:has-text("Create")');

        // Expect to be redirected to project page or see it in list
        // Let's assume redirect

        // 2. Add Database
        await page.click('text=Add Database');
        await page.fill('input[name="name"]', 'Test DB');
        const mongoUri = 'mongodb://localhost:27017/test_db'; // Safe dummy URI or use internal one
        await page.fill('input[name="connectionString"]', mongoUri);
        await page.selectOption('select[name="type"]', 'mongodb');
        await page.click('button:has-text("Connect")');

        // 3. Trigger Backup
        await page.click('button:has-text("Backup Now")');

        // 4. Verify status
        await expect(page.locator('text=Backup started')).toBeVisible();
        // In a real E2E, we might wait for completion, but that takes time.
        // We check if it appears in the list as Pending/Running
        await expect(page.locator('text=Pending')).toBeVisible({ timeout: 5000 });
    });
});
