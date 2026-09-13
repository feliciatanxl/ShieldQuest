/**
 * ShieldQuest — game types.
 *
 * The engine below the UI is deliberately free of React, Three.js and the DOM,
 * because the same rules have to hold in three places: the 3D board, the
 * accessible DOM fallback board, and the printable offline kit the proposal
 * commits to (§5.3, "printable offline board-game kit"). A rule that lives in a
 * component cannot be printed on card.
 */

/* ------------------------------------------------------------------ */
/* S.H.I.E.L.D. Behavioural Framework                                  */
/* ------------------------------------------------------------------ */

/**
 * The six competencies, in acronym order. This is the spine of the product:
 * the proposal commits to "one transferable decision-making process" and the
 * pilot's pre/post assessment measures exactly these six.
 */
export type Competency = 'SPOT' | 'HOLD' | 'IDENTIFY' | 'EVALUATE' | 'LEAD' | 'DEFEND';

export const COMPETENCY_ORDER: readonly Competency[] = [
  'SPOT',
  'HOLD',
  'IDENTIFY',
  'EVALUATE',
  'LEAD',
  'DEFEND',
] as const;

export const COMPETENCY_LETTER: Record<Competency, string> = {
  SPOT: 'S',
  HOLD: 'H',
  IDENTIFY: 'I',
  EVALUATE: 'E',
  LEAD: 'L',
  DEFEND: 'D',
};

export const COMPETENCY_LABEL: Record<Competency, string> = {
  SPOT: 'Spot the Risk',
  HOLD: 'Hold Before Acting',
  IDENTIFY: 'Identify the Influence',
  EVALUATE: 'Evaluate the Consequences',
  LEAD: 'Lead the Right Choice',
  DEFEND: 'Defend Your Community',
};

/* ------------------------------------------------------------------ */
/* Guardians                                                           */
/* ------------------------------------------------------------------ */

export type GuardianId = 'verifox' | 'echo' | 'cluepaw' | 'bytebuddy' | 'beacon' | 'shieldfin';

export interface Guardian {
  id: GuardianId;
  name: string;
  /** The prevention skill the Guardian represents (proposal §3.2). */
  skill: string;
  motto: string;
  competency: Competency;
  /** Practice points needed to meet the Guardian. Never bought, never rolled. */
  target: number;
  description: string;
  greeting: string;
  /** In-play ability, as written in the proposal. */
  ability: string;
  /** Token colour. Hex, consumed by both CSS and Three.js. */
  colour: string;
}

/* ------------------------------------------------------------------ */
/* Age bands (proposal §4)                                             */
/* ------------------------------------------------------------------ */

/* ------------------------------------------------------------------ */
/* Cosmetics                                                           */
/* ------------------------------------------------------------------ */

/**
 * A look for the player's piece, bought with Shield Tokens.
 *
 * Cosmetic and nothing else. A cosmetic never changes a roll, a stat, a
 * scenario, a Guardian or what the game says about a decision — which is the
 * whole reason tokens are allowed to be spendable at all. Recognition for
 * demonstrated skill is a Guardian or an achievement, and neither can be
 * bought (proposal, section 3.2).
 */
export interface Cosmetic {
  id: string;
  name: string;
  /** In Shield Tokens. */
  cost: number;
  blurb: string;
  /** The piece's core colour. Read by BOTH renderers, so they never diverge. */
  colour: string;
  /** Ring colour around the piece, or null for a plain piece. */
  glow: string | null;
}

export type AgeBand = 'B10_13' | 'B14_16' | 'B17_24';

export const AGE_BAND_LABEL: Record<AgeBand, string> = {
  B10_13: 'Ages 10–13',
  B14_16: 'Ages 14–16',
  B17_24: 'Ages 17–24',
};

/* ------------------------------------------------------------------ */
/* Scenario content                                                    */
/* ------------------------------------------------------------------ */

export type ChoiceOutcome = 'SAFE' | 'CAUTIOUS' | 'RISKY';
export type ScenarioMode = 'ENCOUNTER' | 'PEER_SHIELD';
export type Difficulty = 'Easy' | 'Medium' | 'Hard';

/** Every stat a single decision can move. */
export interface Deltas {
  coins?: number;
  /** City Trust Meter. Community standing, shared across the board. */
  trust?: number;
  /** Exposure. High risk makes later situations harder to walk back. */
  risk?: number;
  /** Community Resilience — earned by protecting other people. */
  resilience?: number;
}

