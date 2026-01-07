import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
    const email = `test-${Date.now()}@dbsnap.com`;
    const password = 'Password123!';

    test('should register a new user', async ({ page }) => {
        await page.goto('/register');

        await page.fill('input[name="email"]', email);
        await page.fill('input[name="password"]', password);
        await page.fill('input[name="confirmPassword"]', password);

        await page.click('button[type="submit"]');

        // Should redirect to dashboard or verification notice
        await expect(page).toHaveURL(/\/dashboard/);
    });

    test('should login with existing user', async ({ page }) => {
        await page.goto('/login');

        await page.fill('input[name="email"]', email);
        await page.fill('input[name="password"]', password);

        await page.click('button[type="submit"]');

        await expect(page).toHaveURL('/dashboard');
        await expect(page.locator('text=Welcome')).toBeVisible();
    });

    test('should logout successfully', async ({ page }) => {
        // Login first
        await page.goto('/login');
        await page.fill('input[name="email"]', email);
        await page.fill('input[name="password"]', password);
        await page.click('button[type="submit"]');

        await expect(page).toHaveURL('/dashboard');

        // Click logout
        await page.click('button:has-text("Logout")');

        await expect(page).toHaveURL('/login');
    });
});
