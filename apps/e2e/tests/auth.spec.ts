import { test, expect } from '@playwright/test';
import { PrismaClient } from '@dbsnap/database';
import * as bcrypt from 'bcrypt';

test.describe('Authentication', () => {
    // Generate unique email to avoid conflicts
    const email = `test-${Date.now()}@dbsnap.com`;
    const password = 'Password123!';
    let prisma: PrismaClient;

    test.beforeAll(async () => {
        prisma = new PrismaClient();
        const passwordHash = await bcrypt.hash(password, 10);

        await prisma.user.create({
            data: {
                email,
                passwordHash,
                isVerified: true, // Bypass verification
            },
        });
    });

    test.afterAll(async () => {
        // Cleanup
        await prisma.user.deleteMany({ where: { email } });
        await prisma.$disconnect();
    });

    test('should register a new user', async ({ page }) => {
        const newEmail = `register-${Date.now()}@dbsnap.com`;
        await page.goto('/register');
        await page.fill('input[name="email"]', newEmail);
        await page.fill('input[name="password"]', password);
        await page.fill('input[name="confirmPassword"]', password);
        await page.click('button[type="submit"]');

        // Check for success message or "Check your email"
        // Adjust expectation based on actual UI behavior
        await expect(page.getByText(/check your email/i)).toBeVisible();
    });

    test('should login with existing user', async ({ page }) => {
        await page.goto('/login');
        await page.fill('input[name="email"]', email);
        await page.fill('input[name="password"]', password);
        await page.click('button[type="submit"]');

        await expect(page).toHaveURL('/dashboard');
        // await expect(page.locator('text=Welcome')).toBeVisible(); // Depends on dashboard content
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
