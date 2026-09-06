import { test, expect } from '@playwright/test';

test.describe('Assessment & Progress Tracking', () => {
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
  });

  test('Reflection tab renders progress dashboard, S.H.I.E.L.D. skills, and achievements', async ({
    page,
  }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));

    await page.goto('/');
    await page.getByRole('button', { name: 'Reflection' }).click();

    // Verify main headings
    await expect(page.getByRole('heading', { name: 'What you have practised' })).toBeVisible();
    await expect(page.getByText(/0\/12\s*activities/)).toBeVisible();

    // Verify summary figures
    await expect(page.getByText('0/6', { exact: true })).toBeVisible();
    await expect(page.getByText('0/7', { exact: true })).toBeVisible();

    // Verify district list
    await expect(page.getByRole('link', { name: /School Street/ })).toBeVisible();
    await expect(page.getByRole('link', { name: /Retail District/ })).toBeVisible();
    await expect(page.getByRole('link', { name: /Digi-District/ })).toBeVisible();
    await expect(page.getByRole('link', { name: /Community Hub/ })).toBeVisible();

    // Verify S.H.I.E.L.D. skills
    await expect(page.getByText('Spot the Risk', { exact: true })).toBeVisible();
    await expect(page.getByText('Hold Before Acting', { exact: true })).toBeVisible();
    await expect(page.getByText('Identify the Influence', { exact: true })).toBeVisible();
    await expect(page.getByText('Evaluate the Consequences', { exact: true })).toBeVisible();
    await expect(page.getByText('Lead the Right Choice', { exact: true })).toBeVisible();
    await expect(page.getByText('Defend Your Community', { exact: true })).toBeVisible();

    // Verify achievements list
    await expect(page.getByText('Risk Spotter')).toBeVisible();
    await expect(page.getByText('Pause First')).toBeVisible();
    await expect(page.getByText('Peer Protector')).toBeVisible();
    await expect(page.getByText('Trusted Helper')).toBeVisible();
    await expect(page.getByText('Clear-Eyed')).toBeVisible();
    await expect(page.getByText('Account Keeper')).toBeVisible();
    await expect(page.getByText('Community Defender')).toBeVisible();

    // Verify empty completed activities note
    await expect(page.getByText('Nothing completed yet')).toBeVisible();

    // Verify privacy accordion toggle
    const privacyBtn = page.getByRole('button', { name: 'How ShieldQuest uses this' });
    await expect(privacyBtn).toBeVisible();
    await privacyBtn.click();
    await expect(page.getByText('ShieldQuest records what you have practised')).toBeVisible();

    // Screenshot desktop progress view
    await page.screenshot({
      path: '.local/progress-desktop.png',
      animations: 'disabled',
      fullPage: true,
    });

    expect(errors).toEqual([]);
  });

  test('District completion triggers sequenced celebration modal with badge and 100 Shield Tokens', async ({
    page,
  }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));

    await page.goto('/');

    // Navigate to School Street
    await page.getByRole('button', { name: /Open School Street, Chapter 1/ }).click();
    const explore = page.getByRole('button', { name: 'Explore district', exact: true });
    if (await explore.isVisible()) await explore.click();
    const routeLink = page.getByRole('link', { name: 'Open the full district route' });
    if (await routeLink.isVisible()) await routeLink.click();

    // Complete The group chat dilemma first (Activity 1 in School Street)
    await page.getByRole('link', { name: /The group chat dilemma/ }).click();
    await page.getByRole('button', { name: 'Continue to Investigate' }).click();
    await page.getByRole('button', { name: 'Continue to Discuss' }).click();
    await page.getByRole('button', { name: 'Continue to Decide' }).click();
    await page.getByRole('radio', { name: 'Pause sharing and check in with the student' }).check();
    await page.getByRole('button', { name: 'Confirm demo choice' }).click();
    await page.getByRole('button', { name: 'Continue to Protect' }).click();
    await page.getByRole('button', { name: 'Finish preview' }).click();

    // Dismiss Echo met dialog if present
    const continueBtn = page.getByRole('dialog').getByRole('button', { name: 'Continue', exact: true });
    if (await continueBtn.isVisible()) {
      await continueBtn.click();
    }

    // Open Risk or Safe? mini-game directly from the School Street district route
    await page.getByRole('link', { name: /Risk or Safe\?/ }).click();

    // Play all 6 cards
    await page.getByRole('button', { name: 'Risky' }).click();
    await page.getByRole('button', { name: 'Next request' }).click();

    await page.getByRole('button', { name: 'Safe' }).click();
    await page.getByRole('button', { name: 'Next request' }).click();

    await page.getByRole('button', { name: 'Risky' }).click();
    await page.getByRole('button', { name: 'Next request' }).click();

    await page.getByRole('button', { name: 'Safe' }).click();
    await page.getByRole('button', { name: 'Next request' }).click();

    await page.getByRole('button', { name: 'Risky' }).click();
    await page.getByRole('button', { name: 'Next request' }).click();

    await page.getByRole('button', { name: 'Safe' }).click();

    // Transfer question
    await page.getByRole('button', { name: /Whether it needed your account/ }).click();

    // Claim progress (+25 tokens)
    await page.getByRole('button', { name: 'Claim your progress' }).click();
    await expect(page.getByText('Shield Tokens +25')).toBeVisible();

    // Return to district
    await page.getByRole('link', { name: 'Back to the district' }).last().click();

    // 1. Guardian introduction goes FIRST: ByteBuddy met dialog
    const guardianDialog = page.getByRole('dialog');
    await expect(guardianDialog.getByRole('heading', { name: 'ByteBuddy', exact: true })).toBeVisible();
    await guardianDialog.getByRole('button', { name: 'Continue', exact: true }).click();

    // 2. District Complete celebration modal appears SECOND (all built activities cleared)
    const districtDialog = page.getByRole('dialog');
    await expect(districtDialog.getByRole('heading', { name: 'School Street', exact: true })).toBeVisible();
    await expect(districtDialog.getByText('District complete')).toBeVisible();
    await expect(districtDialog.getByText('Street Guardian')).toBeVisible();
    await expect(districtDialog.getByText('+100 Shield Tokens')).toBeVisible();

    // Screenshot district complete modal
    await page.screenshot({
      path: '.local/district-complete-desktop.png',
      animations: 'disabled',
      fullPage: true,
    });

    // Dismiss district complete modal
    await districtDialog.getByRole('button', { name: 'Continue exploring' }).click();

    // Navigate to Reflection
    await page.getByRole('button', { name: 'Reflection' }).click();

    // Verify district is marked cleared
    await expect(page.getByText('Cleared')).toBeVisible();

    // Verify tokens: 25 (mini-game) + 100 (district badge) = 125 tokens
    await expect(page.getByText('125', { exact: true })).toBeVisible();

    // Verify district badge earned section
    await expect(page.getByRole('heading', { name: 'District badges earned' })).toBeVisible();
    await expect(page.getByText('Street Guardian')).toBeVisible();

    // Verify completed activities includes Risk or Safe?
    await expect(page.getByText('Risk or Safe?')).toBeVisible();

    expect(errors).toEqual([]);
  });

  test('Mobile reflection page responsiveness (375x667)', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    await page
      .getByRole('navigation', { name: 'Mobile navigation' })
      .getByRole('button', { name: 'Reflection' })
      .click();

    await expect(page.getByRole('heading', { name: 'What you have practised' })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
      true,
    );

    // Screenshot mobile progress view
    await page.screenshot({
      path: '.local/progress-mobile.png',
      animations: 'disabled',
      fullPage: true,
    });
  });
});
