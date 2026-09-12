import {
  DISTRICTS,
  DISTRICT_ORDER,
  GATE_STIPEND,
  TRACK,
  TRACK_LENGTH,
  securingSpaces,
} from './board.ts';
import { GUARDIANS, GUARDIAN_BY_ID } from './content/guardians.ts';
import { CLUE_CARDS, SITUATION_CARDS } from './content/situations.ts';
import { SCENARIO_BY_ID } from './content/scenarios.ts';
import type {
  AgeBand,
  BoardSpace,
  ChoiceOutcome,
  Deltas,
  DiceRoll,
  DistrictId,
  DistrictState,
  DistrictUpgrade,
  GameState,
  GuardianId,
  LogEntry,
  PendingConsequence,
  Scenario,
  SituationCard,
  Stats,
} from './types.ts';

/* ------------------------------------------------------------------ */
/* Randomness                                                          */
/* ------------------------------------------------------------------ */

export type Rng = () => number;

/**
 * A small seeded generator, so a facilitator can replay a session and a test
 * can assert on an exact sequence. The dice are the only thing in the game that
 * is random, and they only ever decide movement.
 */
export function makeRng(seed: number): Rng {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const pick = <T>(items: readonly T[], rng: Rng): T => items[Math.floor(rng() * items.length)]!;

/* ------------------------------------------------------------------ */
/* Session identity                                                    */
/* ------------------------------------------------------------------ */

/**
 * The pseudonymous session code.
 *
 * The implementation plan commits to linking a participant's pre- and
 * post-session responses by a random code "rather than being identified by
 * name". This is that code: six characters, no vowels so it cannot spell
 * anything, and generated on the device. Nothing derived from the participant
 * goes into it.
 */
export function makeSessionCode(rng: Rng = Math.random): string {
  const alphabet = 'BCDFGHJKLMNPQRSTVWXZ23456789';
  let out = '';
  for (let i = 0; i < 6; i += 1) out += alphabet[Math.floor(rng() * alphabet.length)];
  return out;
}

/* ------------------------------------------------------------------ */
/* Stats                                                               */
/* ------------------------------------------------------------------ */

export const STAT_BOUNDS = {
  trust: [0, 100],
  risk: [0, 100],
  resilience: [0, 999],
  coins: [0, 99999],
} as const;

const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));

export function applyDeltas(stats: Stats, deltas: Deltas): Stats {
  return {
    coins: clamp(stats.coins + (deltas.coins ?? 0), ...STAT_BOUNDS.coins),
    trust: clamp(stats.trust + (deltas.trust ?? 0), ...STAT_BOUNDS.trust),
    risk: clamp(stats.risk + (deltas.risk ?? 0), ...STAT_BOUNDS.risk),
    resilience: clamp(stats.resilience + (deltas.resilience ?? 0), ...STAT_BOUNDS.resilience),
  };
}

/* ------------------------------------------------------------------ */
/* Set-up                                                              */
/* ------------------------------------------------------------------ */

const INITIAL_STATS: Stats = { coins: 120, trust: 50, risk: 10, resilience: 0 };

const freshDistrict = (): DistrictState => ({
  upgrades: 0,
  cleared: [],
  secured: false,
  celebrated: false,
});

/**
 * Run lengths, tuned against the 90-minute session structure in the
 * implementation plan: 15 minutes onboarding, 45 gameplay, 20 debrief, 10
 * evaluation. A turn takes roughly 60–90 seconds including the decision, so a
 * `SESSION` run fills the gameplay segment and leaves the facilitator a hard
 * stop they did not have to enforce themselves.
 */
export const RUN_LENGTH = {
  QUICK: 12,
  SESSION: 24,
  OPEN: 0,
} as const;

