import { test, expect } from '@playwright/test';
import { demoScenarios } from '../../types/demo';

test('all districts can be discovered directly without awarding progress', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('Mission previews · Progress lasts for this visit')).toBeVisible();
  for (const name of ['School Street', 'Retail District', 'Digi-District', 'Community Hub']) {
    await page.getByRole('button', { name: new RegExp(`Open ${name}, Chapter`) }).click();
    await expect(
      page.getByRole('dialog').getByRole('heading', { name, exact: true }),
    ).toBeVisible();
    await page.keyboard.press('Escape');
    await page.getByRole('button', { name: new RegExp(`Open ${name}, Chapter`) }).click();
    await expect(page.getByRole('link', { name: 'Open the full district route' })).toBeVisible();
    await page.getByRole('link', { name: 'Open the full district route' }).click();
    await expect(page.getByRole('heading', { name, exact: true })).toBeVisible();
    await page.getByRole('button', { name: 'About this district' }).click();
    await expect(page.locator('#district-about')).toBeVisible();
    await page.getByRole('link', { name: 'Back to ShieldQuest City', exact: true }).last().click();
  }
  await expect(page.getByText('0/12 activities', { exact: false })).toBeVisible();
  await expect(page.getByRole('definition')).toHaveText(['0', '0', '0']);
});

test('dice landing discovers a district, opens its checkpoint and permits the next turn', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.addInitScript(() => {
    Math.random = () => 0;
  });
  await page.goto('/');
  const roll = page.getByRole('button', { name: /Roll dice/ });
  await roll.click();
  await expect(
    page.getByRole('dialog').getByRole('heading', { name: 'School Street', exact: true }),
  ).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(
    page.getByRole('dialog').getByText('District Checkpoint', { exact: false }).first(),
  ).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(roll).toBeEnabled();
  await expect(page.getByRole('button', { name: /Space 2 of .*You are here/ })).toHaveAttribute(
    'aria-current',
    'location',
  );
  await roll.click();
  await expect(
    page.getByRole('dialog').getByRole('heading', { name: 'Just Hold It For Me' }),
  ).toBeVisible();
  await expect(page.getByRole('dialog').getByText('Coming soon', { exact: true })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(roll).toBeEnabled();
  await expect(page.getByRole('definition')).toHaveText(['0', '0', '0']);
});

test('API failure is recoverable and an empty catalogue does not invent missions', async ({
  page,
}) => {
  await page.route('**/api/scenarios', (route) =>
    route.fulfill({
      status: 503,
      json: { error: { code: 'UNAVAILABLE', message: 'Unavailable' } },
    }),
  );
  await page.goto('/');
  await expect(page.getByText('Missions could not be loaded.', { exact: false })).toBeVisible();
  await page.route('**/api/scenarios', (route) =>
    route.fulfill({ json: { mode: 'live', data: [] } }),
  );
  await page.getByRole('button', { name: 'Retry' }).click();
  await expect(page.getByText('City missions', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: /Open School Street, Chapter 1/ }).click();
  await page.getByRole('button', { name: 'Explore district', exact: true }).click();
  await expect(page.getByRole('dialog').getByText('0 / 1 completed')).toBeVisible();
  await expect(
    page.getByRole('dialog').getByText('Coming soon — activity update pending'),
  ).toHaveCount(2);
  await expect(page.getByRole('dialog').getByRole('link', { name: /Risk or Safe\?/ })).toBeVisible();
});

test('API mission content reaches the district sheet and the existing player', async ({ page }) => {
  const data = structuredClone(demoScenarios);
  data[0].title = 'A mission from the API catalogue';
  await page.route('**/api/scenarios', (route) => route.fulfill({ json: { mode: 'demo', data } }));
  await page.route('**/api/scenarios/school-group-chat', (route) =>
    route.fulfill({ json: { mode: 'demo', data: data[0] } }),
  );
  await page.goto('/');
  await page.getByRole('button', { name: /Open School Street, Chapter 1/ }).click();
  await page.getByRole('button', { name: 'Explore district', exact: true }).click();
  await page.getByRole('link', { name: /A mission from the API catalogue/ }).click();
  await expect(
    page.getByRole('dialog').getByRole('heading', { name: 'A mission from the API catalogue' }),
  ).toBeVisible();
});

test('sheet keyboard focus stays inside and returns to its opener', async ({ page }) => {
  await page.goto('/');
  const help = page.getByRole('button', { name: 'About this game', exact: true });
  await help.click();
  for (let i = 0; i < 16; i++) {
    await page.keyboard.press('Tab');
    expect(
      await page.getByRole('dialog').evaluate((dialog) => dialog.contains(document.activeElement)),
    ).toBe(true);
  }
  await page.keyboard.press('Escape');
  await expect(help).toBeFocused();
});
