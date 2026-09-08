import { test, expect } from '@playwright/test';

test('public site is the canonical entry point and launches the player PWA', async ({ page }) => {
  await page.goto('/');
  await expect(
    page.getByRole('heading', { name: /Learn safer choices before they become/ }),
  ).toBeVisible();

  await page.getByRole('button', { name: 'Try ShieldQuest', exact: true }).first().click();
  await expect(page).toHaveURL(/\/board$/);
  await expect(page.getByText('Mission previews · Progress lasts for this visit')).toBeVisible();
});

test('legacy website route redirects home and proposal facts stay aligned', async ({ page }) => {
  await page.goto('/website');
  await expect(page).toHaveURL(/\/$/);

  await page.goto('/how-it-works');
  await expect(
    page.getByRole('heading', { name: 'How ShieldQuest Works: The Six-Stage Learning Loop' }),
  ).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Protect', exact: true })).toBeVisible();
});

test('enhanced 3D is optional and reduced motion keeps the 2.5D board', async ({ page }) => {
  await page.goto('/board');
  await expect(page.locator('canvas[data-testid="three-board-atmosphere"]')).toBeVisible();

  await page.evaluate(() => localStorage.setItem('sq_enhanced_3d', 'false'));
  await page.reload();
  await expect(page.locator('canvas[data-testid="three-board-atmosphere"]')).toHaveCount(0);
  await expect(page.getByRole('button', { name: /Roll dice/ })).toBeVisible();
});
