import type { SituationCard } from '../types.ts';

/**
 * Situation cards — the short beats between full missions.
 *
 * A board turn that resolves to nothing is a turn the player learns nothing
 * from, so every non-mission space still asks for one decision. These are
 * deliberately small: one paragraph, two or three options, feedback in a
 * sentence. They carry rhythm, not curriculum.
 *
 * They are drawn, not rolled for outcome. The card that appears is chance; what
 * it costs is entirely the player's choice, which keeps the Guardian rule
 * intact — progress is only ever earned by a decision.
 */
export const SITUATION_CARDS: SituationCard[] = [
  {
    id: 'sit_otp',
    title: 'A code you did not ask for',
    body: 'A six-digit code arrives by SMS. Seconds later someone messages: "Sorry! Sent you my code by accident — can you forward it?"',
    competency: 'SPOT',
    bands: ['B10_13', 'B14_16', 'B17_24'],
    options: [
      {
        id: 'otp_send',
        label: 'Forward the code',
        outcome: 'RISKY',
        deltas: { coins: 40, trust: -12, risk: 15 },
        feedback:
          'A code sent to your phone belongs to your account, not theirs. Forwarding it is what completes their login.',
      },
      {
        id: 'otp_ignore',
        label: 'Ignore and delete',
        outcome: 'SAFE',
        deltas: { coins: 30, trust: 6, risk: -5 },
        feedback:
          'Nothing genuine is lost by ignoring it. A code you did not request means someone is trying to get in somewhere.',
        guardianId: 'verifox',
      },
      {
        id: 'otp_secure',
        label: 'Ignore it and change your password',
        outcome: 'SAFE',
        deltas: { coins: 35, trust: 10, risk: -10 },
        feedback:
          'Right instinct: the code reaching you at all means someone already has your number or your email in front of them.',
        guardianId: 'bytebuddy',
      },
    ],
  },
  {
    id: 'sit_login_share',
    title: 'Lend me your login',
    body: 'A classmate wants your streaming login "just for the weekend". The same password opens your email.',
    competency: 'EVALUATE',
    bands: ['B10_13', 'B14_16'],
    options: [
      {
        id: 'ls_share',
        label: 'Share it',
        outcome: 'RISKY',
        deltas: { coins: 35, trust: -10, risk: 12 },
        feedback:
          'A password is not one door. Reusing it means lending far more than the thing you meant to lend.',
      },
      {
        id: 'ls_no',
        label: 'Say no',
        outcome: 'SAFE',
        deltas: { coins: 30, trust: 8 },
        feedback: 'Accounts in your name stay your responsibility, whoever is using them.',
        guardianId: 'bytebuddy',
      },
    ],
  },
  {
    id: 'sit_link',
    title: 'Parcel on hold',
    body: 'A text says a delivery is waiting and a small fee is due. The link looks almost right — one letter is different.',
    competency: 'SPOT',
    bands: ['B10_13', 'B14_16', 'B17_24'],
    options: [
      {
        id: 'lk_pay',
        label: 'Pay the fee',
        outcome: 'RISKY',
        deltas: { coins: 45, trust: -14, risk: 18 },
        feedback:
          'The page collected card details rather than a fee. The near-miss spelling is the whole trick.',
      },
      {
        id: 'lk_app',
        label: 'Check in the real app',
        outcome: 'SAFE',
        deltas: { coins: 35, trust: 8, risk: -6 },
        feedback:
          'Opening the courier app yourself takes ten seconds and cannot be redirected by anyone.',
        guardianId: 'verifox',
      },
    ],
  },
  {
    id: 'sit_countdown',
    title: 'Offer ends in 4 minutes',
    body: 'A giveaway page has a countdown timer, and it resets every time you reload it.',
    competency: 'HOLD',
    bands: ['B10_13', 'B14_16'],
    options: [
      {
        id: 'cd_enter',
        label: 'Enter quickly',
        outcome: 'RISKY',
        deltas: { coins: 30, trust: -8, risk: 10 },
        feedback: 'The timer is decoration. It exists to stop you noticing the rest of the page.',
      },
      {
        id: 'cd_reload',
        label: 'Reload and watch the timer',
        outcome: 'SAFE',
        deltas: { coins: 35, trust: 8 },
        feedback: 'A deadline that resets was never a deadline. Testing it cost you nothing.',
        guardianId: 'echo',
      },
    ],
  },
  {
    id: 'sit_group_photo',
    title: 'A photo of someone else',
    body: 'Someone posts an unflattering photo of a classmate in the group chat. It is getting replies.',
    competency: 'DEFEND',
    bands: ['B10_13', 'B14_16'],
    options: [
      {
        id: 'gp_join',
        label: 'Add a reply',
        outcome: 'RISKY',
        deltas: { coins: 25, trust: -12, resilience: -10 },
        feedback:
          'Every reply makes the post worth posting. The person in the photo did not choose to be there.',
      },
      {
        id: 'gp_dm',
        label: 'Message the classmate',
        outcome: 'SAFE',
        deltas: { coins: 30, resilience: 18, trust: 8 },
        feedback:
          'Checking on the person in the photo is the part almost nobody does, and it matters more than the thread does.',
        guardianId: 'shieldfin',
      },
      {
        id: 'gp_ask',
        label: 'Ask for it to be taken down',
        outcome: 'SAFE',
        deltas: { coins: 30, resilience: 14, trust: 10 },
        feedback:
          'One person objecting changes what the rest of the group thinks is acceptable to reply to.',
        guardianId: 'beacon',
      },
    ],
  },
  {
    id: 'sit_friend_request',
    title: 'Someone you already know',
    body: 'A friend request arrives from an account with your friend’s photo and name. You are already friends with them.',
    competency: 'IDENTIFY',
    bands: ['B10_13', 'B14_16', 'B17_24'],
    options: [
      {
        id: 'fr_accept',
        label: 'Accept it',
        outcome: 'RISKY',
        deltas: { coins: 30, trust: -10, risk: 12 },
        feedback:
          'A duplicate account usually means someone copied a real profile to reach that person’s friends.',
      },
      {
        id: 'fr_check',
        label: 'Message your friend on the old account',
        outcome: 'SAFE',
        deltas: { coins: 35, trust: 8, risk: -6 },
        feedback:
          'Checking through the account you already trust is faster than working out which one is real.',
        guardianId: 'cluepaw',
      },
    ],
  },
  {
    id: 'sit_invite',
    title: 'A lift you did not plan',
    body: 'Someone you met online once offers to pick you up after school to "talk about the job".',
    competency: 'LEAD',
    bands: ['B10_13', 'B14_16'],
    options: [
      {
        id: 'iv_go',
        label: 'Go, but tell nobody',
        outcome: 'RISKY',
        deltas: { coins: 40, trust: -15, risk: 20 },
        feedback:
          'Meeting alone and unannounced removes every safety net at once. The secrecy is the request that matters.',
      },
      {
        id: 'iv_tell',
        label: 'Decline and tell an adult you trust',
        outcome: 'SAFE',
        deltas: { coins: 40, trust: 12, resilience: 10, risk: -10 },
        feedback:
          'Telling someone is not overreacting. It is the step that makes everything after it easier.',
        guardianId: 'beacon',
      },
    ],
  },
  {
    id: 'sit_screenshot',
    title: 'Proof, apparently',
    body: 'A seller sends screenshots of other happy buyers to prove the deal is genuine.',
    competency: 'SPOT',
    bands: ['B14_16', 'B17_24'],
    options: [
      {
        id: 'ss_trust',
        label: 'Take it as proof',
        outcome: 'RISKY',
        deltas: { coins: 35, trust: -10, risk: 12 },
        feedback:
          'Information supplied by the person asking you to trust them is not independent verification.',
      },
      {
        id: 'ss_verify',
        label: 'Check outside the chat',
        outcome: 'SAFE',
        deltas: { coins: 35, trust: 8, risk: -6 },
        feedback:
          'Verification only counts when it comes from a source the other person does not control.',
        guardianId: 'verifox',
      },
    ],
  },
];

