import type { GuardianId } from './index.js';
import type { Competency } from './guardians.js';
import type { Deltas } from './scenarios.js';

export type MiniGameId =
  | 'spot-the-warning-signs'
  | 'decode-the-clue'
  | 'risk-or-safe'
  | 'clue-match'
  | 'who-can-help'
  | 'what-happens-next';

export type MiniGameKind =
  | 'WORD_SEARCH'
  | 'DECODE'
  | 'SORT'
  | 'MATCH'
  | 'PREDICT';

/** Reward for finishing a mini-game. Deliberately small next to a scenario. */
export interface MiniGameReward {
  deltas: Deltas;
  guardianId: GuardianId;
}

export interface MiniGameBase {
  id: MiniGameId;
  kind: MiniGameKind;
  /** Matches the `MissionNode.id` so completion is recorded against the board. */
  nodeId: string;
  title: string;
  instruction: string;
  primaryCompetency: Competency;
  reward: MiniGameReward;
  /** Eyebrow on the completion card, e.g. "VeriFox skill". */
  skillName: string;
  /** The named skill this activity built, e.g. "Verification". */
  skillTitle: string;
  /** One line on what that skill means in practice. */
  skillLine: string;
}

/** A word the player has to find, with the meaning revealed on discovery. */
export interface WordSearchWord {
  word: string;
  /** Row of the first letter, zero-indexed. */
  row: number;
  col: number;
  /** Unit step per letter, so any of the eight directions can be authored. */
  dRow: number;
  dCol: number;
  /** Why this word signals risk. Shown the moment it is found. */
  meaning: string;
}

/**
 * A short multiple-choice question that ties the mini-game back to a scenario.
 *
 * This is the point of the mini-game: recognition on its own is trivia, so the
 * activity always closes by asking the player to place the pattern back into a
 * situation they have played.
 */
export interface TransferQuestion {
  prompt: string;
  options: string[];
  /** Index into `options`. */
  answerIndex: number;
  /** Explanation shown after answering, whichever option was chosen. */
  explanation: string;
}

export interface WordSearchGame extends MiniGameBase {
  kind: 'WORD_SEARCH';
  /** Square grid, one string per row. Authored, never generated at runtime. */
  grid: string[];
  words: WordSearchWord[];
  transfer: TransferQuestion;
}

/** One round of Decode the Clue. */
export interface DecodeRound {
  answer: string;
  hint: string;
  /** Shown once the round is solved. */
  meaning: string;
}

export interface DecodeClueGame extends MiniGameBase {
  kind: 'DECODE';
  rounds: DecodeRound[];
  /** Wrong guesses allowed per round, shown as signal strength. */
  attempts: number;
}

/* ---- Risk or Safe? — rapid judgement, then the reason ---------------- */

/**
 * One card in Risk or Safe?
 *
 * The judgement is the easy half. `explanation` is the half that teaches, and
 * it is shown whichever way the player called it — a card they got right for
 * the wrong reason is exactly the case this activity exists to catch.
 */
export interface SortCard {
  id: string;
  /** The situation, in the player's own world. One or two lines. */
  situation: string;
  /** The intended reading. `RISK` means "this has a warning sign in it". */
  answer: 'RISK' | 'SAFE';
  /** Why. Always shown, right or wrong. */
  explanation: string;
}

export interface SortGame extends MiniGameBase {
  kind: 'SORT';
  cards: SortCard[];
  transfer?: TransferQuestion;
}

/* ---- Clue Match / Who Can Help? — pairing --------------------------- */

/** One pair. The player links the prompt to the response that fits it. */
export interface MatchPair {
  id: string;
  /** Left column — the clue, or the situation. */
  prompt: string;
  /** Right column — the situation it signals, or the help that fits. */
  match: string;
  /** Shown once the pair is made. Why these two belong together. */
  note: string;
}

export interface MatchGame extends MiniGameBase {
  kind: 'MATCH';
  /** Column captions, e.g. "Warning sign" / "Where it shows up". */
  promptLabel: string;
  matchLabel: string;
  pairs: MatchPair[];
  /**
   * Display order of the right column, as pair ids. Authored rather than
   * shuffled at runtime so the server and the first client render agree.
   */
  matchOrder: string[];
  transfer?: TransferQuestion;
}

/* ---- What Happens Next? — consequence reasoning --------------------- */

/**
 * One prediction round.
 *
 * The player is shown a decision that has already been taken and asked what
 * follows. It is the Delayed Consequence Engine turned into practice: the whole
 * point of the engine is that the cost arrives after the reward, so being able
 * to name the cost in advance is the skill it is trying to build.
 */
export interface PredictRound {
  id: string;
  /** What just happened, and what the person got out of it. */
  setup: string;
  /** What they were given at the time, e.g. "+S$200 right away". */
  immediate: string;
  prompt: string;
  options: string[];
  answerIndex: number;
  explanation: string;
}

export interface PredictGame extends MiniGameBase {
  kind: 'PREDICT';
  rounds: PredictRound[];
}

export type MiniGame =
  | WordSearchGame
  | DecodeClueGame
  | SortGame
  | MatchGame
  | PredictGame;
