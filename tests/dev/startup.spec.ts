import { test, expect } from '@playwright/test';

test('development entry loads React, opens a mission and survives a reload', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('requestfailed', (request) => {
    errors.push(`${request.url()}: ${request.failure()?.errorText}`);
  });
  page.on('response', (response) => {
    if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`);
  });

  await page.goto('/');
  const heading = page.getByRole('heading', { name: 'A little courage. A safer city.' });
  await expect(heading).toBeVisible();
  await page.getByRole('button', { name: 'Explore mission', exact: true }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.getByRole('button', { name: 'Close dialog' }).click();
  await page.reload();
  await expect(heading).toBeVisible();
  expect(errors).toEqual([]);
});
