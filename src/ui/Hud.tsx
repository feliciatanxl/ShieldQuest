import { useEffect, useRef, useState } from 'react';

import { DISTRICT_ORDER } from '../game/board.ts';
import { GUARDIANS, guardianArt } from '../game/content/guardians.ts';
import { nextUpgrade, turnsRemaining } from '../game/engine.ts';
import { useGame } from '../state/store.ts';
import type { GameState } from '../game/types.ts';

/* ------------------------------------------------------------------ */
/* Counting numbers                                                    */
/* ------------------------------------------------------------------ */

/**
 * Walk a displayed number up to its new value instead of swapping it.
 *
 * A stat that jumps from 160 to 360 is a fact; one that counts is a reward.
 * That is the whole difference, and it is the cheapest piece of game feel in
 * the app — so every number in the HUD goes through here.
 *
 * Reduced motion lands on the value immediately: the count is decoration over
 * a change that has already happened in the engine.
 */
function useCountUp(value: number, duration = 620): number {
  const [shown, setShown] = useState(value);
  /**
   * What is on screen right now, not what the last count started from.
   *
   * A payout can land while an earlier one is still counting — a gate stipend
   * followed immediately by a decision, say. Starting the new count from the
   * previous count's ORIGIN rather than from the digits currently displayed
   * makes the number visibly jump backwards before climbing again.
   */
  const shownRef = useRef(value);
  const rafRef = useRef(0);

  useEffect(() => {
    const from = shownRef.current;
    if (from === value) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      shownRef.current = value;
      setShown(value);
      return;
    }

    const start = performance.now();
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      // Ease out: fast enough to feel responsive, slow at the end so the last
      // few digits are readable rather than a blur.
      const eased = 1 - Math.pow(1 - t, 3);
      const next = Math.round(from + (value - from) * eased);
      shownRef.current = next;
      setShown(next);
      if (t < 1) rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, [value, duration]);

  return shown;
}

/** True for one beat after `value` changes, to drive a pop on the container. */
function useBump(value: number): boolean {
  const [bumping, setBumping] = useState(false);
  const previous = useRef(value);

  useEffect(() => {
    if (previous.current === value) return;
    previous.current = value;
    setBumping(true);
    const timer = window.setTimeout(() => setBumping(false), 420);
    return () => window.clearTimeout(timer);
  }, [value]);

  return bumping;
}

/* ------------------------------------------------------------------ */
/* Currency icons                                                      */
/* ------------------------------------------------------------------ */

/**
 * The two currencies, drawn rather than typed.
 *
 * They are deliberately different SHAPES, not two discs in two colours. Coins
 * and Shield Tokens are the one pair in this game a player must never confuse
 * — one is the city's money and the other is participation credit that buys
 * nothing but a colour — and colour alone would also fail the proposal's
 * commitment to colour-independent status cues.
 */
export function CoinIcon({ size = 18 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true" className="shrink-0">
      <circle cx="12" cy="12.6" r="9.4" fill="#8f5906" />
      <circle cx="12" cy="11" r="9.4" fill="#f2ae33" />
      <circle cx="12" cy="11" r="6.6" fill="#f6c669" />
      <path
        d="M12 6.4l4.2 1.7v2.9c0 2.3-1.7 4.4-4.2 5.2-2.5-.8-4.2-2.9-4.2-5.2V8.1z"
        fill="#8f5906"
      />
    </svg>
  );
}

