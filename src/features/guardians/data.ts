import type { Guardian } from '../../../types/guardians';
// TODO(GuardianProgress): roster metadata is static; no guardian API exists. Persist earnedAt and add cumulative/grant fields before enabling server awards.

/* ------------------------------------------------------------------ */
/* Guardians                                                           */
/* ------------------------------------------------------------------ */

export const GUARDIAN_VERIFOX = 'verifox';

export const GUARDIAN_ECHO = 'echo';

export const GUARDIAN_CLUEPAW = 'cluepaw';

export const GUARDIAN_BYTEBUDDY = 'bytebuddy';

export const GUARDIAN_BEACON = 'beacon';

export const GUARDIAN_SHIELDFIN = 'shieldfin';

/**
 * The six Guardians — one per S.H.I.E.L.D. competency.
 *
 * The mapping is one-to-one and load-bearing, not decorative. A Guardian is the
 * visible form of a prevention skill, so an activity that practises HOLD has to
 * strengthen Echo and nothing else; a Guardian that grew from unrelated work
 * would stop being evidence of anything. `COMPETENCY_ORDER` is the order used
 * here and everywhere the six are listed together.
 *
 *   SPOT     → VeriFox    · Verification
 *   HOLD     → Echo       · Consultation
 *   IDENTIFY → Cluepaw    · Situational Awareness
 *   EVALUATE → ByteBuddy  · Cyber Hygiene
 *   LEAD     → Beacon     · Safe Reporting
 *   DEFEND   → Shieldfin  · Peer Support
 *
 * This is the roster, not a player's collection. All six are always listed —
 * on the public site, and in the app — because the roster explains the skill
 * system. Whether a player has *met* a Guardian is player state
 * (`PlayerProfile.metGuardians`), earned by demonstrating the matching
 * competency, and it is never rolled for, bought or granted up front.
 */

export const guardians: Guardian[] = [
  {
    id: GUARDIAN_VERIFOX,
    name: 'VeriFox',
    skill: 'Verification',
    motto: 'Check before you trust.',
    competency: 'SPOT',
    target: 6,
    description: 'Strengthens when you slow down and check who you are really dealing with.',
    greeting: 'Nobody who is telling the truth minds being checked.',
  },
  {
    id: GUARDIAN_ECHO,
    name: 'Echo',
    skill: 'Consultation',
    motto: 'Say it out loud before you act on it.',
    competency: 'HOLD',
    target: 6,
    description:
      'Strengthens when you pause under pressure and talk a request through with someone before answering it.',
    greeting: 'You still have time to pause.',
  },
  {
    id: GUARDIAN_CLUEPAW,
    name: 'Cluepaw',
    skill: 'Situational Awareness',
    motto: 'The detail that matters is already there.',
    competency: 'IDENTIFY',
    target: 6,
    description:
      'Strengthens when you read what is really going on in a situation — who benefits, who is pushing, and what is being left out.',
    greeting: 'You already noticed. Now say what you noticed.',
  },
  {
    id: GUARDIAN_BYTEBUDDY,
    name: 'ByteBuddy',
    skill: 'Cyber Hygiene',
    motto: 'Your account, your name, your problem.',
    competency: 'EVALUATE',
    target: 6,
    description:
      'Strengthens when you weigh what a digital request actually costs — accounts, logins, payments and the trail they leave.',
    greeting: 'The account has your name on it. That is the whole story.',
  },
  {
    id: GUARDIAN_BEACON,
    name: 'Beacon',
    skill: 'Safe Reporting',
    motto: 'Know when and where to seek help.',
    competency: 'LEAD',
    target: 6,
    description:
      'Strengthens when you step out of a situation and reach the right channel for help.',
    greeting: 'Asking for help is the move, not the last resort.',
  },
  {
    id: GUARDIAN_SHIELDFIN,
    name: 'Shieldfin',
    skill: 'Peer Support',
    motto: 'Protect your people.',
    competency: 'DEFEND',
    target: 6,
    description: 'Strengthens when you look out for a friend without escalating the situation.',
    greeting: 'You can look out for someone without making a scene of it.',
  },
];

/* ------------------------------------------------------------------ */
/* Player                                                              */
/* ------------------------------------------------------------------ */

export const GUARDIAN_ART: Record<string, string> = Object.fromEntries(
  guardians.map((g) => [g.id, '/assets/shieldquest/guardians/' + g.id + '-neutral.svg']),
);
