import type { Competency, Guardian, GuardianId } from '../types.ts';

/**
 * The six Guardians — one per S.H.I.E.L.D. competency.
 *
 * The mapping is one-to-one and load-bearing, not decorative. A Guardian is the
 * visible form of a prevention skill, so an activity that practises HOLD has to
 * strengthen Echo and nothing else; a Guardian grown from unrelated work would
 * stop being evidence of anything.
 *
 *   SPOT     → VeriFox    · Verification
 *   HOLD     → Echo       · Consultation
 *   IDENTIFY → Cluepaw    · Situational awareness
 *   EVALUATE → ByteBuddy  · Cyber hygiene
 *   LEAD     → Beacon     · Safe reporting
 *   DEFEND   → Shieldfin  · Peer support
 *
 * This is the roster, not a collection. All six are always listed, because the
 * roster is what explains the skill system. Whether a player has *met* one is
 * player state, earned by demonstrating the matching competency — never rolled
 * for, never bought, never in a loot box (proposal §3.2).
 */
export const GUARDIANS: Guardian[] = [
  {
    id: 'verifox',
    name: 'VeriFox',
    skill: 'Verification',
    motto: 'Check before you trust.',
    competency: 'SPOT',
    target: 6,
    description: 'Strengthens when you slow down and check who you are really dealing with.',
    greeting: 'Nobody who is telling the truth minds being checked.',
    ability: 'Checks a claim against trusted information',
    colour: '#f2ae33',
  },
  {
    id: 'echo',
    name: 'Echo',
    skill: 'Consultation',
    motto: 'Say it out loud before you act on it.',
    competency: 'HOLD',
    target: 6,
    description:
      'Strengthens when you pause under pressure and talk a request through with someone before answering it.',
    greeting: 'You still have time to pause.',
    ability: "Invites a teammate's explanation",
    colour: '#5fa0e8',
  },
  {
    id: 'cluepaw',
    name: 'Cluepaw',
    skill: 'Situational Awareness',
    motto: 'The detail that matters is already there.',
    competency: 'IDENTIFY',
    target: 6,
    description:
      'Strengthens when you read what is really going on — who benefits, who is pushing, and what is being left out.',
    greeting: 'You already noticed. Now say what you noticed.',
    ability: 'Reveals one overlooked clue',
    colour: '#d76b53',
  },
  {
    id: 'bytebuddy',
    name: 'ByteBuddy',
    skill: 'Cyber Hygiene',
    motto: 'Your account, your name, your problem.',
    competency: 'EVALUATE',
    target: 6,
    description:
      'Strengthens when you weigh what a digital request actually costs — accounts, logins, payments and the trail they leave.',
    greeting: 'The account has your name on it. That is the whole story.',
    // Condensed from the proposal's §3.2 wording, "Highlights unsafe links,
    // permissions, or data requests." It keeps all three concepts; it is
    // shorter only so it fits on one line beside the Guardian mark on the
    // public site, where it was the single ability long enough to wrap.
    ability: 'Flags unsafe links, permissions, data requests',
    colour: '#35b3a6',
  },
  {
    id: 'beacon',
    name: 'Beacon',
    skill: 'Safe Reporting',
    motto: 'Know when and where to seek help.',
    competency: 'LEAD',
    target: 6,
    description:
      'Strengthens when you step out of a situation and reach the right channel for help.',
    greeting: 'Asking for help is the move, not the last resort.',
    ability: 'Identifies a safe reporting channel',
    colour: '#8dbdf0',
  },
  {
    id: 'shieldfin',
    name: 'Shieldfin',
    skill: 'Peer Support',
    motto: 'Protect your people.',
    competency: 'DEFEND',
    target: 6,
    description: 'Strengthens when you look out for a friend without escalating the situation.',
    greeting: 'You can look out for someone without making a scene of it.',
    ability: 'Protects another player from a pressure event',
    colour: '#55bb8e',
  },
];

export const GUARDIAN_BY_ID: Record<GuardianId, Guardian> = Object.fromEntries(
  GUARDIANS.map((g) => [g.id, g]),
) as Record<GuardianId, Guardian>;

export const GUARDIAN_BY_COMPETENCY: Record<Competency, Guardian> = Object.fromEntries(
  GUARDIANS.map((g) => [g.competency, g]),
) as Record<Competency, Guardian>;

export const guardianArt = (id: GuardianId): string => `/assets/guardians/${id}-neutral.svg`;

/**
 * Plain-language meaning of each competency, written for a 14-year-old reader.
 * The public site, the player's skills panel and the facilitator debrief must
 * describe these identically — a participant who reads two different wordings
 * is being shown two different frameworks.
 */
export const COMPETENCY_MEANING: Record<Competency, string> = {
  SPOT: 'Notice the signals that a situation is not what it looks like — artificial urgency, easy money, or a request for your login.',
  HOLD: 'Put time between the pressure and your decision. A genuine opportunity still stands up after a pause.',
  IDENTIFY: 'Work out who is pushing the choice and what they stand to gain from it.',
  EVALUATE:
    'Follow the choice past the moment you make it. What does it cost in three days, three months, or on a permanent record?',
  LEAD: 'Make the choice that holds up to scrutiny, and know how to raise it through a channel you trust.',
  DEFEND:
    'Step in for someone else privately and constructively, without escalating it or shaming them.',
};
