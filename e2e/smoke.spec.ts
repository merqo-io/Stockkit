import { expect, test } from '@playwright/test';

test('landing renders', async ({ page }) => {
  await page.goto('/');
  await expect(
    page.getByRole('heading', { level: 1, name: /See what your stock is worth/ })
  ).toBeVisible();
});

test('login renders', async ({ page }) => {
  await page.goto('/login');
  await expect(page.getByRole('button', { name: /Continue with Google/ })).toBeVisible();
});
