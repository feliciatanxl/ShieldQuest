import type { GuardianId } from './index.js';
import type { Competency } from './guardians.js';
import type { ChoiceOutcome, Deltas, ScenarioMessage } from './scenarios.js';

export type GroupDecisionStage =
  | 'THINK'
  | 'VOTE'
  | 'GROUP'
  | 'EXPLAIN'
  | 'RECONSIDER'
  | 'DEBRIEF';

export interface GroupDecisionOption {
  id: string;
  label: string;
  /** Short line under the label. Never marks an option as the right one. */
  hint: string;
  outcome: ChoiceOutcome;
  /**
   * Simulated share of a demonstration group choosing this option, as a
   * percentage. Authored, illustrative, and labelled as such everywhere it is
   * shown. The three options sum to 100.
   */
  simulatedFirstVotePct: number;
  /** Simulated share after the group has heard each other's reasoning. */
  simulatedSecondVotePct: number;
  /** What the facilitator surface says once this option is locked in. */
  afterVoteNote: string;
}

/** One reason a player can tag when explaining their choice. */
export interface ReasoningFactor {
  id: string;
  label: string;
  /** Simulated share of the demonstration group that named this reason. */
  simulatedSharePct: number;
}

export interface GroupDecisionScenario {
  id: string;
  /** Matches a `MissionNode.id`, so completion records against the board. */
  nodeId: string;
  title: string;
  category: string;
  /** The eyebrow above the title, e.g. "Digi-District · District finale". */
  eyebrow: string;
  primaryCompetency: Competency;
  guardianId: GuardianId;
  estimatedMinutes: number;
  /** What the group is being asked to settle. */
  situation: string;
  /** The chat/transcript the group is reading together. */
  messages: ScenarioMessage[];
  /** The question put to the room. */
  question: string;
  options: GroupDecisionOption[];
  /** Prompts the facilitator puts to the room during the Explain step. */
  discussionPrompts: string[];
  factors: ReasoningFactor[];
  debrief: {
    headline: string;
    body: string;
    warningSigns: string[];
    saferResponse: string;
    /** What the facilitator should draw out at the end. */
    facilitatorNote: string;
  };
  reward: Deltas;
}

/**
 * Facilitated squad roles for Think · Vote · Explain.
 *
 * They are a facilitation device, not a game mechanic. Nothing is scored, no
 * role is better than another, and none of them changes what the activity awards.
 */
export interface PeerRole {
  id: string;
  /** e.g. "Evidence Checker". */
  name: string;
  /** One line on what this person is watching for. */
  purpose: string;
  /** The question this role brings to the group, in the role's own voice. */
  prompt: string;
  /** A short instruction shown on the role card itself. */
  brief: string;
}
