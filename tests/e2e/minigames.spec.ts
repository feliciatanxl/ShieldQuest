import { test, expect, type Page } from '@playwright/test';

async function openDistrictRoute(page: Page, name: string) {
  if (page.url() === 'about:blank') {
    await page.goto('/');
  }
  await page.getByRole('button', { name: new RegExp(`Open ${name}, Chapter`) }).click();
  const explore = page.getByRole('button', { name: 'Explore district', exact: true });
  if (await explore.isVisible()) await explore.click();
  const routeLink = page.getByRole('link', { name: 'Open the full district route' });
  if (await routeLink.isVisible()) {
    await routeLink.click();
  }
}

test.describe('Mini-games', () => {
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
  });

  test('Mini-game A: Word Search (Spot the Warning Signs) full play, transfer, and reward claim', async ({
    page,
  }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));

    await openDistrictRoute(page, 'Digi-District');

    // Click Spot the Warning Signs
    await page.getByRole('link', { name: /Spot the Warning Signs/ }).click();

    // Check header and instruction
    await expect(page.getByRole('heading', { name: 'Spot the Warning Signs' })).toBeVisible();
    await expect(page.getByText('Warning signs found')).toBeVisible();

    await page.screenshot({
      path: '.local/wordsearch-desktop.png',
      animations: 'disabled',
      fullPage: true,
    });

    // Test "How to play" toggle
    await page.getByRole('button', { name: 'How to play' }).click();
    await expect(page.locator('#ws-how-to')).toBeVisible();

    // Solve word 1: URGENCY (row 7, col 0 to col 6)
    await page.locator('[data-cell="7:0"]').click();
    await page.locator('[data-cell="7:6"]').click();
    await expect(page.getByText(/URGENCY found/)).toBeVisible();

    // Solve word 2: ACCOUNT (row 0, col 0 to row 6, col 0)
    await page.locator('[data-cell="0:0"]').click();
    await page.locator('[data-cell="6:0"]').click();
    await expect(page.getByText(/ACCOUNT found/)).toBeVisible();

    // Solve word 3: TRANSFER (row 6, col 0 to row 6, col 7)
    await page.locator('[data-cell="6:0"]').click();
    await page.locator('[data-cell="6:7"]').click();
    await expect(page.getByText(/TRANSFER found/)).toBeVisible();

    // Solve word 4: PASSWORD (row 0, col 7 to row 7, col 7)
    await page.locator('[data-cell="0:7"]').click();
    await page.locator('[data-cell="7:7"]').click();
    await expect(page.getByText(/PASSWORD found/)).toBeVisible();

    // Solve word 5: DARE (row 5, col 3 to row 2, col 6)
    await page.locator('[data-cell="5:3"]').click();
    await page.locator('[data-cell="2:6"]').click();
    await expect(page.getByText(/DARE found/)).toBeVisible();

    // Solve word 6: VERIFY (row 2, col 1 to row 7, col 6)
    await page.locator('[data-cell="2:1"]').click();
    await page.locator('[data-cell="7:6"]').click();
    await expect(page.getByText(/VERIFY found/)).toBeVisible();

    // All 6 found, transfer question appears
    await expect(page.getByRole('button', { name: /Found 6 \/ 6/ })).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'Which warning sign appeared in the Easy Money scenario?' }),
    ).toBeVisible();

    // Answer transfer question
    await page.getByRole('button', { name: /A deadline/ }).click();
    await expect(page.getByText(/“Need your answer tonight” is urgency/)).toBeVisible();

    // Claim progress
    const claimBtn = page.getByRole('button', { name: 'Claim your progress' });
    await expect(claimBtn).toBeVisible();
    await claimBtn.click();

    // VeriFox met & 25 Shield Tokens awarded
    await expect(page.getByText('Shield Tokens +25')).toBeVisible();
    await expect(page.getByText(/VeriFox met/)).toBeVisible();

    await page.screenshot({
      path: '.local/minigame-complete-desktop.png',
      animations: 'disabled',
      fullPage: true,
    });

    // Return to city
    await page.getByRole('link', { name: 'Return to city' }).click();
    await expect(page.getByText('1/12 activities', { exact: false })).toBeVisible();

    expect(errors).toEqual([]);
  });

  test('Mini-game B: Decode the Clue (guesses, signal meter, retry, rounds)', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));

    // Complete 1 activity in Digi-District first (Spot the Warning Signs) to unlock Decode the Clue
    await openDistrictRoute(page, 'Digi-District');
    await page.getByRole('link', { name: /Spot the Warning Signs/ }).click();

    // Fast solve all 6
    await page.locator('[data-cell="7:0"]').click();
    await page.locator('[data-cell="7:6"]').click();
    await page.locator('[data-cell="0:0"]').click();
    await page.locator('[data-cell="6:0"]').click();
    await page.locator('[data-cell="6:0"]').click();
    await page.locator('[data-cell="6:7"]').click();
    await page.locator('[data-cell="0:7"]').click();
    await page.locator('[data-cell="7:7"]').click();
    await page.locator('[data-cell="5:3"]').click();
    await page.locator('[data-cell="2:6"]').click();
    await page.locator('[data-cell="2:1"]').click();
    await page.locator('[data-cell="7:6"]').click();
    await page.getByRole('button', { name: /A deadline/ }).click();
    await page.getByRole('button', { name: 'Claim your progress' }).click();
    await page.getByRole('link', { name: 'Back to the district' }).last().click();

    // Dismiss Guardian meeting dialog for VeriFox if present
    const continueBtn = page.getByRole('dialog').getByRole('button', { name: 'Continue', exact: true });
    if (await continueBtn.isVisible()) {
      await continueBtn.click();
    }

    // Decode the Clue is now unlocked
    const decodeLink = page.getByRole('link', { name: /Decode the Clue/ });
    await expect(decodeLink).toBeVisible();
    await decodeLink.click();

    // Check title and signal meter
    await expect(page.getByRole('heading', { name: 'Decode the Clue' })).toBeVisible();
    await expect(page.getByText('5 of 5 attempts left')).toBeVisible();

    await page.screenshot({
      path: '.local/decode-desktop.png',
      animations: 'disabled',
      fullPage: true,
    });

    // Try a wrong guess 'Z'
    await page.getByRole('button', { name: 'Guess Z' }).click();
    await expect(page.getByText('4 of 5 attempts left')).toBeVisible();

    // Guess remaining letters for VERIFY: V, E, R, I, F, Y
    for (const letter of ['V', 'E', 'R', 'I', 'F', 'Y']) {
      await page.getByRole('button', { name: `Guess ${letter}` }).click();
    }

    // Round 1 solved
    await expect(page.getByText('VERIFY decoded')).toBeVisible();
    const nextClueBtn = page.getByRole('button', { name: 'Next clue' });
    await expect(nextClueBtn).toBeVisible();
    await nextClueBtn.click();

    // Round 2: PRESSURE
    await expect(page.getByText('Clue 2 of 2')).toBeVisible();
    for (const letter of ['P', 'R', 'E', 'S', 'U']) {
      await page.getByRole('button', { name: `Guess ${letter}` }).click();
    }

    // Solved completely
    await expect(page.getByText('PRESSURE decoded')).toBeVisible();
    await page.getByRole('button', { name: 'Claim your progress' }).click();
    await expect(page.getByText('Shield Tokens +25')).toBeVisible();
    await expect(page.getByText(/Echo met/)).toBeVisible();

    expect(errors).toEqual([]);
  });

  test('Mini-game C: Risk or Safe? card evaluation, transfer question, and replay', async ({
    page,
  }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));

    await openDistrictRoute(page, 'School Street');
    await page.getByRole('link', { name: /Risk or Safe\?/ }).click();

    await expect(page.getByRole('heading', { name: 'Risk or Safe?' })).toBeVisible();
    await expect(page.getByText('Request 1 of 6')).toBeVisible();

    // Card 1: Mule (Risky)
    await page.getByRole('button', { name: 'Risky' }).click();
    await expect(page.getByText(/You called it risky/)).toBeVisible();
    await page.getByRole('button', { name: 'Next request' }).click();

    // Card 2: School portal (Safe)
    await page.getByRole('button', { name: 'Safe' }).click();
    await expect(page.getByText(/You called it safe/)).toBeVisible();
    await page.getByRole('button', { name: 'Next request' }).click();

    // Card 3: Job (Risky)
    await page.getByRole('button', { name: 'Risky' }).click();
    await page.getByRole('button', { name: 'Next request' }).click();

    // Card 4: Link (Risky)
    await page.getByRole('button', { name: 'Risky' }).click();
    await page.getByRole('button', { name: 'Next request' }).click();

    // Card 5: Seller (Risky)
    await page.getByRole('button', { name: 'Risky' }).click();
    await page.getByRole('button', { name: 'Next request' }).click();

    // Card 6: Friend (Safe)
    await page.getByRole('button', { name: 'Safe' }).click();

    // Summary & Transfer question
    await expect(page.getByText('Called as intended')).toBeVisible();

    await page.getByRole('button', { name: /Whether it needed your account/ }).click();
    await expect(page.getByText(/Spelling and profile photos are easy to fix/)).toBeVisible();

    // Claim progress
    await page.getByRole('button', { name: 'Claim your progress' }).click();
    await expect(page.getByText('Shield Tokens +25')).toBeVisible();
    await expect(page.getByText(/ByteBuddy met/)).toBeVisible();

    // Test Play again (Replay)
    await page.getByRole('button', { name: 'Play again' }).click();
    await expect(page.getByText('Request 1 of 6')).toBeVisible();

    expect(errors).toEqual([]);
  });

  test('Mini-game D: Clue Match (wrong attempt handling and pairs pairing)', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));

    await openDistrictRoute(page, 'Retail District');
    await page.getByRole('link', { name: /Clue Match/ }).click();

    await expect(page.getByRole('heading', { name: 'Clue Match' })).toBeVisible();

    // Select first prompt
    await page.getByRole('button', { name: /Answer tonight or the offer is gone/ }).click();

    // Select WRONG match: E-commerce scam
    await page.getByRole('button', { name: 'E-commerce scam' }).click();
    await expect(page.getByText(/Not that one/)).toBeVisible();

    // Select prompt again and correct match: Money mule recruitment
    await page.getByRole('button', { name: /Answer tonight or the offer is gone/ }).click();
    await page.getByRole('button', { name: 'Money mule recruitment' }).click();
    await expect(page.getByText('What you connected')).toBeVisible();

    // Pair remaining 5
    // 2. Offplatform -> E-commerce scam
    await page.getByRole('button', { name: /Pay me directly/ }).click();
    await page.getByRole('button', { name: 'E-commerce scam' }).click();

    // 3. No interview -> Job scam
    await page.getByRole('button', { name: /No experience, no interview/ }).click();
    await page.getByRole('button', { name: 'Job scam' }).click();

    // 4. Link -> Phishing link
    await page.getByRole('button', { name: /Your account is suspended/ }).click();
    await page.getByRole('button', { name: 'Phishing link' }).click();

    // 5. Voice -> Impersonation
    await page.getByRole('button', { name: /It is me, I lost my phone/ }).click();
    await page.getByRole('button', { name: 'Impersonation' }).click();

    // 6. Nobody -> Peer dare in a shop
    await page.getByRole('button', { name: /Nobody is watching, just do it/ }).click();
    await page.getByRole('button', { name: 'Peer dare in a shop' }).click();

    // Transfer question
    await expect(
      page.getByRole('heading', { name: 'What do all six of those warning signs have in common?' }),
    ).toBeVisible();
    await page.getByRole('button', { name: /Each one removes a step/ }).click();

    // Claim progress
    await page.getByRole('button', { name: 'Claim your progress' }).click();
    await expect(page.getByText('Shield Tokens +25')).toBeVisible();
    await expect(page.getByText(/Cluepaw met/)).toBeVisible();

    expect(errors).toEqual([]);
  });

  test('Mini-game E: Who Can Help? and Mini-game F: What Happens Next?', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));

    await openDistrictRoute(page, 'Community Hub');

    // Who Can Help? is OPEN
    await page.getByRole('link', { name: /Who Can Help\?/ }).click();
    await expect(page.getByRole('heading', { name: 'Who Can Help?' })).toBeVisible();

    // Check pairs rendering
    await expect(page.getByText('Situation', { exact: true })).toBeVisible();
    await expect(page.getByText('Who fits', { exact: true })).toBeVisible();

    // Pair 1: unsure -> Someone you trust
    await page.getByRole('button', { name: /A message feels off/ }).click();
    await page.getByRole('button', { name: 'Someone you trust, before you reply' }).click();
    await expect(page.getByText('What you connected')).toBeVisible();

    // Pair 2: friend -> A trusted adult
    await page.getByRole('button', { name: /A friend has already sent/ }).click();
    await page.getByRole('button', { name: 'A trusted adult, now rather than later' }).click();

    // Pair 3: school -> A teacher or school counsellor
    await page.getByRole('button', { name: /Someone at school keeps pressuring/ }).click();
    await page.getByRole('button', { name: 'A teacher or school counsellor' }).click();

    // Pair 4: account -> The service itself
    await page.getByRole('button', { name: /You think someone else has got/ }).click();
    await page.getByRole('button', { name: 'The service itself, through the app you already use' }).click();

    // Pair 5: unsafe -> An adult who is near you
    await page.getByRole('button', { name: /You feel unsafe right now/ }).click();
    await page.getByRole('button', { name: 'An adult who is near you' }).click();

    // Transfer question
    await page.getByRole('button', { name: /How far it has already gone/ }).click();
    await page.getByRole('button', { name: 'Claim your progress' }).click();
    await expect(page.getByText('Shield Tokens +25')).toBeVisible();
    await expect(page.getByText(/Beacon met/)).toBeVisible();

    // Now return to district and complete Jayden's Offer to unlock What Happens Next (requires 2 completed)
    await page.getByRole('link', { name: 'Back to the district' }).last().click();

    // Dismiss Beacon met dialog if present
    const continueBtn = page.getByRole('dialog').getByRole('button', { name: 'Continue', exact: true });
    if (await continueBtn.isVisible()) {
      await continueBtn.click();
    }

    await page.getByRole('link', { name: /Jayden's Offer/ }).click();
    await page.getByRole('button', { name: /^Warn them privately/ }).click();
    await page.getByRole('button', { name: 'Finish mission', exact: true }).click();
    const complete = page.getByRole('dialog', { name: 'Mission complete' });
    await complete.getByRole('link', { name: 'Return to city' }).click();

    // Dismiss Shieldfin met dialog if present
    const continueBtn2 = page.getByRole('dialog').getByRole('button', { name: 'Continue', exact: true });
    if (await continueBtn2.isVisible()) {
      await continueBtn2.click();
    }

    // Return to Community Hub district
    await openDistrictRoute(page, 'Community Hub');

    // Now What Happens Next is unlocked!
    const whatNextLink = page.getByRole('link', { name: /What Happens Next\?/ });
    await expect(whatNextLink).toBeVisible();
    await whatNextLink.click();

    await expect(page.getByRole('heading', { name: 'What Happens Next?' })).toBeVisible();
    await expect(page.getByText('Situation 1 of 4')).toBeVisible();
    await expect(page.getByText('+S$300, paid within the hour')).toBeVisible();

    // Answer round 1
    await page.getByRole('button', { name: /Her account is restricted/ }).click();
    await expect(page.getByText('That is what follows')).toBeVisible();
    await page.getByRole('button', { name: 'Next situation' }).click();

    // Answer round 2
    await expect(page.getByText('Situation 2 of 4')).toBeVisible();
    await page.getByRole('button', { name: /The login is used or resold/ }).click();
    await page.getByRole('button', { name: 'Next situation' }).click();

    // Answer round 3
    await expect(page.getByText('Situation 3 of 4')).toBeVisible();
    await page.getByRole('button', { name: /The seller stops replying/ }).click();
    await page.getByRole('button', { name: 'Next situation' }).click();

    // Answer round 4
    await expect(page.getByText('Situation 4 of 4')).toBeVisible();
    await page.getByRole('button', { name: /His friend gets a way to step back/ }).click();

    // Claim progress
    await page.getByRole('button', { name: 'Claim your progress' }).click();
    await expect(page.getByText('Shield Tokens +25')).toBeVisible();

    expect(errors).toEqual([]);
  });

  test('Unknown mini-game ID renders friendly 404 state with Return to City button', async ({
    page,
  }) => {
    await page.goto('/#/mini-game/nonexistent-game-id');
    await expect(page.getByRole('heading', { name: 'Activity not found' })).toBeVisible();
    await expect(page.getByText('This mini-game is not part of the prototype yet.')).toBeVisible();
    const backLink = page.getByRole('link', { name: 'Back to the city' });
    await expect(backLink).toBeVisible();
    await backLink.click();
    await expect(page.getByText('Mission previews · Progress lasts for this visit')).toBeVisible();
  });

  test('Mobile viewport responsiveness (375x667)', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await openDistrictRoute(page, 'School Street');
    await page.getByRole('link', { name: /Risk or Safe\?/ }).click();

    await expect(page.getByRole('heading', { name: 'Risk or Safe?' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Risky' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Safe' })).toBeVisible();

    await page.screenshot({
      path: '.local/risk-safe-mobile.png',
      animations: 'disabled',
      fullPage: true,
    });
  });
});