export function createGame(opts: {
  handle: string;
  band: AgeBand;
  sessionCode?: string;
  turnLimit?: number;
}): GameState {
  return {
    handle: opts.handle,
    sessionCode: opts.sessionCode ?? makeSessionCode(),
    band: opts.band,
    stats: { ...INITIAL_STATS },
    position: 0,
    turn: 0,
    lap: 0,
    phase: 'IDLE',
    turnLimit: opts.turnLimit ?? RUN_LENGTH.SESSION,
    lastRoll: null,
    rollsOwed: 0,
    resolved: [],
    guardianProgress: Object.fromEntries(GUARDIANS.map((g) => [g.id, 0])) as Record<
      GuardianId,
      number
    >,
    metGuardians: [],
    pending: [],
    districts: {
      school: freshDistrict(),
      retail: freshDistrict(),
      digital: freshDistrict(),
      community: freshDistrict(),
    },
    decisions: [],
    log: [{ turn: 0, text: 'Session started. Roll to enter the city.', tone: 'neutral' }],
  };
}

const logged = (state: GameState, entry: Omit<LogEntry, 'turn'>): LogEntry[] =>
  [{ turn: state.turn, ...entry }, ...state.log].slice(0, 60);

/* ------------------------------------------------------------------ */
/* Rolling and moving                                                  */
/* ------------------------------------------------------------------ */

/**
 * Turns left in the run, or `Infinity` for an open session.
 *
 * Doubles extend the run rather than granting a free move, which is the only
 * version of "roll again" that means anything inside a bounded session.
 */
export function turnsRemaining(state: GameState): number {
  if (state.turnLimit <= 0) return Number.POSITIVE_INFINITY;
  return Math.max(0, state.turnLimit + state.rollsOwed - state.turn);
}

export function rollDice(rng: Rng): DiceRoll {
  const a = 1 + Math.floor(rng() * 6);
  const b = 1 + Math.floor(rng() * 6);
  return { a, b, total: a + b, isDouble: a === b };
}

export interface MoveResult {
  state: GameState;
  /** Every space index stepped through, so the token can hop tile by tile. */
  path: number[];
  space: BoardSpace;
  /** True if the move crossed a district gate and collected the stipend. */
  passedGate: boolean;
}

/**
 * Apply a roll: advance the token, pay the gate stipend for any gate crossed,
 * and stop. Resolving what is ON the space is a separate step, because the UI
 * has to play the movement before the space opens.
 */
export function applyRoll(state: GameState, roll: DiceRoll): MoveResult {
  const path: number[] = [];
  let position = state.position;
  let stats = state.stats;
  let lap = state.lap;
  let passedGate = false;

  for (let step = 0; step < roll.total; step += 1) {
    position = (position + 1) % TRACK_LENGTH;
    path.push(position);
    const space = TRACK[position]!;
    if (space.kind === 'GATE') {
      passedGate = true;
      stats = applyDeltas(stats, { coins: GATE_STIPEND });
      if (position === 0) lap += 1;
    }
  }

  const space = TRACK[position]!;
  const next: GameState = {
    ...state,
    stats,
    position,
    lap,
    turn: state.turn + 1,
    lastRoll: roll,
    rollsOwed: roll.isDouble ? state.rollsOwed + 1 : state.rollsOwed,
    phase: 'MOVING',
    log: logged(state, {
      text: `Rolled ${roll.a} + ${roll.b}${roll.isDouble ? ' (double — one extra turn)' : ''} → ${space.title}`,
      tone: 'neutral',
    }),
  };
  return { state: next, path, space, passedGate };
}

/* ------------------------------------------------------------------ */
/* What a space opens                                                  */
/* ------------------------------------------------------------------ */

export type Landing =
  | { kind: 'GATE'; space: BoardSpace; stipend: number }
  | { kind: 'SCENARIO'; space: BoardSpace; scenario: Scenario }
  | { kind: 'CARD'; space: BoardSpace; card: SituationCard; guardianTrial: boolean }
  | { kind: 'COMMUNITY'; space: BoardSpace; districtId: DistrictId };

/**
 * Decide what the space the player landed on actually presents.
 *
 * Cards are drawn at random from the pool matching the session's age band
 * (proposal §4 — educators select a content band, and a 12-year-old must never
 * be shown a money-mule recruitment card). Which card appears is chance; what
 * it costs is always the player's decision.
 */
