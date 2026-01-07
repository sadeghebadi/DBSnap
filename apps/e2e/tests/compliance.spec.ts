```typescript
import { test, expect } from '@playwright/test';
import { PrismaClient } from '@dbsnap/database';
import * as bcrypt from 'bcrypt';

test.describe('GDPR Compliance & Admin Tools', () => {
  let userId: string;
  let userEmail: string;
  let prisma: PrismaClient;

  test.beforeAll(async () => {
    prisma = new PrismaClient();
    userEmail = `gdpr - ${ Date.now() } @example.com`;
    const passwordHash = await bcrypt.hash('Password123!', 10);
    
    const user = await prisma.user.create({
        data: {
            email: userEmail,
            passwordHash,
            isVerified: true,
            plan: 'FREE'
        }
    });
    userId = user.id;
  });

  test.afterAll(async () => {
      // Cleanup if delete failed logic didn't work, though successful test deletes the user.
      try {
          await prisma.user.delete({ where: { id: userId } }).catch(() => {});
      } catch (e) {}
      await prisma.$disconnect();
  })

  test('Admin can toggle legal hold and delete user', async ({ page }) => {
    // Login as Admin
    await page.goto('/login');
    await page.fill('input[name="email"]', 'admin@dbsnap.com'); 
    await page.fill('input[name="password"]', 'admin'); 
    await page.click('button[type="submit"]');
    
    // Check if login worked - dashboard?
    await expect(page).toHaveURL(/\/dashboard/);
    
    // Navigate to User Details
    await page.goto(`/admin/users / ${ userId } `);
    await expect(page.locator('h1')).toContainText(userEmail);

    // 1. Enable Legal Hold
    // Label click or input click
    await page.click('input[type="checkbox"]'); 
    
    // Wait for toast or UI update. 
    // Since UI optimistic update + toast.
    await expect(page.getByText('Legal Hold Applied')).toBeVisible();

    // 2. Try Delete
    page.once('dialog', dialog => dialog.accept());
    const deleteBtn = page.locator('button:has-text("Delete User Data")');
    await deleteBtn.click();
    
    // Expect failure toast
    await expect(page.getByText('User is under Legal Hold')).toBeVisible();

    // 3. Disable Legal Hold
    await page.click('input[type="checkbox"]');
    await expect(page.getByText('Legal Hold Removed')).toBeVisible();

    // 4. Delete Success
    page.once('dialog', dialog => dialog.accept());
    await deleteBtn.click();
    await expect(page.getByText('Deletion scheduled')).toBeVisible();
    await expect(page).toHaveURL(/\/admin\/users/);
  });
});
```
