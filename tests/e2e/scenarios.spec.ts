import { test, expect, type Page } from '@playwright/test';
import { demoScenarios } from '../../types/demo';

async function openMission(page: Page, district = 'Digi-District', title = 'Easy Money?') {
  await page.getByRole('button', { name: new RegExp(`Open ${district}, Chapter`) }).click();
  const explore = page.getByRole('button', { name: 'Explore district', exact: true });
  if (await explore.isVisible()) await explore.click();
  await page
    .getByRole('dialog')
    .getByRole('link', { name: new RegExp(title.replace('?', '\\?')) })
    .click();
  await expect(page.getByRole('heading', { name: title, exact: true }).last()).toBeVisible();
}

test('risky reward precedes the consequence; replay and learning review preserve honest progress', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.setViewportSize({ width: 1440, height: 950 });
  await page.clock.install();
  await page.goto('/');
  await openMission(page);
  await page.getByRole('button', { name: 'Why does this seem suspicious?' }).click();
  await page.getByRole('button', { name: 'Easy money', exact: true }).click();
  await expect(page.getByRole('button', { name: '✓ Easy money' })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await page.screenshot({
    path: '.local/mission-desktop.png',
    animations: 'disabled',
    fullPage: true,
  });
  await page.getByRole('button', { name: /^Accept Share/ }).click();
  await expect(page.getByRole('dialog')).toContainText('+200');
  await expect(page.getByText('Account access restricted', { exact: true })).not.toBeVisible();
  await page.getByRole('dialog').getByRole('button', { name: 'Continue', exact: true }).click();
  await expect(page.getByText('Deal done. Nothing else happens right now.')).toBeVisible();
  await page.clock.runFor(3100);
  const consequence = page.getByRole('dialog', { name: 'Account access restricted' });
  await expect(consequence).toBeVisible();
  await expect(page.getByRole('definition')).toHaveText(['42', '53', '85']);
  for (let index = 0; index < 5; index++) {
    await page.keyboard.press(index === 0 ? 'Shift+Tab' : 'Tab');
    expect(await consequence.evaluate((element) => element.contains(document.activeElement))).toBe(
      true,
    );
  }
  await page.keyboard.press('Escape');
  await expect(consequence).toBeVisible();
  await page.screenshot({
    path: '.local/consequence-desktop.png',
    animations: 'disabled',
    fullPage: true,
  });
  await page.setViewportSize({ width: 390, height: 844 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({
    path: '.local/consequence-mobile.png',
    animations: 'disabled',
    fullPage: true,
  });
  await consequence.getByRole('button', { name: 'Continue mission' }).click();
  let complete = page.getByRole('dialog', { name: 'Mission complete' });
  await expect(complete).toContainText('1 / 4');
  await expect(complete).toContainText('+40');
  await expect(complete).not.toContainText('First meeting');
  await complete.getByRole('button', { name: 'View what I learned' }).click();
  await expect(consequence).toBeVisible();
  await consequence.getByRole('button', { name: 'Replay this decision' }).click();
  await expect(page.getByRole('definition')).toHaveText(['62', '28', '85']);
  await page.getByRole('button', { name: /^Reject & seek help/ }).click();
  await expect(page.getByText('VeriFox met — Guardian added to your roster')).toBeVisible();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await page.getByRole('button', { name: 'Finish mission', exact: true }).click();
  complete = page.getByRole('dialog', { name: 'Mission complete' });
  await expect(complete).toContainText('Already earned');
  await expect(complete).toContainText('0 / 4');
  await complete.getByRole('button', { name: 'View what I learned' }).click();
  await page.getByRole('button', { name: 'Try a different decision' }).click();
  await page.getByRole('button', { name: /^Reject & seek help/ }).click();
  await expect(page.getByText('VeriFox progress already earned — practice run')).toBeVisible();
  await page.getByRole('button', { name: 'Finish mission', exact: true }).click();
  await complete.getByRole('link', { name: 'Return to city' }).click();
  await expect(
    page.getByRole('dialog').getByRole('heading', { name: 'VeriFox', exact: true }),
  ).toBeVisible();
  await page.getByRole('dialog').getByRole('button', { name: 'Continue', exact: true }).click();
  await expect(page.getByText('1/12 activities', { exact: false })).toBeVisible();
  expect(errors).toEqual([]);
});

test('cautious choice preserves its authored debrief; desktop Peer Shield uses two columns', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 950 });
  await page.goto('/');
  await openMission(page);
  await page.getByRole('button', { name: /^Ask for proof/ }).click();
  await expect(page.getByRole('heading', { name: 'Partly there' })).toBeVisible();
  await expect(page.getByText('VeriFox met — Guardian added to your roster')).toBeVisible();
  await page.getByRole('button', { name: 'Finish mission', exact: true }).click();
  await page.getByRole('dialog').getByRole('link', { name: 'Return to city' }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Continue', exact: true }).click();
  await openMission(page, 'Community Hub', "Jayden's Offer");
  const message = await page.getByText('Group chat · 6 members', { exact: true }).boundingBox();
  const decision = await page.getByRole('button', { name: /^Ignore it/ }).boundingBox();
  expect(message && decision && decision.x > message.x + message.width).toBe(true);
  await page.screenshot({
    path: '.local/peer-desktop.png',
    animations: 'disabled',
    fullPage: true,
  });
});

