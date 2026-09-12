import { create } from 'zustand';

import { DISTRICTS, TRACK } from '../game/board.ts';
import { GUARDIAN_BY_ID } from '../game/content/guardians.ts';
import {
  applyCard,
  applyDecision,
  applyRoll,
  buildUpgrade,
  createGame,
  dueConsequences,
  makeRng,
  markCelebrated,
  resolveConsequence,
  resolveLanding,
  rollDice,
  turnsRemaining,
  type Landing,
  type Rng,
} from '../game/engine.ts';
import type {
  AgeBand,
  BoardSpace,
  ChoiceOutcome,
  DecisionDebrief,
  Deltas,
  DiceRoll,
  DistrictId,
  GameState,
  GuardianId,
  PendingConsequence,
  Scenario,
  SituationCard,
} from '../game/types.ts';

/* ------------------------------------------------------------------ */
/* Overlays                                                            */
/* ------------------------------------------------------------------ */

/**
 * What is currently in front of the board.
 *
 * Exactly one thing at a time, because the board is played on a phone and two
 * stacked sheets on a 375px screen is how a participant loses track of which
 * decision they are answering. Follow-ups queue instead of stacking.
 */
export type Overlay =
  | { kind: 'none' }
  | { kind: 'gate'; space: BoardSpace; stipend: number }
  | { kind: 'scenario'; space: BoardSpace; scenario: Scenario }
  | { kind: 'card'; space: BoardSpace; card: SituationCard; guardianTrial: boolean }
  | { kind: 'community'; space: BoardSpace; districtId: DistrictId }
  | {
      kind: 'debrief';
      title: string;
      outcome: ChoiceOutcome;
      debrief: DecisionDebrief;
      /** Present for full scenarios; short cards carry their feedback inline. */
      reply?: string;
    }
  | { kind: 'consequence'; pending: PendingConsequence; shortfall: number }
  | { kind: 'award'; guardianId: GuardianId }
  | { kind: 'secured'; districtId: DistrictId }
  | { kind: 'report' };

/** A queued follow-up, shown one at a time after a decision resolves. */
type FollowUp =
  | { kind: 'award'; guardianId: GuardianId }
  | { kind: 'secured'; districtId: DistrictId }
  | { kind: 'consequence'; id: string };

/** A transient burst the HUD plays: coins flying, a stat ticking up. */
export interface Flash {
  id: number;
  title: string;
  amount?: string;
  outcome: ChoiceOutcome;
  deltas: Deltas;
}

export type RendererMode = '3d' | 'flat';

/* ------------------------------------------------------------------ */
/* Persistence                                                         */
/* ------------------------------------------------------------------ */

const SAVE_KEY = 'shieldquest.session.v2';

/**
 * The save lives in localStorage and holds only the run: a codename the player
 * invented, the pseudonymous session code, the age band an educator selected,
 * and board progress. No device identifier, no timestamps that could be joined
 * to anything, nothing typed freely by a participant. It never leaves the
 * device — there is no account to sync it to, by design.
 */
function loadSave(): GameState | null {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as GameState;
    if (!parsed.sessionCode || typeof parsed.position !== 'number') return null;
    return parsed;
  } catch {
    return null;
  }
}

function persist(game: GameState | null) {
  try {
    if (game) localStorage.setItem(SAVE_KEY, JSON.stringify(game));
    else localStorage.removeItem(SAVE_KEY);
  } catch {
    /* Private browsing, or storage disabled. The session still plays. */
  }
}

/* ------------------------------------------------------------------ */
/* Renderer capability                                                 */
/* ------------------------------------------------------------------ */

/**
 * Whether this device should get the 3D board.
 *
 * The proposal commits to low-bandwidth access and to running on "common
 * phones, tablets and laptops" in school computer labs, so the 3D board is an
 * enhancement with a real, equivalent alternative — never a requirement. A
 * device that fails any of these checks plays the same 28 spaces on the flat
 * board, with identical rules.
 */
export function detect3dSupport(): boolean {
  if (typeof window === 'undefined') return false;
  if (!('WebGL2RenderingContext' in window)) return false;
  if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return false;
  const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
  if (connection?.saveData) return false;
  if ((navigator.hardwareConcurrency ?? 4) <= 2) return false;
  return true;
}

const RENDERER_KEY = 'shieldquest.renderer.v2';

function loadRendererPreference(): RendererMode | null {
  try {
    const raw = localStorage.getItem(RENDERER_KEY);
    return raw === '3d' || raw === 'flat' ? raw : null;
  } catch {
    return null;
  }
}