/**
 * Clue cards — one question, four signals, pick the one that does not belong.
 *
 * These sit on Clue spaces and practise SPOT and IDENTIFY specifically. They
 * are the fastest thing on the board: roughly fifteen seconds.
 */
export const CLUE_CARDS: SituationCard[] = [
  {
    id: 'clue_urgency',
    title: 'Which one is the warning sign?',
    body: 'A message offers you money for a small favour. Which detail is the signal that this is a recruitment attempt?',
    competency: 'SPOT',
    bands: ['B14_16', 'B17_24'],
    options: [
      {
        id: 'cu_a',
        label: 'They used your first name',
        outcome: 'CAUTIOUS',
        deltas: { coins: 10 },
        feedback:
          'Names are easy to find and easy to guess. It is neither reassuring nor a warning sign on its own.',
      },
      {
        id: 'cu_b',
        label: 'The payment is for using your account',
        outcome: 'SAFE',
        deltas: { coins: 30, trust: 6 },
        feedback:
          'That is the one. Money offered for access to your account is the definition of the request, not a detail of it.',
        guardianId: 'verifox',
      },
      {
        id: 'cu_c',
        label: 'The message had a typo',
        outcome: 'CAUTIOUS',
        deltas: { coins: 10 },
        feedback:
          'Typos are a weak signal — plenty of genuine messages have them and plenty of scams do not.',
      },
    ],
  },
  {
    id: 'clue_pressure',
    title: 'Where is the pressure coming from?',
    body: 'A friend keeps asking you to decide "right now". Which of these is the pressure actually doing?',
    competency: 'IDENTIFY',
    bands: ['B10_13', 'B14_16', 'B17_24'],
    options: [
      {
        id: 'cp_a',
        label: 'Stopping you checking with anyone else',
        outcome: 'SAFE',
        deltas: { coins: 30, trust: 6 },
        feedback:
          'Exactly. Urgency is almost always aimed at the step where you would have asked someone.',
        guardianId: 'cluepaw',
      },
      {
        id: 'cp_b',
        label: 'Showing how much they trust you',
        outcome: 'CAUTIOUS',
        deltas: { coins: 10 },
        feedback:
          'It can feel that way, which is why it works. Trust does not usually come with a countdown.',
      },
    ],
  },
  {
    id: 'clue_report',
    title: 'Who would you tell?',
    body: 'Something online has made you uneasy and you are not sure it is "serious enough". What is the best first move?',
    competency: 'LEAD',
    bands: ['B10_13', 'B14_16', 'B17_24'],
    options: [
      {
        id: 'cr_a',
        label: 'Wait until you are certain',
        outcome: 'CAUTIOUS',
        deltas: { coins: 10 },
        feedback:
          'Waiting for certainty is how most situations get bigger. You do not need proof to ask a question.',
      },
      {
        id: 'cr_b',
        label: 'Tell an adult you trust what happened',
        outcome: 'SAFE',
        deltas: { coins: 30, trust: 8, resilience: 8 },
        feedback:
          'Describing it to someone you trust is a complete first step. They can help you work out whether anything more is needed.',
        guardianId: 'beacon',
      },
    ],
  },
];
