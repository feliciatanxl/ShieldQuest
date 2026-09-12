import { useEffect, useState } from 'react';

import { GUARDIANS, guardianArt } from '../game/content/guardians.ts';
import { turnsRemaining } from '../game/engine.ts';
import { useGame } from '../state/store.ts';
import { Meter } from './primitives.tsx';
import type { GameState } from '../game/types.ts';

/* ------------------------------------------------------------------ */
/* Stat bar                                                            */
/* ------------------------------------------------------------------ */

/**
 * Four numbers, and what each one is for.
 *
 * Coins are what a decision pays now. Trust and Risk are what it costs the city
 * later, which is why they are meters and not scores — a meter shows a
 * direction, and the direction is the whole point of the Delayed Consequence
 * Engine. Resilience is the only one that can only be earned by protecting
 * someone else.
 */
export function StatBar({ game }: { game: GameState }) {
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-4">
      <div>
        <div className="flex items-baseline justify-between gap-2 text-[11px] font-medium">
          <span className="text-[var(--sq-ink-muted)]">Coins</span>
          <span className="tabular-nums text-base font-bold text-[var(--sq-earned-text)]">
            {game.stats.coins}
          </span>
        </div>
        <p className="mt-1 text-[10px] leading-tight text-[var(--sq-ink-muted)]">
          Spend on district works
        </p>
      </div>
      <Meter
        label="City Trust"
        value={game.stats.trust}
        colour="var(--sq-safe)"
        hint="How much the city trusts the people in it"
      />
      <Meter
        label="Risk"
        value={game.stats.risk}
        colour="var(--sq-risk)"
        hint="Exposure built up by risky decisions"
      />
      <Meter
        label="Resilience"
        value={game.stats.resilience}
        max={200}
        colour="var(--sq-peer)"
        hint="Earned only by protecting other people"
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Guardian strip                                                      */
/* ------------------------------------------------------------------ */

export function GuardianStrip({ game, onOpen }: { game: GameState; onOpen: () => void }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="flex w-full items-center gap-2 rounded-[var(--radius-control)] px-1 py-1 text-left"
    >
      <span className="sr-only">
        Guardians met: {game.metGuardians.length} of {GUARDIANS.length}. Open the skills panel.
      </span>
      {GUARDIANS.map((guardian) => {
        const met = game.metGuardians.includes(guardian.id);
        const progress = Math.min(game.guardianProgress[guardian.id] ?? 0, guardian.target);
        return (
          <span
            key={guardian.id}
            aria-hidden="true"
            title={`${guardian.name} — ${progress}/${guardian.target}`}
            className="relative grid h-9 w-9 flex-1 place-content-center rounded-full border transition-colors"
            style={{
              borderColor: met ? 'var(--sq-earned)' : 'var(--sq-line)',
              background: met
                ? 'color-mix(in oklab, var(--sq-earned) 18%, transparent)'
                : 'transparent',
              opacity: met ? 1 : 0.45 + (progress / guardian.target) * 0.35,
            }}
          >
            <img src={guardianArt(guardian.id)} alt="" className="h-6 w-6" />
          </span>
        );
      })}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* Dice                                                                */
/* ------------------------------------------------------------------ */

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

/**
 * The one control the whole game runs through.
 *
 * Deliberately enormous and at the bottom of the screen: a participant is
 * holding a phone one-handed in a room with 25 other people, and this is the
 * button they press forty times in a session.
 */
export function RollButton() {
  const game = useGame((s) => s.game);
  const path = useGame((s) => s.path);
  const dice = useGame((s) => s.dice);
  const overlay = useGame((s) => s.overlay);
  const roll = useGame((s) => s.roll);

  if (!game) return null;

  const busy = path.length > 0 || overlay.kind !== 'none';
  const remaining = turnsRemaining(game);
  const finished = remaining <= 0;

  return (
    <div className="flex items-center gap-3">
      <div className="flex gap-2" aria-hidden="true">
        <DiceFace value={dice?.a ?? 1} />
        <DiceFace value={dice?.b ?? 1} />
      </div>
      <button
        type="button"
        onClick={roll}
        disabled={busy}
        className="relative flex-1 overflow-hidden rounded-[var(--radius-card)] bg-[var(--sq-action)] px-5 py-4 text-left text-[var(--sq-action-ink)] shadow-[var(--sq-shadow-raised)] transition-transform active:scale-[0.98] disabled:opacity-45"
      >
        <span className="block text-lg font-bold leading-tight">
          {finished ? 'See your results' : busy ? 'Playing…' : 'Roll the dice'}
        </span>
        <span className="block text-xs opacity-90">
          {finished
            ? 'The run is over'
            : Number.isFinite(remaining)
              ? `${remaining} turn${remaining === 1 ? '' : 's'} left`
              : 'Open session'}
        </span>
        {!busy && !finished ? (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 w-16 bg-white/20"
            style={{ animation: 'sq-sweep 3.4s ease-out infinite' }}
          />
        ) : null}
      </button>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Flash                                                               */
/* ------------------------------------------------------------------ */

/**
 * The number that flies up when a decision pays out.
 *
 * It is loudest for the risky choice on purpose. If taking the money does not
 * feel good, the consequence two turns later teaches nothing.
 */
export function FlashLayer() {
  const flash = useGame((s) => s.flash);
  const clearFlash = useGame((s) => s.clearFlash);
  const [visible, setVisible] = useState(flash);

  useEffect(() => {
    if (!flash) return;
    setVisible(flash);
    const timer = window.setTimeout(() => {
      setVisible(null);
      clearFlash();
    }, 1500);
    return () => window.clearTimeout(timer);
  }, [flash, clearFlash]);

  if (!visible) return null;

  const colour =
    visible.outcome === 'RISKY'
      ? 'var(--sq-earned-text)'
      : visible.outcome === 'SAFE'
        ? 'var(--sq-safe)'
        : 'var(--sq-ink)';

  return (
    <div className="pointer-events-none absolute inset-x-0 top-1/3 z-40">
      <p key={visible.id} className="sq-float-value text-2xl" style={{ color: colour }}>
        {visible.amount ?? visible.title}
      </p>
    </div>
  );
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