export function resolveLanding(state: GameState, space: BoardSpace, rng: Rng): Landing {
  switch (space.kind) {
    case 'GATE':
      return { kind: 'GATE', space, stipend: GATE_STIPEND };

    case 'COMMUNITY':
      return { kind: 'COMMUNITY', space, districtId: space.districtId };

    case 'MISSION':
    case 'PEER_SHIELD': {
      const scenario = space.scenarioId ? SCENARIO_BY_ID[space.scenarioId] : undefined;
      if (scenario && scenario.bands.includes(state.band)) {
        return { kind: 'SCENARIO', space, scenario };
      }
      // A mission outside this band falls back to a card rather than showing a
      // participant content that was not approved for their age group.
      return {
        kind: 'CARD',
        space,
        card: drawCard(state, SITUATION_CARDS, space.competency, rng),
        guardianTrial: false,
      };
    }

    case 'GUARDIAN':
      return {
        kind: 'CARD',
        space,
        card: drawCard(state, CLUE_CARDS, space.competency, rng),
        guardianTrial: true,
      };

    case 'CLUE':
      return {
        kind: 'CARD',
        space,
        card: drawCard(state, CLUE_CARDS, space.competency, rng),
        guardianTrial: false,
      };

    default:
      return {
        kind: 'CARD',
        space,
        card: drawCard(state, SITUATION_CARDS, space.competency, rng),
        guardianTrial: false,
      };
  }
}

function drawCard(
  state: GameState,
  pool: SituationCard[],
  competency: BoardSpace['competency'],
  rng: Rng,
): SituationCard {
  const inBand = pool.filter((c) => c.bands.includes(state.band));
  const source = inBand.length > 0 ? inBand : pool;
  const preferred = competency ? source.filter((c) => c.competency === competency) : [];
  return pick(preferred.length > 0 ? preferred : source, rng);
}

/* ------------------------------------------------------------------ */
/* Decisions                                                           */
/* ------------------------------------------------------------------ */

export interface DecisionResult {
  state: GameState;
  outcome: ChoiceOutcome;
  flashTitle: string;
  flashAmount?: string;
  deltas: Deltas;
  /** Guardians that reached their target on this decision. */
  awarded: GuardianId[];
  /** True if a delayed consequence was scheduled. Never shown to the player. */
  scheduled: boolean;
}

/**
 * Guardian progress earned by one decision.
 *
 * Only decisions that demonstrate the skill move the meter, and the size of the
 * step is fixed by how clearly they demonstrated it — never by the dice, never
 * by coins, never by a purchase. A risky choice earns nothing; it is not
 * punished with a deduction either, because the delayed consequence is already
 * the lesson and a double penalty reads as scolding.
 */
function progressFor(outcome: ChoiceOutcome): number {
  if (outcome === 'SAFE') return 2;
  if (outcome === 'CAUTIOUS') return 1;
  return 0;
}

function awardGuardians(
  progress: Record<GuardianId, number>,
  met: GuardianId[],
): { met: GuardianId[]; awarded: GuardianId[] } {
  const awarded: GuardianId[] = [];
  for (const guardian of GUARDIANS) {
    if (met.includes(guardian.id)) continue;
    if ((progress[guardian.id] ?? 0) >= guardian.target) awarded.push(guardian.id);
  }
  return { met: awarded.length > 0 ? [...met, ...awarded] : met, awarded };
}

function registerCleared(state: GameState, space: BoardSpace): GameState['districts'] {
  const district = state.districts[space.districtId];
  if (district.cleared.includes(space.id)) return state.districts;
  const cleared = [...district.cleared, space.id];
  const required = securingSpaces(space.districtId).map((s) => s.id);
  const secured = required.every((id) => cleared.includes(id));
  return {
    ...state.districts,
    [space.districtId]: { ...district, cleared, secured },
  };
}

