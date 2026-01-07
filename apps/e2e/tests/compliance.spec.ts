
import { test, expect } from '@playwright/test';
import { PrismaClient } from '@dbsnap/database';
import * as bcrypt from 'bcrypt';

test.describe('GDPR Compliance & Admin Tools', () => {
    let userId: string;
    let userEmail: string;
    let prisma: PrismaClient;
    let adminEmail: string;
    const password = 'Password123!';

    test.beforeAll(async () => {
        prisma = new PrismaClient();
        userEmail = `gdpr-victim-${Date.now()}@example.com`;
        adminEmail = `gdpr-admin-${Date.now()}@example.com`;
        const passwordHash = await bcrypt.hash(password, 10);

        // Create Victim
        const user = await prisma.user.create({
            data: {
                email: userEmail,
                passwordHash,
                isVerified: true,
                plan: 'FREE'
            }
        });
        userId = user.id;

        // Create Admin
        const adminRole = await prisma.role.findUnique({ where: { name: 'ADMIN' } });
        if (!adminRole) throw new Error('ADMIN role not found');

        await prisma.user.create({
            data: {
                email: adminEmail,
                passwordHash,
                isVerified: true,
                roleId: adminRole.id
            }
        });
    });

    test.afterAll(async () => {
        // Cleanup
        try {
            await prisma.user.deleteMany({ where: { email: { in: [userEmail, adminEmail] } } });
        } catch (e) { }
        await prisma.$disconnect();
    })

    test('Admin can toggle legal hold and delete user', async ({ page }) => {
        // Login as Admin
        await page.goto('/login');
        await page.fill('input[name="email"]', adminEmail);
        await page.fill('input[name="password"]', password);
        await page.click('button[type="submit"]');

        // Check if login worked
        await expect(page).toHaveURL(/\/dashboard/);

        console.log('User ID Target:', userId);
        console.log('User Email Target:', userEmail);

        // Navigate to User Details
        // Navigate to User Details
        console.log('Navigating to:', `/admin/users/${userId}`);
        await page.goto(`/admin/users/${userId}`);

        // Debug page text if H1 check fails
        console.log('Page Text:', await page.locator('body').innerText());

        await expect(page.locator('h1')).toContainText(userEmail);

        // 1. Enable Legal Hold
        const legalHoldPromise = page.waitForEvent('dialog');
        await page.getByText('Legal Hold').first().waitFor({ timeout: 5000 });
        await page.locator('input[type="checkbox"]').click({ force: true });
        const legalHoldDialog = await legalHoldPromise;
        console.log('Dialog Message:', legalHoldDialog.message());
        expect(legalHoldDialog.message()).toContain('Legal Hold Applied');
        await legalHoldDialog.dismiss();

        // 2. Safety Check: Delete should be disabled
        const deleteBtn = page.locator('button:has-text("Delete User Data")');
        await expect(deleteBtn).toBeDisabled();

        // Skip the click and dialog expectation since it's disabled
        /*
        const confirmPromise = page.waitForEvent('dialog');
        await deleteBtn.click();
        const confirmDialog = await confirmPromise;
        expect(confirmDialog.message()).toContain('PERMANENTLY DELETE USER');
        await confirmDialog.accept();
        const errorPromise = page.waitForEvent('dialog');
        const errorDialog = await errorPromise;
        expect(errorDialog.message()).toContain('Legal Hold');
        await errorDialog.dismiss();
        */

        // 3. Disable Legal Hold
        const disableHoldPromise = page.waitForEvent('dialog');
        await page.locator('input[type="checkbox"]').click({ force: true });
        const disableHoldDialog = await disableHoldPromise;
        expect(disableHoldDialog.message()).toContain('Legal Hold Removed');
        await disableHoldDialog.dismiss();

        // 4. Delete Success
        // Setup Confirm
        const finalConfirmPromise = page.waitForEvent('dialog');
        await deleteBtn.click();
        const finalConfirmDialog = await finalConfirmPromise;
        await finalConfirmDialog.accept();

        // Setup Success Alert
        const successPromise = page.waitForEvent('dialog');
        // accepting triggers fetch delete
        const successDialog = await successPromise;
        expect(successDialog.message()).toContain('Deletion scheduled');
        await successDialog.dismiss();

        await expect(page).toHaveURL(/\/admin\/users/);
    });
});