/* ------------------------------------------------------------------ */
/* Store                                                               */
/* ------------------------------------------------------------------ */

interface Store {
  game: GameState | null;
  overlay: Overlay;
  queue: FollowUp[];
  flash: Flash | null;
  /** Spaces the token still has to hop through. Empty when it has arrived. */
  path: number[];
  dice: DiceRoll | null;
  renderer: RendererMode;
  rendererForced: boolean;
  celebrate: number;
  rng: Rng;

  start(opts: { handle: string; band: AgeBand; turnLimit: number }): void;
  resume(): boolean;
  abandon(): void;

  roll(): void;
  arrive(): void;
  choose(choiceId: string): void;
  answerCard(optionId: string): void;
  build(districtId: DistrictId): { ok: boolean; reason?: string };
  dismiss(): void;
  openReport(): void;
  setRenderer(mode: RendererMode): void;
  clearFlash(): void;
}

let flashSeq = 0;

export const useGame = create<Store>((set, get) => ({
  game: null,
  overlay: { kind: 'none' },
  queue: [],
  flash: null,
  path: [],
  dice: null,
  renderer: loadRendererPreference() ?? (detect3dSupport() ? '3d' : 'flat'),
  rendererForced: loadRendererPreference() !== null,
  celebrate: 0,
  rng: makeRng(Date.now() >>> 0),

  start({ handle, band, turnLimit }) {
    const game = createGame({ handle, band, turnLimit });
    persist(game);
    set({ game, overlay: { kind: 'none' }, queue: [], path: [], dice: null, flash: null });
  },

  resume() {
    const game = loadSave();
    if (!game) return false;
    set({ game: { ...game, phase: 'IDLE' }, overlay: { kind: 'none' }, queue: [], path: [] });
    return true;
  },

  abandon() {
    persist(null);
    set({ game: null, overlay: { kind: 'none' }, queue: [], path: [], dice: null });
  },

  /* --- the turn ---------------------------------------------------- */

  roll() {
    const { game, rng, path } = get();
    if (!game || path.length > 0) return;
    if (game.phase !== 'IDLE') return;
    if (turnsRemaining(game) <= 0) {
      set({ overlay: { kind: 'report' } });
      return;
    }

    const dice = rollDice(rng);
    const moved = applyRoll(game, dice);
    persist(moved.state);
    set({ game: moved.state, path: moved.path, dice });
  },

  /**
   * The token has finished hopping. Open whatever it landed on.
   *
   * This is driven by the renderer rather than a timer so the sheet never opens
   * over a token that is still moving — and so the flat board, which has no
   * hop animation, can call it immediately.
   */
  arrive() {
    const { game, rng } = get();
    if (!game) return;
    const space = { ...game, phase: 'LANDED' as const };
    const landing: Landing = resolveLanding(game, spaceAt(game), rng);
    persist(space);
    set({ game: space, path: [], overlay: overlayFor(landing) });
  },

  choose(choiceId) {
    const { game, overlay } = get();
    if (!game || overlay.kind !== 'scenario') return;

    const result = applyDecision(game, overlay.space, overlay.scenario, choiceId);
    const choice = overlay.scenario.choices.find((c) => c.id === choiceId)!;
    persist(result.state);

    flashSeq += 1;
    set({
      game: result.state,
      flash: {
        id: flashSeq,
        title: result.flashTitle,
        amount: result.flashAmount,
        outcome: result.outcome,
        deltas: result.deltas,
      },
      queue: followUps(game, result.state, result.awarded, overlay.space.districtId),
      overlay: {
        kind: 'debrief',
        title: overlay.scenario.title,
        outcome: result.outcome,
        debrief: choice.debrief,
        reply: choice.reply,
      },
    });
  },

  answerCard(optionId) {
    const { game, overlay } = get();
    if (!game || overlay.kind !== 'card') return;

    const option = overlay.card.options.find((o) => o.id === optionId);
    if (!option) return;
    const result = applyCard(game, overlay.space, overlay.card, optionId, overlay.guardianTrial);
    persist(result.state);

    flashSeq += 1;
    set({
      game: result.state,
      flash: {
        id: flashSeq,
        title: result.flashTitle,
        amount: undefined,
        outcome: result.outcome,
        deltas: result.deltas,
      },
      queue: followUps(game, result.state, result.awarded, overlay.space.districtId),
      overlay: {
        kind: 'debrief',
        title: overlay.card.title,
        outcome: option.outcome,
        debrief: {
          headline: option.outcome === 'SAFE' ? 'Good call' : 'Worth knowing',
          body: option.feedback,
          competency: overlay.card.competency,
          guardianId: option.guardianId,
        },
      },
    });
  },

  build(districtId) {
    const { game } = get();
    if (!game) return { ok: false, reason: 'No session' };
    const result = buildUpgrade(game, districtId);
    if (!result.built) {
      return {
        ok: false,
        reason:
          result.reason === 'complete'
            ? `${DISTRICTS[districtId].name} is fully built.`
            : 'Not enough coins yet.',
      };
    }
    persist(result.state);
    flashSeq += 1;
    set({
      game: result.state,
      celebrate: get().celebrate + 1,
      flash: {
        id: flashSeq,
        title: `Built ${result.built.name}`,
        amount: `+${result.built.trust} Trust`,
        outcome: 'SAFE',
        deltas: { trust: result.built.trust },
      },
    });
    return { ok: true };
  },

  /**
   * Close the current overlay and show the next queued follow-up, or hand the
   * turn back. Follow-ups are ordered deliberately: what the player just earned,
   * then what the district just became, then the bill from an earlier turn —
   * so the run ends on the consequence rather than burying it under a reward.
   */
  dismiss() {
    const { game, queue } = get();
    if (!game) return;

    const [next, ...rest] = queue;
    if (!next) {
      const resumed: GameState = { ...game, phase: 'IDLE' };
      persist(resumed);
      // A run that has used its last turn goes straight to the report rather
      // than leaving a dead Roll button on screen.
      const finished = turnsRemaining(resumed) <= 0;
      set({
        game: resumed,
        overlay: finished ? { kind: 'report' } : { kind: 'none' },
        queue: [],
      });
      return;
    }

    if (next.kind === 'award') {
      set({
        overlay: { kind: 'award', guardianId: next.guardianId },
        queue: rest,
        celebrate: get().celebrate + 1,
      });
      return;
    }

    if (next.kind === 'secured') {
      const marked = markCelebrated(game, next.districtId);
      persist(marked);
      set({
        game: marked,
        overlay: { kind: 'secured', districtId: next.districtId },
        queue: rest,
        celebrate: get().celebrate + 1,
      });
      return;
    }

    const resolved = resolveConsequence(game, next.id);
    persist(resolved.state);
    set({
      game: resolved.state,
      overlay: {
        kind: 'consequence',
        pending: resolved.pending,
        shortfall: resolved.spentShortfall,
      },
      queue: rest,
    });
  },

  openReport() {
    set({ overlay: { kind: 'report' } });
  },

  setRenderer(mode) {
    try {
      localStorage.setItem(RENDERER_KEY, mode);
    } catch {
      /* nothing to do — the preference just will not survive a reload */
    }
    set({ renderer: mode, rendererForced: true });
  },

  clearFlash() {
    set({ flash: null });
  },
}));

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

