import type { Scenario } from './index.js';

/** Fictional examples for UI review; educator review is required before a youth pilot. */
// TODO(Choice): persist explicit qualifiedGuardian metadata with authored choices.
export const demoScenarios: Scenario[] = [
  {
    id: 'school-group-chat',
    title: 'The group chat dilemma',
    district: 'school',
    status: 'published',
    summary: 'One photo. A busy group chat. What happens next is up to you.',
    prompt:
      'A classmate posts an embarrassing photo of another student in your group chat. Everyone is being asked to forward it. What would you do?',
    clue: 'The student in the photo has not agreed to have it shared. A laughing reaction does not tell you how they feel.',
    skill: 'Empathy & speaking up',
    guardian: 'echo',
    durationMinutes: 8,
    choices: [
      {
        id: 'pause',
        qualifiedGuardian: 'echo',
        label: 'Pause sharing and check in with the student',
        reflection:
          'Pausing can prevent the photo spreading further. Checking in privately gives the student space to say what support they want.',
      },
      {
        id: 'forward',
        label: 'Forward it because everyone else is doing it',
        reflection:
          'More people now have a copy of the photo. Even without intending harm, forwarding can make the situation harder for the student.',
      },
      {
        id: 'leave',
        label: 'Leave the chat without saying anything',
        reflection:
          'Leaving stops your participation, but the photo may still spread. Who could help the student feel supported?',
      },
    ],
    nodes: [],
  },
  {
    id: 'retail-deal',
    title: 'Too good to be true?',
    district: 'retail',
    status: 'published',
    summary: 'A limited-time deal puts your detective skills to the test.',
    prompt:
      'An unfamiliar seller offers a popular game console at a huge discount. They want a deposit now, outside the marketplace. How do you respond?',
    clue: 'The account is new, the photos appear on other listings, and the seller is rushing you to pay.',
    skill: 'Spotting warning signs',
    guardian: 'cluepaw',
    durationMinutes: 7,
    choices: [
      {
        id: 'check',
        qualifiedGuardian: 'cluepaw',
        label: 'Pause and verify the seller and listing',
        reflection:
          'You notice the repeated photos before sending money. Taking time to verify can reveal warning signs.',
      },
      {
        id: 'pay',
        label: 'Pay quickly before the deal disappears',
        reflection:
          'In this fictional example, the seller stops replying after receiving the deposit. Pressure to act quickly can make warning signs easier to miss.',
      },
    ],
    nodes: [],
  },
  {
    id: 'digital-link',
    title: 'You have won… or have you?',
    district: 'digital',
    status: 'published',
    summary: 'A mystery message lands in your inbox. Look a little closer.',
    prompt:
      'A message says you have won free in-game credits. The link asks you to enter your account password. What is your next move?',
    clue: 'The web address does not match the game’s official site. You did not enter a giveaway.',
    skill: 'Checking digital sources',
    guardian: 'verifox',
    durationMinutes: 6,
    choices: [
      {
        id: 'verify',
        qualifiedGuardian: 'verifox',
        label: 'Check the offer through the official game app',
        reflection:
          'You find no matching giveaway in the official app. Checking a separate trusted source helps you assess an unexpected message.',
      },
      {
        id: 'enter',
        label: 'Enter the password to claim the credits',
        reflection:
          'In this simulation, the page takes the password and gives no credits. What clues could help you pause before sharing account details?',
      },
    ],
    nodes: [],
  },
];
