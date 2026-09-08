import { test, expect } from '@playwright/test';

test('Think · Vote · Explain full group decision flow, simulated disclosures, role rotation, and idempotent awards', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));

  await page.setViewportSize({ width: 1440, height: 950 });
  await page.goto('/board');

  // Navigate to Digi-District
  await page.getByRole('button', { name: /Open Digi-District, Chapter 3/ }).click();
  const explore = page.getByRole('button', { name: 'Explore district', exact: true });
  if (await explore.isVisible()) await explore.click();

  // Open The Group Chat Job
  const groupNode = page.getByRole('dialog').getByRole('link', { name: /The Group Chat Job/ });
  await expect(groupNode).toBeVisible();
  await groupNode.click();

  // 1. Stage: THINK
  await expect(
    page.getByRole('heading', { name: 'The Group Chat Job', exact: true }),
  ).toBeVisible();
  await expect(page.getByText('Think privately')).toBeVisible();
  await expect(page.getByText('Evidence Checker', { exact: true })).toBeVisible();
  await expect(page.getByText('Round 1 · Facilitated role demonstration')).toBeVisible();
  await expect(page.getByText(/Group Decision Simulation/)).toBeVisible();
  // Ensure group percentages are not revealed yet
  await expect(page.getByText('Simulated Group Responses')).not.toBeVisible();

  await page.screenshot({
    path: '.local/voting-think-desktop.png',
    animations: 'disabled',
    fullPage: true,
  });

  // Proceed to vote
  await page.getByRole('button', { name: 'I have thought about it' }).click();

  // 2. Stage: VOTE (first vote)
  await expect(page.getByRole('heading', { name: 'Lock in what you would do' })).toBeVisible();
  await expect(page.getByText('Simulated Group Responses')).not.toBeVisible();
  // Select first option: Leave it
  await page.getByRole('button', { name: /Leave it — it is Jayden's business/ }).click();

  // 3. Stage: GROUP (see the room)
  await expect(page.getByRole('heading', { name: 'How the room split' })).toBeVisible();
  await expect(page.getByText('Simulated Group Responses')).toBeVisible();
  await expect(page.getByText('Demonstration only').first()).toBeVisible();
  // Option 1 has "You" marker and 34%
  await expect(page.getByText('34%')).toBeVisible();
  await expect(page.getByText('What your vote means here')).toBeVisible();

  await page.getByRole('button', { name: 'Say why' }).click();

  // 4. Stage: EXPLAIN
  await expect(page.getByRole('heading', { name: 'What was behind your vote?' })).toBeVisible();
  const compareButton = page.getByRole('button', { name: 'Compare with the room' });
  await expect(compareButton).toBeDisabled();

  // Toggle factors
  await page.getByRole('button', { name: 'He would lose face in front of the group' }).click();
  await expect(compareButton).toBeEnabled();
  await page
    .getByRole('button', { name: 'The details are already sent — this is past advice' })
    .click();

  await compareButton.click();

  // Factors revealed
  await expect(page.getByText('Simulated reasons given')).toBeVisible();
  await expect(page.getByText('Talk about it')).toBeVisible();

  await page.getByRole('button', { name: 'Decide again' }).click();

  // 5. Stage: RECONSIDER (second vote)
  await expect(page.getByRole('heading', { name: 'Now decide again' })).toBeVisible();
  await expect(page.getByText('Your first vote')).toBeVisible();

  // Select option 3: Message him privately, and bring in an adult (changed mind!)
  await page.getByRole('button', { name: /Message him privately, and bring in an adult/ }).click();

  // 6. Stage: DEBRIEF
  await expect(
    page.getByRole('heading', { name: 'The room usually gets there — after it hears itself' }),
  ).toBeVisible();
  await expect(page.getByText('You changed your mind after hearing the reasoning.')).toBeVisible();
  await expect(page.getByText('Simulated second vote')).toBeVisible();
  await expect(page.getByText('The reasons you named')).toBeVisible();
  await expect(page.getByText('What was in the situation')).toBeVisible();
  await expect(page.getByText('A safer response')).toBeVisible();

  // Rewards check: Beacon met, Shield Tokens +40
  await expect(page.getByText('Beacon met')).toBeVisible();
  await expect(page.getByText('Shield Tokens +40')).toBeVisible();

  // Roles rotate section mentions round 1 and next role Peer Supporter
  await expect(page.getByText(/You held Evidence Checker for round 1/)).toBeVisible();
  await expect(page.getByText(/Running this again hands you Peer Supporter/)).toBeVisible();

  await page.screenshot({
    path: '.local/voting-debrief-desktop.png',
    animations: 'disabled',
    fullPage: true,
  });

  // Mobile layout check
  await page.setViewportSize({ width: 390, height: 844 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );
  await page.screenshot({
    path: '.local/voting-debrief-mobile.png',
    animations: 'disabled',
    fullPage: true,
  });

  // Replay as Peer Supporter
  await page.getByRole('button', { name: /Run it again as Peer Supporter/ }).click();

  // Verifies restart brings back Stage 1 with Peer Supporter role
  await expect(page.getByText('Think privately')).toBeVisible();
  await expect(page.getByText('Peer Supporter', { exact: true })).toBeVisible();
  await expect(page.getByText('Round 2 · Facilitated role demonstration')).toBeVisible();

  // Fast-forward through second run: hold position
  await page.getByRole('button', { name: 'I have thought about it' }).click();
  await page.getByRole('button', { name: /Message him privately, and bring in an adult/ }).click();
  await page.getByRole('button', { name: 'Say why' }).click();
  await page.getByRole('button', { name: 'Waiting makes it harder to undo' }).click();
  await page.getByRole('button', { name: 'Compare with the room' }).click();
  await page.getByRole('button', { name: 'Decide again' }).click();
  await page.getByRole('button', { name: /Message him privately, and bring in an adult/ }).click();

  // Second run debrief
  await expect(page.getByText('You held your position after hearing the reasoning.')).toBeVisible();
  await expect(page.getByText('Practice run complete')).toBeVisible();
  await expect(page.getByText('Beacon progress already earned')).toBeVisible();
  await expect(page.getByText('Shield Tokens already earned')).toBeVisible();

  // Next role rotates to Safety Lead
  await expect(page.getByRole('button', { name: /Run it again as Safety Lead/ })).toBeVisible();

  // Return to district
  await page.getByRole('link', { name: 'Back to the district' }).click();

  // Acknowledge Guardian meeting if presented
  const meeting = page
    .getByRole('dialog')
    .filter({ has: page.getByRole('heading', { name: 'Beacon', exact: true }) });
  if (await meeting.isVisible()) {
    await meeting.getByRole('button', { name: 'Continue', exact: true }).click();
  }

  // Activity is now marked completed
  expect(errors).toEqual([]);
});