export interface ScenarioMessage {
  id: string;
  /** `system` frames the scene, `them` is the other party, `you` is the player. */
  author: 'system' | 'them' | 'you';
  displayName?: string;
  body: string;
  meta?: string;
}

/** An optional, non-blocking hint the player can tag before deciding. */
export interface Clue {
  id: string;
  label: string;
  note: string;
}

/**
 * A consequence that is deliberately NOT shown at decision time.
 *
 * This is the Delayed Consequence Engine, one of the two named distinctive
 * hooks in the proposal. Risky choices pay out immediately and charge later —
 * the delay is the teaching mechanic, so it is measured in turns, not
 * milliseconds: the player has to make other decisions in between.
 */
export interface DelayedConsequence {
  /** Turns that must pass before this surfaces. Two is the tuned default. */
  delayTurns: number;
  /** Time-passage framing, e.g. "3 days later". */
  timeLabel: string;
  headline: string;
  body: string;
  deltas: Deltas;
  /** What the player was handed at the time. */
  changedImmediate: string[];
  /** What it cost afterwards. */
  changedLater: string[];
  warningSigns: string[];
  saferResponse: string;
  competency: Competency;
}

/** The teaching payload shown after any decision resolves. */
export interface DecisionDebrief {
  headline: string;
  body: string;
  /** Signals the decision correctly acted on. */
  spotted?: string[];
  /** A worked example of what the player could actually say. Peer Shield only. */
  sampleScript?: string;
  saferResponse?: string;
  competency: Competency;
  /** Guardian strengthened by this decision, if any. */
  guardianId?: GuardianId;
}

export interface ScenarioChoice {
  id: string;
  label: string;
  hint?: string;
  /** Appended to the transcript as the player's reply. */
  reply: string;
  outcome: ChoiceOutcome;
  /**
   * The immediate, visible payoff. Risky options intentionally pay the most:
   * the reward has to feel genuinely good before the delayed cost lands, or
   * the lesson is only ever theoretical.
   */
  immediate: {
    deltas: Deltas;
    flashTitle: string;
    flashAmount?: string;
  };
  delayed?: DelayedConsequence;
  debrief: DecisionDebrief;
}

export interface Scenario {
  id: string;
  mode: ScenarioMode;
  title: string;
  /** Threat classification, e.g. "Money Mule Recruitment". */
  category: string;
  hook: string;
  difficulty: Difficulty;
  estimatedMinutes: number;
  primaryCompetency: Competency;
  competencies: Competency[];
  /** Age bands this scenario is approved for (proposal §4). */
  bands: AgeBand[];
  prompt: string;
  messages: ScenarioMessage[];
  clueQuestion?: string;
  clues?: Clue[];
  choices: ScenarioChoice[];
}

/**
 * A short card drawn on a Situation space — one beat, one decision, no
 * transcript. These carry the board's rhythm between full missions so a turn
 * is never dead air.
 */
export interface SituationCard {
  id: string;
  title: string;
  body: string;
  competency: Competency;
  bands: AgeBand[];
  options: {
    id: string;
    label: string;
    outcome: ChoiceOutcome;
    deltas: Deltas;
    feedback: string;
    guardianId?: GuardianId;
  }[];
}

/* ------------------------------------------------------------------ */
/* Board                                                               */
/* ------------------------------------------------------------------ */

export type DistrictId = 'school' | 'retail' | 'digital' | 'community';

export interface DistrictUpgrade {
  name: string;
  cost: number;
  trust: number;
  blurb: string;
}

export interface District {
  id: DistrictId;
  name: string;
  tagline: string;
  /** Themes drawn from proposal §4's age-band table. */
  themes: string;
  colour: string;
  /** The three community upgrades coins can be spent on. */
  upgrades: DistrictUpgrade[];
}

export type SpaceKind =
  'GATE' | 'MISSION' | 'PEER_SHIELD' | 'SITUATION' | 'CLUE' | 'GUARDIAN' | 'COMMUNITY';

