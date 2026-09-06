import { test, expect, type Page } from '@playwright/test';

async function finishSchoolPreview(page: Page) {
  await page
    .getByRole('navigation', { name: 'Main navigation', exact: true })
    .getByRole('button', { name: 'City board', exact: true })
    .click();
  await page.getByRole('button', { name: /Open School Street, Chapter 1/ }).click();
  const discover = page.getByRole('button', { name: 'Explore district', exact: true });
  if (await discover.isVisible()) await discover.click();
  await page.getByRole('link', { name: /The group chat dilemma/ }).click();
  await page.getByRole('button', { name: 'Continue to Investigate' }).click();
  await page.getByRole('button', { name: 'Continue to Discuss' }).click();
  await page.getByRole('button', { name: 'Continue to Decide' }).click();
  await page.getByRole('radio', { name: 'Pause sharing and check in with the student' }).check();
  await page.getByRole('button', { name: 'Confirm demo choice' }).click();
  await page.getByRole('button', { name: 'Continue to Protect' }).click();
  await page.getByRole('button', { name: 'Finish preview' }).click();
}

test('six guardians start unmet; first meeting, roster and checkpoint share progress', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.setViewportSize({ width: 1440, height: 950 });
  await page.goto('/');
  const nav = page.getByRole('navigation', { name: 'Main navigation', exact: true });
  await nav.getByRole('button', { name: 'Guardians', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Skills you are building' })).toBeVisible();
  await expect(page.getByRole('article')).toHaveCount(6);
  await expect(page.getByRole('article').getByText('Not yet met', { exact: true })).toHaveCount(6);
  await page.screenshot({
    path: '.local/guardians-desktop.png',
    fullPage: true,
    animations: 'disabled',
  });
  await finishSchoolPreview(page);
  const meeting = page.getByRole('dialog');
  await expect(meeting.getByRole('heading', { name: 'Echo', exact: true })).toBeVisible();
  await expect(meeting).toContainText('Hold Before Acting');
  await page.screenshot({
    path: '.local/guardian-met.png',
    fullPage: true,
    animations: 'disabled',
  });
  await meeting.getByRole('button', { name: 'Continue', exact: true }).click();
  await nav.getByRole('button', { name: 'Guardians', exact: true }).click();
  const echo = page
    .getByRole('article')
    .filter({ has: page.getByRole('heading', { name: 'Echo', exact: true }) });
  await expect(echo.getByText('Met', { exact: true })).toBeVisible();
  await expect(echo.getByText('1 / 6', { exact: true })).toBeVisible();
  await expect(echo.getByText('Level 1')).toBeVisible();
  await finishSchoolPreview(page);
  await expect(page.getByRole('dialog')).not.toBeVisible();
  await expect(page.getByText('Echo progress already earned — practice run')).toBeVisible();
  await page.getByRole('button', { name: 'Dismiss guardian progress' }).click();
  await nav.getByRole('button', { name: 'City board', exact: true }).click();
  await page.getByRole('button', { name: /Space 6 of 26/ }).click();
  await expect(page.getByRole('dialog').getByText('1 / 6', { exact: true })).toBeVisible();
  await expect(page.getByRole('dialog').getByText('Level 1', { exact: true })).toBeVisible();
  await page.keyboard.press('Escape');
  await page.reload();
  await nav.getByRole('button', { name: 'Guardians', exact: true }).click();
  await expect(page.getByText('0/6', { exact: true })).toBeVisible();
  expect(errors).toEqual([]);
});

test('mobile guardian selector exposes one card and returns to the board', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page
    .getByRole('navigation', { name: 'Mobile navigation' })
    .getByRole('button', { name: 'Guardians', exact: true })
    .click();
  for (const name of ['VeriFox', 'Echo', 'Cluepaw', 'ByteBuddy', 'Beacon', 'Shieldfin']) {
    await page.getByRole('button', { name: new RegExp(`^${name} Not yet met$`, 'i') }).click();
    await expect(page.getByRole('article')).toHaveCount(1);
    await expect(page.getByRole('heading', { name, exact: true })).toBeVisible();
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );
  await page.screenshot({
    path: '.local/guardians-mobile.png',
    fullPage: true,
    animations: 'disabled',
  });
  await page.getByRole('button', { name: 'Practise in ShieldQuest City' }).click();
  await expect(page.getByRole('heading', { name: 'ShieldQuest City', exact: true })).toBeVisible();
});
