import type { GuardianId } from './index.js';
import type { Competency } from './guardians.js';
export type { GuardianAward } from './guardians.js';

export type ChoiceOutcome = 'SAFE' | 'CAUTIOUS' | 'RISKY';

export type ScenarioMode = 'ENCOUNTER' | 'PEER_SHIELD';

export type Difficulty = 'Easy' | 'Medium' | 'Hard';

/** Every stat the player can move in one decision. */
export interface Deltas {
  coins?: number;
  resilience?: number;
  trust?: number;
  risk?: number;
}

export interface ScenarioMessage {
  id: string;
  /** `system` frames the scene, `them` is the other party, `you` is the player. */
  author: 'system' | 'them' | 'you';
  displayName?: string;
  body: string;
  /** Rendered under the sender name on the first message of a run. */
  meta?: string;
}

/** An optional, non-blocking hint the player can tag before deciding. */
export interface Clue {
  id: string;
  label: string;
  /** Shown once the clue is tagged. */
  note: string;
}

/**
 * A consequence that is deliberately *not* shown at decision time. The engine
 * schedules it and surfaces it after `delayMs`, which is the core teaching
 * mechanic: risky choices pay out now and charge later.
 */
export interface MissionConsequence {
  /** Milliseconds after the choice before the consequence surfaces. */
  delayMs: number;
  /** e.g. "3 days later" — the time-passage framing. */
  timeLabel: string;
  headline: string;
  body: string;
  /** Applied to the player's stats when the consequence fires. */
  deltas: Deltas;
  /** "What changed" — what the player was given at the time. */
  changedImmediate: string[];
  /** "What changed" — what it cost afterwards. */
  changedLater: string[];
  /** "Why this mattered" — the signals present in the scenario. */
  warningSigns: string[];
  saferResponse: string;
  competency: Competency;
}

/** The teaching payload shown after any decision resolves. */
export interface DecisionDebrief {
  /** e.g. "Good call", "Peer Shield success", "You took the offer". */
  headline: string;
  body: string;
  /** Ticked list of signals the decision correctly acted on. */
  spotted?: string[];
  /** A worked example of what the player could say. Peer Shield only. */
  sampleScript?: string;
  saferResponse?: string;
  competency: Competency;
  /** Guardian strengthened by this decision, if any. */
  guardianId?: GuardianId;
}

export interface ScenarioChoice {
  id: string;
  label: string;
  /** Short line explaining the shape of the option, shown under the label. */
  hint?: string;
  /** What gets appended to the transcript as the player's reply. */
  reply: string;
  outcome: ChoiceOutcome;
  /**
   * The immediate, visible payoff. Risky options intentionally pay the most —
   * the reward has to feel genuinely good before the delayed cost lands.
   */
  immediate: {
    deltas: Deltas;
    /** Toast headline, e.g. "Payment received". */
    flashTitle: string;
    /** Toast figure, e.g. "+200 Coins". */
    flashAmount?: string;
  };
  /** Present only when the true cost is deferred. */
  delayed?: MissionConsequence;
  debrief: DecisionDebrief;
}

export interface MissionScenario {
  id: string;
  mode: ScenarioMode;
  title: string;
  /** e.g. "Money Mule Recruitment" — the threat classification. */
  category: string;
  /** One-line hook shown in the mission header. */
  hook: string;
  difficulty: Difficulty;
  estimatedMinutes: number;
  primaryCompetency: Competency;
  competencies: Competency[];
  /** Position of the decision within the mission, e.g. 2 of 4. */
  step: number;
  totalSteps: number;
  /** Framing line rendered above the transcript. */
  prompt: string;
  messages: ScenarioMessage[];
  /** Optional clue inspection. Never required to progress. */
  clueQuestion?: string;
  clues?: Clue[];
  choices: ScenarioChoice[];
}

export interface ChoiceResult {
  outcome: ChoiceOutcome;
  flashTitle: string;
  flashAmount?: string;
  deltas: Deltas;
  debrief: DecisionDebrief;
  /** The engine echoes this back so the client can schedule the reveal. */
  delayed?: MissionConsequence;
}
