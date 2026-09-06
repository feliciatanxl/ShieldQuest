import { test, expect } from '@playwright/test';

test('district selection and six-phase mission preview unlock a demo Guardian', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/');
  await page.getByRole('button', { name: '2 Retail District', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Too good to be true?' })).toBeVisible();
  await page.getByRole('button', { name: 'Explore mission', exact: true }).click();
  await page.getByRole('button', { name: 'Continue to Investigate' }).click();
  await page.getByRole('button', { name: 'Continue to Discuss' }).click();
  await page.getByRole('button', { name: 'Continue to Decide' }).click();
  await expect(page.getByRole('button', { name: 'Confirm demo choice' })).toBeDisabled();
  await page.getByRole('radio', { name: 'Pause and verify the seller and listing' }).check();
  await page.getByRole('button', { name: 'Confirm demo choice' }).click();
  await expect(page.getByText('You notice the repeated photos', { exact: false })).toBeVisible();
  await page.getByRole('button', { name: 'Continue to Protect' }).click();
  await page.getByRole('button', { name: 'Finish preview' }).click();
  await expect(page.getByRole('dialog')).not.toBeVisible();
  await page.getByRole('button', { name: 'View your collection' }).click();
  await expect(page.getByText('1 of 6 · demo progress')).toBeVisible();
  expect(errors).toEqual([]);
});

test('QR entry prefills a preview code without claiming live membership', async ({ page }) => {
  await page.goto('/?session=TEST42');
  await expect(page.getByLabel('Session code')).toHaveValue('TEST42');
  await expect(page.getByRole('status')).toContainText(
    'Session lookup and joining are not connected yet',
  );
  await page.getByLabel('Session code').fill('CITY123');
  await page.getByRole('button', { name: 'Preview', exact: true }).click();
  await expect(page.getByRole('status')).toContainText('CITY123');
  await expect(page.getByText('Player 5', { exact: true })).toBeVisible();
});

test('facilitator draft editing is local and reversible', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'For facilitators' }).click();
  await page.getByRole('button', { name: 'New draft' }).click();
  await page.getByLabel('Scenario title').fill('A new sample story');
  await page.getByRole('button', { name: 'Save local preview' }).click();
  await expect(page.getByText('A new sample story', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Edit A new sample story', exact: true }).click();
  await page.getByRole('button', { name: 'Delete local preview' }).click();
  await expect(page.getByText('A new sample story', { exact: true })).not.toBeVisible();
});

test('mobile navigation and reflection work without horizontal overflow', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );
  await page.screenshot({ path: '.local/mobile-preview.png', fullPage: true });
  await page
    .getByRole('navigation', { name: 'Mobile navigation' })
    .getByRole('button', { name: 'Reflection' })
    .click();
  await page.getByRole('radio', { name: 'Quite confident', exact: true }).check();
  await page.getByRole('button', { name: 'Save preview response' }).click();
  await expect(page.getByRole('status')).toContainText('has not been submitted');
});

test('production shell, QR entry and bundled missions remain usable offline', async ({
  page,
  context,
}) => {
  await page.goto('/');
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
    if (!navigator.serviceWorker.controller)
      await new Promise<void>((resolve) =>
        navigator.serviceWorker.addEventListener('controllerchange', () => resolve(), {
          once: true,
        }),
      );
  });
  const manifest = await page.request.get('/manifest.json');
  expect(await manifest.json()).toMatchObject({
    name: 'ShieldQuest',
    display: 'standalone',
    orientation: 'portrait',
  });
  await context.setOffline(true);
  await expect(page.getByRole('status')).toContainText('You’re offline');
  await page.reload();
  await expect(
    page.getByRole('heading', { name: 'A little courage. A safer city.' }),
  ).toBeVisible();
  // Verify network failure directly: Chrome's emulated navigator.onLine can reset on a SW reload.
  expect(
    await page.evaluate(() =>
      fetch('/api/health', { cache: 'no-store' })
        .then(() => true)
        .catch(() => false),
    ),
  ).toBe(false);
  await page.getByRole('button', { name: 'Explore mission', exact: true }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.getByRole('button', { name: 'Close dialog' }).click();
  await page.goto('/?session=DEMO01');
  await expect(page.getByLabel('Session code')).toHaveValue('DEMO01');
});

test('desktop board renders cleanly and dialog restores keyboard focus', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1100 });
  await page.goto('/');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );
  await page.screenshot({ path: '.local/desktop-preview.png', fullPage: true });
  const help = page.getByRole('button', { name: 'How to play' });
  await help.click();
  await page.keyboard.press('Escape');
  await expect(help).toBeFocused();
});
