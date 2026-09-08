import { test, expect } from '@playwright/test';

test.describe('Admin Dashboard & Scenario Portal', () => {
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
  });

  test('Overview tab displays portal summary, needs attention, and recent content', async ({
    page,
  }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));

    await page.goto('/');
    await page.getByRole('button', { name: 'Admin Portal', exact: true }).click();

    // Verify main header and admin badge
    await expect(page.getByRole('heading', { name: 'Scenario Management Portal', exact: true })).toBeVisible();
    await expect(page.getByText('Admin Console View', { exact: true })).toBeVisible();

    // Verify 4 overview metrics
    await expect(page.getByText('Active scenarios', { exact: true })).toBeVisible();
    await expect(page.getByText('Demonstration participants', { exact: true })).toBeVisible();
    await expect(page.getByText('Average safe decision rate', { exact: true })).toBeVisible();
    await expect(page.getByText('Content needing review', { exact: true })).toBeVisible();

    // Verify Needs attention section
    await expect(page.getByRole('heading', { name: 'Needs attention', exact: true })).toBeVisible();

    // Verify Recent content section
    await expect(page.getByRole('heading', { name: 'Recent content', exact: true })).toBeVisible();

    // Screenshot overview
    await page.screenshot({
      path: '.local/admin-overview-desktop.png',
      animations: 'disabled',
      fullPage: true,
    });

    expect(errors).toEqual([]);
  });

  test('Scenario Library filters by search query and row click opens Detail Panel', async ({
    page,
  }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));

    await page.goto('/');
    await page.getByRole('button', { name: 'Admin Portal', exact: true }).click();

    // Navigate to Scenario Library
    await page.getByRole('button', { name: 'Scenario Library', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Scenario Library' })).toBeVisible();

    // Verify search filtering
    const searchInput = page.getByPlaceholder('Title, category or audience');
    await searchInput.fill('Checkout');
    await expect(page.getByText('The Dare at Checkout')).toBeVisible();
    await expect(page.getByText('Showing 1 of')).toBeVisible();

    // Clear filters
    await page.getByRole('button', { name: 'Clear filters' }).click();
    await expect(page.getByText(/Showing \d+ of \d+/)).toBeVisible();

    // Open Scenario Detail panel
    await page.getByRole('button', { name: 'Easy Money? — open scenario details' }).click();
    const detailDrawer = page.getByRole('dialog');
    await expect(detailDrawer).toBeVisible();
    await expect(detailDrawer.getByRole('heading', { name: 'Easy Money?' })).toBeVisible();
    await expect(detailDrawer.getByText('Intended learning objective')).toBeVisible();
    await expect(detailDrawer.getByText('S.H.I.E.L.D. competencies practised')).toBeVisible();

    // Screenshot library with drawer open
    await page.screenshot({
      path: '.local/admin-library-desktop.png',
      animations: 'disabled',
      fullPage: true,
    });

    // Close detail drawer
    await page.keyboard.press('Escape');
    await expect(detailDrawer).toHaveCount(0);

    expect(errors).toEqual([]);
  });

  test('Deploy Flash Mission composer publishes scenario into library', async ({
    page,
  }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));

    await page.goto('/');
    await page.getByRole('button', { name: 'Admin Portal', exact: true }).click();

    // Open Deploy Flash Mission
    await page.getByRole('button', { name: 'Deploy Flash Mission' }).click();
    const modal = page.getByRole('dialog');
    await expect(modal.getByRole('heading', { name: 'Deploy Flash Mission' })).toBeVisible();

    // Fill title
    const titleInput = modal.getByLabel('Mission title');
    await titleInput.fill('Test Flash Courier Scam');

    // Submit deployment
    await modal.getByRole('button', { name: 'Deploy Flash Mission' }).click();

    // Verify confirmation state
    await expect(modal.getByRole('heading', { name: 'Flash Mission deployed live' })).toBeVisible();
    await expect(modal.getByText('Test Flash Courier Scam')).toBeVisible();

    // Screenshot confirmation
    await page.screenshot({
      path: '.local/admin-flash-deployed.png',
      animations: 'disabled',
      fullPage: true,
    });

    // Return to library
    await modal.getByRole('button', { name: 'View in Scenario Library' }).click();
    await expect(modal).toHaveCount(0);
    await expect(page.getByRole('button', { name: /Test Flash Courier Scam/ })).toBeVisible();

    expect(errors).toEqual([]);
  });

  test('Youth-Created Missions moderation: reviewing and converting adds draft to library', async ({
    page,
  }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));

    await page.goto('/');
    await page.getByRole('button', { name: 'Admin Portal', exact: true }).click();

    // Navigate to Youth-Created Missions
    await page.getByRole('button', { name: 'Youth-Created Missions' }).click();
    await expect(page.getByRole('heading', { name: 'Youth-Created Missions' })).toBeVisible();
    await expect(page.getByText('Youth moderation pipeline')).toBeVisible();

    // Open submission drawer
    await page.getByRole('button', { name: /The Study Group That Wanted My Login/ }).click();
    const youthDrawer = page.getByRole('dialog');
    await expect(youthDrawer).toBeVisible();
    await expect(youthDrawer.getByRole('heading', { name: 'The Study Group That Wanted My Login' })).toBeVisible();
    await expect(youthDrawer.getByText('Safeguarding points to weigh')).toBeVisible();
    await expect(youthDrawer.getByText('Reviewer checklist')).toBeVisible();

    // Screenshot youth moderation drawer
    await page.screenshot({
      path: '.local/admin-youth-moderation.png',
      animations: 'disabled',
      fullPage: true,
    });

    // Convert to scenario draft
    await youthDrawer.getByRole('button', { name: 'Convert to scenario draft' }).click();
    await expect(youthDrawer).toHaveCount(0);

    // Verify converted status chip in queue
    await expect(page.getByText('Converted to scenario draft').first()).toBeVisible();

    // Verify draft appears in Scenario Library
    await page.getByRole('button', { name: 'Scenario Library' }).click();
    await expect(page.getByText('The Study Group That Wanted My Login')).toBeVisible();

    expect(errors).toEqual([]);
  });

  test('Insights tab renders signals, engagement KPIs, pilot framework, and skill coverage', async ({
    page,
  }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));

    await page.goto('/');
    await page.getByRole('button', { name: 'Admin Portal', exact: true }).click();

    // Navigate to Insights
    await page.getByRole('button', { name: 'Insights' }).click();
    await expect(page.getByRole('heading', { name: 'Insights' })).toBeVisible();

    // Verify Think · Vote · Explain aggregate signals
    await expect(page.getByRole('heading', { name: 'Think · Vote · Explain' })).toBeVisible();
    await expect(page.getByText('Simulated facilitated sessions')).toBeVisible();
    await expect(page.getByText('The Group Chat Job — what should the group do?')).toBeVisible();

    // Verify Engagement KPI 6
    await expect(page.getByRole('heading', { name: 'Engagement', level: 2 })).toBeVisible();
    await expect(page.getByText('Session completion', { exact: true })).toBeVisible();
    await expect(page.getByText('84%')).toBeVisible();
    await expect(page.getByText('Voluntary replay', { exact: true })).toBeVisible();
    await expect(page.getByText('31%')).toBeVisible();

    // Verify Pilot evaluation framework
    await expect(page.getByRole('heading', { name: 'Pilot evaluation framework' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Risk Recognition' })).toBeVisible();
    await expect(page.getByText('Planned for pilot', { exact: true })).toBeVisible();

    // Verify S.H.I.E.L.D. skill coverage
    await expect(page.getByRole('heading', { name: 'S.H.I.E.L.D. skill coverage' })).toBeVisible();

    // Screenshot insights
    await page.screenshot({
      path: '.local/admin-insights-desktop.png',
      animations: 'disabled',
      fullPage: true,
    });

    // Return to youth app
    await page.getByRole('button', { name: 'Open the youth app' }).click();
    await expect(page.getByRole('heading', { name: 'Scenario Management Portal' })).toHaveCount(0);
    await expect(page.getByRole('button', { name: /Open Retail District/ })).toBeVisible();

    expect(errors).toEqual([]);
  });

  test('Mobile admin responsiveness (375x667)', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/admin');

    await expect(page.getByRole('heading', { name: 'Scenario Management Portal' })).toBeVisible();
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
    ).toBe(true);

    await page.screenshot({
      path: '.local/admin-mobile.png',
      animations: 'disabled',
      fullPage: true,
    });
  });
});