test('mobile Peer Shield preserves friend context, skill-specific awards and no overflow', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await openMission(page, 'Community Hub', "Jayden's Offer");
  await page.getByRole('button', { name: 'About Peer Shield' }).click();
  await expect(
    page.getByText('In Peer Shield you are not the target.', { exact: false }),
  ).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: '.local/peer-mobile.png', animations: 'disabled', fullPage: true });
  await page.getByRole('button', { name: /^Warn them privately/ }).click();
  await expect(
    page.getByText('You challenged the risky behaviour', { exact: false }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Finish mission', exact: true }).click();
  const complete = page.getByRole('dialog', { name: 'Mission complete' });
  await expect(complete).toContainText('Shieldfin met');
  await expect(complete).toContainText('+50');
  await page.screenshot({
    path: '.local/mission-complete-mobile.png',
    animations: 'disabled',
    fullPage: true,
  });
  await complete.getByRole('button', { name: 'View what I learned' }).click();
  await page.getByRole('button', { name: 'Try a different decision' }).click();
  await page.getByRole('button', { name: /^Get appropriate help/ }).click();
  await expect(page.getByText('Beacon met — Guardian added to your roster')).toBeVisible();
  await page.getByRole('button', { name: 'Finish mission', exact: true }).click();
  await expect(complete).toContainText('Already earned');
  await complete.getByRole('link', { name: 'Return to city' }).click();
  for (const name of ['Shieldfin', 'Beacon']) {
    await expect(
      page.getByRole('dialog').getByRole('heading', { name, exact: true }),
    ).toBeVisible();
    await page.getByRole('dialog').getByRole('button', { name: 'Continue', exact: true }).click();
  }
});

test('leaving during the reward delay cancels the old takeover', async ({ page }) => {
  await page.clock.install();
  await page.goto('/');
  await openMission(page);
  await page.getByRole('button', { name: /^Accept Share/ }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Continue', exact: true }).click();
  await page.getByRole('link', { name: 'Back to Digi-District', exact: true }).click();
  await page.clock.runFor(5000);
  await expect(page.getByRole('heading', { name: 'Digi-District', exact: true })).toBeVisible();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await page.getByRole('link', { name: /Easy Money\?/ }).click();
  await expect(page.getByRole('button', { name: /^Accept Share/ })).toBeEnabled();
  await expect(page.getByRole('definition')).toHaveText(['62', '28', '85']);
});

test('API detail retries, uses current content and does not grant a Guardian for a risky sample choice', async ({
  page,
}) => {
  await page.route('**/api/scenarios/school-group-chat', (route) =>
    route.fulfill({
      status: 503,
      json: { error: { code: 'UNAVAILABLE', message: 'Mission unavailable' } },
    }),
  );
  await page.goto('/');
  await openMission(page, 'School Street', 'The group chat dilemma');
  await expect(page.getByRole('alert')).toContainText('Mission unavailable');
  const data = { ...demoScenarios[0], prompt: 'Fresh scenario detail from the server.' };
  await page.route('**/api/scenarios/school-group-chat', (route) =>
    route.fulfill({ json: { mode: 'demo', data } }),
  );
  await page.getByRole('button', { name: 'Retry mission' }).click();
  await expect(page.getByText(data.prompt)).toBeVisible();
  for (const phase of ['Investigate', 'Discuss', 'Decide'])
    await page.getByRole('button', { name: `Continue to ${phase}` }).click();
  await page.getByRole('radio', { name: 'Forward it because everyone else is doing it' }).check();
  await page.getByRole('button', { name: 'Confirm demo choice' }).click();
  await page.getByRole('button', { name: 'Continue to Protect' }).click();
  await page.getByRole('button', { name: 'Finish preview' }).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await page
    .getByRole('navigation', { name: 'Main navigation', exact: true })
    .getByRole('button', { name: 'Guardians', exact: true })
    .click();
  await expect(page.getByText('0/6', { exact: true })).toBeVisible();
});
