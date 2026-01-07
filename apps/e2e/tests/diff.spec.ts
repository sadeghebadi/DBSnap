import { test, expect } from '@playwright/test';

test.describe('Diff Viewing', () => {
    const email = `diff-test-${Date.now()}@dbsnap.com`;
    const password = 'Password123!';

    test.beforeAll(async ({ browser }) => {
        // Signup
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

    test('should display diff viewer', async ({ page }) => {
        // Assuming prepopulated data or mocking would be needed here for a real "Diff View" test without a full successful backup/diff cycle.
        // For "Basic E2E", we might just check that we can access the route if we had an ID.
        // Or we mock the API response.

        // Let's mock a diff response to test the viewer UI detached from backend logic
        await page.route('*/**/api/diffs/*', async route => {
            const json = {
                id: 'diff-123',
                status: 'Completed',
                createdAt: new Date().toISOString(),
                snapshotA: { database: { project: { userId: 'test-user' } } },
                s3DetailKey: 'mock-key',
                added: 10,
                removed: 5,
                modified: 2
            };
            await route.fulfill({ json });
        });

        await page.route('*/**/api/diffs/*/lines*', async route => {
            const json = {
                data: [
                    { type: 'added', content: 'New Line' },
                    { type: 'removed', content: 'Old Line' },
                    { type: 'equal', content: 'Same Line' }
                ],
                meta: { page: 1, limit: 50, hasMore: false }
            };
            await route.fulfill({ json });
        });

        // Navigate to a fake diff URL
        await page.goto('/dashboard/diffs/diff-123');

        // Check if Monaco/Diff Viewer elements are present
        // Note: Monaco renders canvas/lines. We check for text presence.
        // Ensure the "added" text is visible (might be inside the editor)
        // Sometimes playright + canvas is hard. We check for the container.
        await expect(page.locator('.monaco-editor')).toBeVisible({ timeout: 10000 });
    });
});