/** Apply a full scenario decision. */
export function applyDecision(
  state: GameState,
  space: BoardSpace,
  scenario: Scenario,
  choiceId: string,
): DecisionResult {
  const choice = scenario.choices.find((c) => c.id === choiceId);
  if (!choice) throw new Error(`Unknown choice ${choiceId} in ${scenario.id}`);

  const stats = applyDeltas(state.stats, choice.immediate.deltas);
  const progress = { ...state.guardianProgress };
  const guardianId = choice.debrief.guardianId;
  if (guardianId) {
    progress[guardianId] = (progress[guardianId] ?? 0) + progressFor(choice.outcome);
  }
  const { met, awarded } = awardGuardians(progress, state.metGuardians);

  const pending = [...state.pending];
  if (choice.delayed) {
    pending.push({
      id: `pc_${scenario.id}_${choice.id}_${state.turn}`,
      scenarioId: scenario.id,
      choiceId: choice.id,
      dueTurn: state.turn + choice.delayed.delayTurns,
      consequence: choice.delayed,
      paidCoins: Math.max(0, choice.immediate.deltas.coins ?? 0),
    });
  }

  const next: GameState = {
    ...state,
    stats,
    guardianProgress: progress,
    metGuardians: met,
    pending,
    districts: registerCleared(state, space),
    resolved: state.resolved.includes(space.id) ? state.resolved : [...state.resolved, space.id],
    decisions: [
      ...state.decisions,
      { scenarioId: scenario.id, choiceId: choice.id, outcome: choice.outcome, turn: state.turn },
    ],
    phase: 'DEBRIEF',
    log: logged(state, {
      text: `${scenario.title}: ${choice.label}`,
      tone: choice.outcome === 'SAFE' ? 'safe' : choice.outcome === 'RISKY' ? 'risk' : 'neutral',
    }),
  };

  return {
    state: next,
    outcome: choice.outcome,
    flashTitle: choice.immediate.flashTitle,
    flashAmount: choice.immediate.flashAmount,
    deltas: choice.immediate.deltas,
    awarded,
    scheduled: Boolean(choice.delayed),
  };
}

/** Apply a short situation or clue card. */
export function applyCard(
  state: GameState,
  space: BoardSpace,
  card: SituationCard,
  optionId: string,
  guardianTrial = false,
): DecisionResult {
  const option = card.options.find((o) => o.id === optionId);
  if (!option) throw new Error(`Unknown option ${optionId} on ${card.id}`);

  const stats = applyDeltas(state.stats, option.deltas);
  const progress = { ...state.guardianProgress };
  if (option.guardianId) {
    const step = progressFor(option.outcome) * (guardianTrial ? 2 : 1);
    progress[option.guardianId] = (progress[option.guardianId] ?? 0) + step;
  }
  const { met, awarded } = awardGuardians(progress, state.metGuardians);

  const next: GameState = {
    ...state,
    stats,
    guardianProgress: progress,
    metGuardians: met,
    districts: registerCleared(state, space),
    resolved: state.resolved.includes(space.id) ? state.resolved : [...state.resolved, space.id],
    decisions: [
      ...state.decisions,
      { scenarioId: card.id, choiceId: option.id, outcome: option.outcome, turn: state.turn },
    ],
    phase: 'DEBRIEF',
    log: logged(state, {
      text: `${card.title}: ${option.label}`,
      tone: option.outcome === 'SAFE' ? 'safe' : option.outcome === 'RISKY' ? 'risk' : 'neutral',
    }),
  };

  return {
    state: next,
    outcome: option.outcome,
    flashTitle: option.outcome === 'SAFE' ? 'Good call' : 'Noted',
    deltas: option.deltas,
    awarded,
    scheduled: false,
  };
}

/* ------------------------------------------------------------------ */
/* The Delayed Consequence Engine                                      */
/* ------------------------------------------------------------------ */

export interface ConsequenceResult {
  state: GameState;
  pending: PendingConsequence;
  /**
   * Coins the reversal could not take back because they had already been spent.
   * Charged to trust instead — spending a reward you were never really given is
   * the sharpest version of this lesson, and it happens often enough on a board
   * with a coin sink that it needs to be modelled rather than silently ignored.
   */
  spentShortfall: number;
}

/** Consequences that have come due and have not yet surfaced. */
export function dueConsequences(state: GameState): PendingConsequence[] {
  return state.pending.filter((p) => state.turn >= p.dueTurn);
}