const spaceAt = (game: GameState): BoardSpace => TRACK[game.position]!;

function overlayFor(landing: Landing): Overlay {
  switch (landing.kind) {
    case 'GATE':
      return { kind: 'gate', space: landing.space, stipend: landing.stipend };
    case 'SCENARIO':
      return { kind: 'scenario', space: landing.space, scenario: landing.scenario };
    case 'CARD':
      return {
        kind: 'card',
        space: landing.space,
        card: landing.card,
        guardianTrial: landing.guardianTrial,
      };
    case 'COMMUNITY':
      return { kind: 'community', space: landing.space, districtId: landing.districtId };
  }
}

/**
 * Build the follow-up queue after a decision.
 *
 * Ordered deliberately: what the player just earned, then what the district
 * just became, then the bill from an earlier turn. The consequence goes last so
 * the turn ends on it — burying a delayed consequence under a reward is exactly
 * the reading the Delayed Consequence Engine exists to prevent.
 */
function followUps(
  before: GameState,
  after: GameState,
  awarded: GuardianId[],
  districtId: DistrictId,
): FollowUp[] {
  const queue: FollowUp[] = awarded.map((guardianId) => ({ kind: 'award', guardianId }));
  const district = after.districts[districtId];
  if (district.secured && !before.districts[districtId].secured && !district.celebrated) {
    queue.push({ kind: 'secured', districtId });
  }
  for (const pending of dueConsequences(after)) {
    queue.push({ kind: 'consequence', id: pending.id });
  }
  return queue;
}

export const guardianName = (id: GuardianId) => GUARDIAN_BY_ID[id].name;
