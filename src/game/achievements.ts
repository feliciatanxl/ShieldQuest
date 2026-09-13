import { SCENARIO_BY_ID } from './content/scenarios.ts';
import { DISTRICT_ORDER } from './board.ts';
import type { GameState } from './types.ts';

/**
 * Achievements — the half of the reward system that cannot be bought.
 *
 * Deliberately the mirror image of `content/cosmetics.ts`. A cosmetic is a
 * colour a player chose and paid for; an achievement is a record of something
 * they actually did, and there is no price on this page. That split is what
 * lets Shield Tokens be spendable at all without contradicting the commitment
 * that recognition is earned through demonstrated skill and never through
 * chance or purchase (proposal, section 3.2).
 *
 * Every one is DERIVED from the run rather than stored. Nothing can grant an
 * achievement directly, which means nothing can grant one by mistake: if the
 * decisions are not in the state, the badge is not on the page. It also makes
 * them honest after a reload, since the save is the only source.
 *
 * None of them compare the player to anybody else. There is no leaderboard, no
 * rank and no percentile here, because the proposal's evaluation is aggregate
 * and a youth crime-prevention programme should not be ranking children.
 */

export interface Achievement {
  id: string;
  name: string;
  /** What the player did. Written in the past tense, addressed to them. */
  blurb: string;
  earned: boolean;
  /** Progress towards it, when there is something countable to show. */
  progress?: { now: number; goal: number };
}

const safeDecisions = (state: GameState) =>
  state.decisions.filter((decision) => decision.outcome === 'SAFE').length;

const peerShieldSaves = (state: GameState) =>
  state.decisions.filter(
    (decision) =>
      decision.outcome === 'SAFE' && SCENARIO_BY_ID[decision.scenarioId]?.mode === 'PEER_SHIELD',
  ).length;

const securedDistricts = (state: GameState) =>
  DISTRICT_ORDER.filter((id) => state.districts[id].secured).length;

const builtDistricts = (state: GameState) =>
  DISTRICT_ORDER.filter((id) => state.districts[id].upgrades >= 3).length;

/** Every achievement, earned or not, in the order they are shown. */
export function achievementsFor(state: GameState): Achievement[] {
  const safe = safeDecisions(state);
  const peer = peerShieldSaves(state);
  const secured = securedDistricts(state);
  const built = builtDistricts(state);

  return [
    {
      id: 'first-call',
      name: 'First call',
      blurb: 'Made your first decision in the city.',
      earned: state.decisions.length > 0,
      progress: { now: Math.min(state.decisions.length, 1), goal: 1 },
    },
    {
      id: 'steady-hand',
      name: 'Steady hand',
      blurb: 'Took the safer option five times.',
      earned: safe >= 5,
      progress: { now: Math.min(safe, 5), goal: 5 },
    },
    {
      id: 'stood-up',
      name: 'Stood up for someone',
      blurb: 'Protected another person in Peer Shield Mode.',
      earned: peer >= 1,
      progress: { now: Math.min(peer, 1), goal: 1 },
    },
    {
      id: 'met-guardian',
      name: 'Met a Guardian',
      blurb: 'Demonstrated one S.H.I.E.L.D. skill often enough to meet its Guardian.',
      earned: state.metGuardians.length >= 1,
      progress: { now: Math.min(state.metGuardians.length, 1), goal: 1 },
    },
    {
      id: 'full-roster',
      name: 'The whole roster',
      blurb: 'Met all six Guardians — every prevention skill, demonstrated.',
      earned: state.metGuardians.length >= 6,
      progress: { now: state.metGuardians.length, goal: 6 },
    },
    {
      id: 'district-secured',
      name: 'District secured',
      blurb: 'Resolved every decision space in one district.',
      earned: secured >= 1,
      progress: { now: Math.min(secured, 1), goal: 1 },
    },
    {
      id: 'city-secured',
      name: 'City secured',
      blurb: 'Secured all four districts in one run.',
      earned: secured >= 4,
      progress: { now: secured, goal: 4 },
    },
    {
      id: 'public-works',
      name: 'Public works',
      blurb: 'Built out every upgrade in a district.',
      earned: built >= 1,
      progress: { now: Math.min(built, 1), goal: 1 },
    },
  ];
}

export const earnedCount = (state: GameState) =>
  achievementsFor(state).filter((achievement) => achievement.earned).length;