export function TokenIcon({ size = 18 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true" className="shrink-0">
      <path d="M12 1.6L22.4 12 12 22.4 1.6 12z" fill="#12645c" />
      <path d="M12 4.2L19.8 12 12 19.8 4.2 12z" fill="#35b3a6" />
      <path d="M12 7.6L16.4 12 12 16.4 7.6 12z" fill="#d6edea" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Coin flight                                                         */
/* ------------------------------------------------------------------ */

/**
 * Where coins fly to.
 *
 * Published by the purse as a module-level ref rather than threaded through
 * props or context: the flight layer sits over the BOARD and the purse sits in
 * the HEADER, so they have no common ancestor short of the shell, and putting a
 * rectangle into React state would re-render the board every time the header
 * moved a pixel.
 */
const purseTarget: { current: HTMLElement | null } = { current: null };

/* ------------------------------------------------------------------ */
/* Purse                                                               */
/* ------------------------------------------------------------------ */

/**
 * Coins and Shield Tokens, side by side, with what each one opens.
 *
 * Coins open the works; tokens open Shield Central. A currency a player cannot
 * see a use for is just a number, and the fastest way to teach the split
 * between "the city's money" and "participation credit" is that tapping them
 * goes somewhere different.
 */
export function Purse({
  game,
  onOpenWorks,
  onOpenHub,
}: {
  game: GameState;
  onOpenWorks: () => void;
  onOpenHub: () => void;
}) {
  const coins = useCountUp(game.stats.coins);
  const coinsBumping = useBump(game.stats.coins);
  const tokensBumping = useBump(game.tokens);
  const purseRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    purseTarget.current = purseRef.current;
    return () => {
      purseTarget.current = null;
    };
  }, []);

  const built = DISTRICT_ORDER.reduce((sum, id) => sum + game.districts[id].upgrades, 0);

  return (
    <div className="flex items-center gap-2">
      <button
        ref={purseRef}
        type="button"
        onClick={onOpenWorks}
        data-bump={coinsBumping || undefined}
        className="sq-purse"
        aria-label={`${game.stats.coins} coins. Open city works — ${built} of 12 built.`}
      >
        <CoinIcon size={24} />
        <span className="sq-purse-value tabular-nums">{coins}</span>
        <span className="sq-purse-tag">
          Build <span className="tabular-nums">{built}/12</span>
        </span>
      </button>

      <button
        type="button"
        onClick={onOpenHub}
        data-bump={tokensBumping || undefined}
        className="sq-token-pill"
        aria-label={`${game.tokens} Shield Tokens. Open Shield Central.`}
      >
        <TokenIcon size={18} />
        <span className="text-sm font-extrabold tabular-nums">{game.tokens}</span>
      </button>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* City meters                                                         */
/* ------------------------------------------------------------------ */

function StatMeter({
  label,
  value,
  max,
  colour,
  hint,
}: {
  label: string;
  value: number;
  max: number;
  colour: string;
  hint: string;
}) {
  const shown = useCountUp(value);
  const pct = Math.round((Math.min(value, max) / max) * 100);
  return (
    <div className="min-w-0 flex-1">
      <div className="flex items-baseline justify-between gap-1">
        <span className="truncate text-[10px] font-bold uppercase tracking-wider text-[var(--sq-ink-muted)]">
          {label}
        </span>
        <span className="text-xs font-extrabold tabular-nums">{shown}</span>
      </div>
      <div
        className="sq-stat-bar mt-1"
        role="meter"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={`${label}. ${hint}`}
      >
        <i style={{ width: `${pct}%`, ['--bar' as string]: colour }} />
      </div>
    </div>
  );
}

/**
 * Three meters, and what each one is for.
 *
 * Trust and Risk are what a decision costs the city later, which is why they
 * are meters and not scores — a meter shows a direction, and the direction is
 * the whole point of the Delayed Consequence Engine. Resilience is the only one
 * that can only be earned by protecting someone else.
 *
 * Coins used to sit in this row and no longer do. Money you spend and standing
 * you accumulate are not the same kind of number, and showing them in one grid
 * of four is why the coin count never read as a purse worth opening.
 */
export function StatBar({ game }: { game: GameState }) {
  return (
    <div className="flex items-start gap-3">
      <StatMeter
        label="Trust"
        value={game.stats.trust}
        max={100}
        colour="var(--sq-safe)"
        hint="How much the city trusts the people in it"
      />
      <StatMeter
        label="Risk"
        value={game.stats.risk}
        max={100}
        colour="var(--sq-risk)"
        hint="Exposure built up by risky decisions"
      />
      <StatMeter
        label="Resilience"
        value={game.stats.resilience}
        max={200}
        colour="var(--sq-peer)"
        hint="Community resilience, earned only by protecting other people"
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Guardian strip                                                      */
/* ------------------------------------------------------------------ */

/**
 * Six Guardians, each a ring that fills with demonstrated skill.
 *
 * The ring is the point: a Guardian at 4/8 is visibly half-met, so progress
 * towards one is legible without opening anything. Nothing in this strip can
 * be bought, and the fill only ever moves on a decision.
 */
export function GuardianStrip({ game, onOpen }: { game: GameState; onOpen: () => void }) {
  return (
    <button type="button" onClick={onOpen} className="flex w-full items-center gap-1.5">
      <span className="sr-only">
        Guardians met: {game.metGuardians.length} of {GUARDIANS.length}. Open the skills panel.
      </span>
      {GUARDIANS.map((guardian) => {
        const met = game.metGuardians.includes(guardian.id);
        const progress = Math.min(game.guardianProgress[guardian.id] ?? 0, guardian.target);
        const deg = Math.round((progress / guardian.target) * 360);
        return (
          <span
            key={guardian.id}
            aria-hidden="true"
            title={`${guardian.name} — ${progress}/${guardian.target}`}
            className="sq-guardian-chip"
            data-met={met || undefined}
            style={{ ['--sweep' as string]: `${deg}deg` }}
          >
            <img src={guardianArt(guardian.id)} alt="" />
          </span>
        );
      })}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* Dice                                                                */
/* ------------------------------------------------------------------ */

/**
 * Randomised faces while a roll is in the air.
 *
 * Shared by the roll button and the flat board so they tumble together and stop
 * together. Nothing reads the real values until the renderer says the dice have
 * settled — showing the answer early is the fastest way to make a two-second
 * animation feel like a two-second wait.
 */
export function useDiceTumble(active: boolean): [number, number] {
  const [faces, setFaces] = useState<[number, number]>([1, 1]);

  useEffect(() => {
    if (!active) return;
    const roll = () => 1 + Math.floor(Math.random() * 6);
    const timer = window.setInterval(() => setFaces([roll(), roll()]), 90);
    return () => window.clearInterval(timer);
  }, [active]);

  return faces;
}

const PIP_LAYOUT: Record<number, number[]> = {
  1: [4],
  2: [0, 8],
  3: [0, 4, 8],
  4: [0, 2, 6, 8],
  5: [0, 2, 4, 6, 8],
  6: [0, 2, 3, 5, 6, 8],
};

export function DiceFace({ value }: { value: number }) {
  const pips = PIP_LAYOUT[value] ?? [];
  return (
    <span className="sq-dice-face" aria-hidden="true">
      {Array.from({ length: 9 }, (_, i) => (
        <span key={i} className={pips.includes(i) ? 'sq-pip' : ''} />
      ))}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Roll button                                                         */
/* ------------------------------------------------------------------ */

/**
 * The one control the whole game runs through.
 *
 * Deliberately enormous, at the bottom of the screen, and built like a physical
 * key: a solid darker edge underneath that the button visibly presses into. A
 * participant is holding a phone one-handed in a room with 25 other people, and
 * this is the button they press forty times in a session — it is worth the
 * pixels, and it is worth the four lines of CSS that make it feel like a button
 * rather than a rectangle that changes colour.
 *
 * The dice now ride ON the button, unlike the first version which deliberately
 * kept them off it. That call was right when the pair beside the button was a
 * SECOND, un-animated copy of the roll happening in the middle of the board.
 * These are the same two dice the board is throwing, tumbling in step with it
 * and settling when it settles, so what the thumb is on and what the eye is on
 * are finally the same object.
 */
export function RollButton() {
  const game = useGame((s) => s.game);
  const path = useGame((s) => s.path);
  const overlay = useGame((s) => s.overlay);
  const rolling = useGame((s) => s.rolling);
  const dice = useGame((s) => s.dice);
  const roll = useGame((s) => s.roll);
  const tumble = useDiceTumble(rolling);

  if (!game) return null;

  const busy = path.length > 0 || overlay.kind !== 'none';
  const remaining = turnsRemaining(game);
  const finished = remaining <= 0;
  const faces: [number, number] = rolling ? tumble : [dice?.a ?? 1, dice?.b ?? 1];

  return (
    <button
      type="button"
      onClick={roll}
      disabled={busy}
      data-finished={finished || undefined}
      className="sq-roll"
    >
      <span className="sq-roll-dice" data-rolling={rolling || undefined} aria-hidden="true">
        <DiceFace value={faces[0]} />
        <DiceFace value={faces[1]} />
      </span>

      <span className="min-w-0 flex-1 text-left">
        <span className="block text-xl font-extrabold leading-tight tracking-wide">
          {finished ? 'See your results' : rolling ? 'Rolling…' : busy ? 'Playing…' : 'ROLL'}
        </span>
        <span className="block text-[11px] font-semibold opacity-90">
          {finished
            ? 'The run is over'
            : dice && !rolling && !busy
              ? `Last roll ${dice.total}${dice.isDouble ? ' · double, extra turn' : ''}`
              : Number.isFinite(remaining)
                ? `${remaining} turn${remaining === 1 ? '' : 's'} left`
                : 'Open session'}
        </span>
      </span>

      {!busy && !finished ? <span aria-hidden="true" className="sq-roll-sheen" /> : null}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* Flash                                                               */
/* ------------------------------------------------------------------ */

/**
 * The payout, in the middle of the board.
 *
 * It is loudest for the risky choice on purpose. If taking the money does not
 * feel good, the consequence two turns later teaches nothing — the Delayed
 * Consequence Engine only works if the immediate reward is genuinely attractive
 * at the moment it is offered.
 *
 * Coins EARNED physically fly into the purse. Coins lost do not: a reversal is
 * the lesson landing, and animating it as a reward played backwards would make
 * a joke of it.
 */
export function FlashLayer() {
  const flash = useGame((s) => s.flash);
  const clearFlash = useGame((s) => s.clearFlash);
  const [visible, setVisible] = useState(flash);
  const [coins, setCoins] = useState<{ id: number; dx: number; dy: number; delay: number }[]>([]);
  const layerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!flash) return;
    setVisible(flash);

    const gained = flash.deltas.coins ?? 0;
    const target = purseTarget.current;
    const layer = layerRef.current;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (gained > 0 && target && layer && !reduced) {
      const to = target.getBoundingClientRect();
      const from = layer.getBoundingClientRect();
      const dx = to.left + to.width / 2 - (from.left + from.width / 2);
      const dy = to.top + to.height / 2 - (from.top + from.height / 2);
      setCoins(
        Array.from({ length: 9 }, (_, i) => ({
          id: flash.id * 100 + i,
          // Fanned, so nine coins read as a handful rather than one sprite
          // drawn nine times along the same line.
          dx: dx + ((i % 3) - 1) * 12,
          dy: dy + (Math.floor(i / 3) - 1) * 9,
          delay: i * 0.045,
        })),
      );
    }

    const timer = window.setTimeout(() => {
      setVisible(null);
      setCoins([]);
      clearFlash();
    }, 1600);
    return () => window.clearTimeout(timer);
  }, [flash, clearFlash]);

  const colour =
    visible?.outcome === 'RISKY'
      ? 'var(--sq-earned-text)'
      : visible?.outcome === 'SAFE'
        ? 'var(--sq-safe)'
        : 'var(--sq-ink)';

  return (
    <div ref={layerRef} className="pointer-events-none absolute inset-x-0 top-1/3 z-40">
      {visible ? (
        <>
          <p key={`label-${visible.id}`} className="sq-float-label">
            {visible.title}
          </p>
          {visible.amount ? (
            <p key={visible.id} className="sq-float-value" style={{ color: colour }}>
              {visible.amount}
            </p>
          ) : null}
        </>
      ) : null}

      {coins.map((coin) => (
        <span
          key={coin.id}
          aria-hidden="true"
          className="sq-coin-fly"
          style={{
            ['--dx' as string]: `${coin.dx}px`,
            ['--dy' as string]: `${coin.dy}px`,
            animationDelay: `${coin.delay}s`,
          }}
        >
          <CoinIcon size={24} />
        </span>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Build prompt                                                        */
/* ------------------------------------------------------------------ */

/**
 * "You can afford a work" — offered, never nagged.
 *
 * It appears only when the player can actually pay for something and only
 * between turns, and it says exactly what they could buy and what it costs. A
 * player who ignores it loses nothing: the works are also behind the purse,
 * which is always there.
 *
 * It lives in the empty sky above the board, which is space a portrait phone
 * has going spare — the board is square and the screen is not.
 */
export function BuildNudge({ game, onOpen }: { game: GameState; onOpen: () => void }) {
  const path = useGame((s) => s.path);
  const overlayKind = useGame((s) => s.overlay.kind);

  if (path.length > 0 || overlayKind !== 'none') return null;

  for (const districtId of DISTRICT_ORDER) {
    const upcoming = nextUpgrade(game, districtId);
    if (!upcoming || game.stats.coins < upcoming.cost) continue;
    return (
      <button type="button" onClick={onOpen} className="sq-build-nudge">
        <CoinIcon size={20} />
        <span className="min-w-0">
          <span className="block text-[10px] font-bold uppercase tracking-wider opacity-80">
            Ready to build
          </span>
          <span className="block truncate text-sm font-extrabold">{upcoming.name}</span>
        </span>
        <span className="sq-build-nudge-cost tabular-nums">{upcoming.cost}</span>
      </button>
    );
  }
  return null;
}

/* ------------------------------------------------------------------ */
/* Confetti                                                            */
/* ------------------------------------------------------------------ */

const CONFETTI_COLOURS = ['#f2ae33', '#5fa0e8', '#35b3a6', '#55bb8e', '#ffffff'];

/** Plays once per celebration tick. Purely decorative, hidden from assistive tech. */
export function Confetti({ trigger }: { trigger: number }) {
  const [burst, setBurst] = useState(0);

  useEffect(() => {
    if (trigger === 0) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    setBurst(trigger);
    const timer = window.setTimeout(() => setBurst(0), 2600);
    return () => window.clearTimeout(timer);
  }, [trigger]);

  if (burst === 0) return null;

  return (
    <div className="sq-confetti" aria-hidden="true">
      {Array.from({ length: 46 }, (_, i) => (
        <span
          key={`${burst}-${i}`}
          style={{
            left: `${(i * 97) % 100}%`,
            background: CONFETTI_COLOURS[i % CONFETTI_COLOURS.length],
            animationDelay: `${(i % 12) * 0.06}s`,
            ['--drift' as string]: `${((i % 7) - 3) * 26}px`,
          }}
        />
      ))}
    </div>
  );
}