export interface BoardSpace {
  /** Index around the track, 0..TRACK_LENGTH-1. */
  index: number;
  id: string;
  districtId: DistrictId;
  kind: SpaceKind;
  title: string;
  /**
   * A one- or two-word label for when the tile is too small for the title.
   *
   * The flat board on a phone gives each space about forty pixels. "Community
   * Hub Works" in forty pixels is not a shorter title, it is a clipped one —
   * and a clipped label is worse than a short one, because the player cannot
   * tell what was cut. The full title is still the accessible name, still in
   * the footer, and still in the tile's own sheet.
   */
  short: string;
  /** One line, shown on the tile face and read by the DOM control layer. */
  summary: string;
  competency?: Competency;
  guardianId?: GuardianId;
  /** Scenario played when the space resolves, for MISSION and PEER_SHIELD. */
  scenarioId?: string;
  /** True for the four district gates, which sit on the board's corners. */
  corner?: boolean;
}

/* ------------------------------------------------------------------ */
/* Runtime state                                                       */
/* ------------------------------------------------------------------ */

export interface Stats {
  coins: number;
  trust: number;
  risk: number;
  resilience: number;
}

export interface DiceRoll {
  a: number;
  b: number;
  total: number;
  isDouble: boolean;
}

/** A consequence that has been scheduled but has not yet surfaced. */
export interface PendingConsequence {
  id: string;
  scenarioId: string;
  choiceId: string;
  /** Turn number on which this becomes due. */
  dueTurn: number;
  consequence: DelayedConsequence;
  /**
   * Coins the player was actually paid. If they have since spent them, the
   * reversal cannot take them back — and the shortfall is charged to trust
   * instead, which is the sharpest version of the lesson.
   */
  paidCoins: number;
}

export interface DistrictState {
  /** Upgrades built, 0..3. */
  upgrades: number;
  /** Spaces in this district the player has resolved at least once. */
  cleared: string[];
  secured: boolean;
  /** Whether the "district secured" moment has already been played. */
  celebrated: boolean;
}

export type GamePhase =
  'IDLE' | 'ROLLING' | 'MOVING' | 'LANDED' | 'SCENARIO' | 'DEBRIEF' | 'CONSEQUENCE' | 'AWARD';

export interface LogEntry {
  turn: number;
  text: string;
  tone: 'neutral' | 'safe' | 'risk' | 'earned';
}

export interface GameState {
  /** Self-chosen codename. Never a real name — see data minimisation below. */
  handle: string;
  /**
   * Random pseudonymous session code. The implementation plan commits to
   * linking pre/post responses by this and nothing else: no names, NRICs,
   * phone numbers or banking data are ever collected.
   */
  sessionCode: string;
  band: AgeBand;

  stats: Stats;
  position: number;
  turn: number;
  lap: number;
  phase: GamePhase;

  /**
   * Turns in the run, or 0 for an open session.
   *
   * The pilot's gameplay segment is 45 minutes inside a 90-minute workshop, so
   * a facilitated run has to end on its own rather than when a squad gets
   * bored. A bounded run is also what makes a double worth rolling: with
   * unlimited turns an extra roll is worth nothing, and a reward worth nothing
   * is a lie told to a player.
   */
  turnLimit: number;

  lastRoll: DiceRoll | null;
  /** Extra turns earned from doubles, added to the limit. */
  rollsOwed: number;

  /** Space ids resolved at least once. */
  resolved: string[];
  guardianProgress: Record<GuardianId, number>;
  metGuardians: GuardianId[];

  pending: PendingConsequence[];
  districts: Record<DistrictId, DistrictState>;

  /**
   * Shield Tokens: participation credit, and only that.
   *
   * They are not money, cannot be cashed out, and are never paid for a dice
   * roll, a gate stipend, a purchase, or for doing better than anyone else.
   * They are paid for taking part in a decision and for a district the
   * player's decisions secured, and they buy cosmetics and nothing else.
   * `engine.test.ts` holds each half of that sentence to account.
   */
  tokens: number;
  /**
   * Award keys already paid. A scenario pays once however many times a player
   * passes it — without this, walking a lap becomes a way to farm credit, and
   * "participation" would quietly turn into "time spent".
   */
  tokenGrants: string[];
  /** Cosmetic ids bought. Buying is permanent; there is no way to lose one. */
  unlocked: string[];
  /** The cosmetic on the piece, or null for the one everybody starts with. */
  equipped: string | null;

  /** Decisions made, for the facilitator's aggregate debrief. Never per-person. */
  decisions: { scenarioId: string; choiceId: string; outcome: ChoiceOutcome; turn: number }[];
  log: LogEntry[];
}
