import { test, expect } from '@playwright/test';

test('development entry loads React, opens a mission and survives a reload', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('requestfailed', (request) => {
    // React StrictMode remounts effects in development; the detail loader cancels
    // its first request on cleanup. Continue rejecting every other failure.
    if (
      request.failure()?.errorText === 'net::ERR_ABORTED' &&
      new URL(request.url()).pathname === '/api/scenarios/school-group-chat'
    )
      return;
    errors.push(`${request.url()}: ${request.failure()?.errorText}`);
  });
  page.on('response', (response) => {
    if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`);
  });

  await page.goto('/board');
  const heading = page.getByRole('heading', { name: 'ShieldQuest City', exact: true });
  await expect(heading).toBeVisible();
  await page.getByRole('button', { name: /Open School Street, Chapter 1/ }).click();
  await page.getByRole('button', { name: 'Explore district', exact: true }).click();
  await page.getByRole('link', { name: /The group chat dilemma/ }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Continue to Investigate' })).toBeVisible();
  await page.getByRole('button', { name: 'Close dialog' }).click();
  await page.reload();
  await expect(heading).toBeVisible();
  expect(errors).toEqual([]);
});