export function resolveConsequence(state: GameState, id: string): ConsequenceResult {
  const pending = state.pending.find((p) => p.id === id);
  if (!pending) throw new Error(`No pending consequence ${id}`);

  const owed = Math.abs(pending.consequence.deltas.coins ?? 0);
  const recoverable = Math.min(owed, state.stats.coins);
  const spentShortfall = owed - recoverable;

  const deltas: Deltas = {
    ...pending.consequence.deltas,
    coins: -recoverable,
    trust: (pending.consequence.deltas.trust ?? 0) - (spentShortfall > 0 ? 5 : 0),
  };

  const next: GameState = {
    ...state,
    stats: applyDeltas(state.stats, deltas),
    pending: state.pending.filter((p) => p.id !== id),
    phase: 'CONSEQUENCE',
    log: logged(state, {
      text: `${pending.consequence.timeLabel}: ${pending.consequence.headline}`,
      tone: 'risk',
    }),
  };

  return { state: next, pending, spentShortfall };
}

/**
 * Record that a district's "secured" moment has been played.
 *
 * Kept in game state rather than in the UI because the run is saved to
 * localStorage: without it, reloading the page part-way through a session
 * replays every celebration the player has already seen.
 */
export function markCelebrated(state: GameState, districtId: DistrictId): GameState {
  const district = state.districts[districtId];
  if (district.celebrated) return state;
  return {
    ...state,
    districts: { ...state.districts, [districtId]: { ...district, celebrated: true } },
  };
}

/* ------------------------------------------------------------------ */
/* Community upgrades                                                  */
/* ------------------------------------------------------------------ */

export interface UpgradeResult {
  state: GameState;
  built: DistrictUpgrade | null;
  reason?: 'complete' | 'insufficient';
}

export function nextUpgrade(state: GameState, districtId: DistrictId) {
  const built = state.districts[districtId].upgrades;
  return DISTRICTS[districtId].upgrades[built] ?? null;
}

export function buildUpgrade(state: GameState, districtId: DistrictId): UpgradeResult {
  const upgrade = nextUpgrade(state, districtId);
  if (!upgrade) return { state, built: null, reason: 'complete' };
  if (state.stats.coins < upgrade.cost) return { state, built: null, reason: 'insufficient' };

  const district = state.districts[districtId];
  const next: GameState = {
    ...state,
    stats: applyDeltas(state.stats, { coins: -upgrade.cost, trust: upgrade.trust }),
    districts: {
      ...state.districts,
      [districtId]: { ...district, upgrades: district.upgrades + 1 },
    },
    log: logged(state, {
      text: `Built ${upgrade.name} in ${DISTRICTS[districtId].name}`,
      tone: 'earned',
    }),
  };
  return { state: next, built: upgrade };
}

/* ------------------------------------------------------------------ */
/* Progress reporting                                                  */
/* ------------------------------------------------------------------ */

export interface SessionReport {
  sessionCode: string;
  turns: number;
  decisions: number;
  safeRate: number;
  riskyCount: number;
  /** Guardians met, i.e. competencies demonstrated to target. */
  guardians: GuardianId[];
  competencyProgress: { guardianId: GuardianId; name: string; progress: number; target: number }[];
  districtsSecured: DistrictId[];
  stats: Stats;
}

/**
 * The end-of-session report.
 *
 * Everything here is about the run, not the person: no name, no device, no
 * free text. This is the shape a facilitator aggregates across a squad for the
 * debrief, and it is why the evaluation can be honest about decision accuracy
 * without profiling anybody.
 */
export function sessionReport(state: GameState): SessionReport {
  const decisions = state.decisions.length;
  const safe = state.decisions.filter((d) => d.outcome === 'SAFE').length;
  return {
    sessionCode: state.sessionCode,
    turns: state.turn,
    decisions,
    safeRate: decisions === 0 ? 0 : Math.round((safe / decisions) * 100),
    riskyCount: state.decisions.filter((d) => d.outcome === 'RISKY').length,
    guardians: state.metGuardians,
    competencyProgress: GUARDIANS.map((g) => ({
      guardianId: g.id,
      name: GUARDIAN_BY_ID[g.id].name,
      progress: state.guardianProgress[g.id] ?? 0,
      target: g.target,
    })),
    districtsSecured: DISTRICT_ORDER.filter((id) => state.districts[id].secured),
    stats: state.stats,
  };
}
