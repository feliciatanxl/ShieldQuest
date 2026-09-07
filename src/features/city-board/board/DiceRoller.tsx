import { useEffect, useState } from 'react';
import type { TurnPhase } from '../hooks/useDiceTurn';
import { Sparkles } from 'lucide-react';

/** Pip layout per face, on a 3×3 grid read left to right, top to bottom. */
const FACES: Record<number, boolean[]> = {
  1: [false, false, false, false, true, false, false, false, false],
  2: [true, false, false, false, false, false, false, false, true],
  3: [true, false, false, false, true, false, false, false, true],
  4: [true, false, true, false, false, false, true, false, true],
  5: [true, false, true, false, true, false, true, false, true],
  6: [true, false, true, true, false, true, true, false, true],
};

export function Die({
  value,
  className = 'h-10 w-10',
  tumbling = false,
}: {
  value: number;
  className?: string;
  tumbling?: boolean;
}) {
  const pips = FACES[value] ?? FACES[1];
  return (
    <span
      aria-hidden="true"
      className={`grid shrink-0 grid-cols-3 gap-[2.5px] rounded-xl border-2 border-navy-950/20 bg-white p-1.5 shadow-[0_6px_12px_rgba(0,0,0,0.35),inset_0_-3px_0_rgba(11,37,69,0.18)] ${className} ${
        tumbling ? 'animate-tumble' : 'transition-transform duration-200 hover:scale-105'
      }`}
    >
      {pips.map((on, i) => (
        <span
          key={i}
          className={`rounded-full transition-all ${
            on ? 'bg-navy-950 shadow-inner' : 'bg-transparent'
          }`}
        />
      ))}
    </span>
  );
}

export function DiceRoller({
  phase,
  value,
  onRoll,
  disabled,
}: {
  phase: TurnPhase;
  value: number | null;
  onRoll: () => void;
  disabled?: boolean;
}) {
  const rolling = phase === 'rolling';
  const showing = phase === 'result' || phase === 'moving';
  const [cycleValue, setCycleValue] = useState<number>(1);

  useEffect(() => {
    if (!rolling) return;
    const interval = setInterval(() => {
      setCycleValue((prev) => (prev % 6) + 1);
    }, 75);
    return () => clearInterval(interval);
  }, [rolling]);

  const handleRoll = () => {
    if (disabled || rolling) return;
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate?.(35);
      } catch {
        // Haptics optional
      }
    }
    onRoll();
  };

  return (
    <div className="dice-action-panel relative z-40 mx-auto w-full max-w-sm">
      <div className="rounded-3xl border-2 border-white/20 bg-navy-950/90 p-2 shadow-[0_16px_36px_rgba(0,0,0,0.9),inset_0_1px_0_rgba(255,255,255,0.15)] backdrop-blur-md">
        {showing && value !== null ? (
          <div
            className="animate-pop flex min-h-[64px] items-center justify-center gap-4 rounded-2xl border-2 border-amber-400 bg-gradient-to-r from-navy-900 via-navy-850 to-navy-900 px-5 shadow-lg shadow-amber-500/20"
            role="status"
            aria-live="polite"
          >
            <span className="text-[12px] font-black uppercase tracking-[0.2em] text-amber-300">
              Rolled
            </span>
            <Die value={value} className="h-12 w-12" />
            <span className="text-[34px] font-black leading-none tabular-nums text-white drop-shadow-md">
              {value}
            </span>
            <Sparkles className="h-5 w-5 text-amber-400 animate-pulse" />
          </div>
        ) : (
          <button
            type="button"
            onClick={handleRoll}
            disabled={disabled || rolling}
            className="group relative flex min-h-[64px] w-full items-center justify-between gap-3 overflow-hidden rounded-2xl border-b-4 border-amber-800 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400 px-5 text-navy-950 shadow-xl shadow-amber-500/25 transition active:translate-y-1 active:border-b-0 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {/* Shimmer Highlight */}
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent opacity-0 transition-opacity group-hover:opacity-100"
            />

            <div className="flex flex-col items-start leading-none">
              <span className="text-[10px] font-black uppercase tracking-[0.22em] text-navy-950/75">
                {rolling ? 'Advancing…' : 'Your Turn'}
              </span>
              <span className="mt-1 text-[20px] font-black uppercase tracking-wider text-navy-950">
                {rolling ? 'Rolling…' : 'Roll Dice'}
              </span>
            </div>

            {/* Tumbling Dice View */}
            <div className="flex items-center gap-2">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-navy-950/10 shadow-inner">
                <Die
                  value={rolling ? cycleValue : 5}
                  className="h-9 w-9"
                  tumbling={rolling}
                />
              </div>
            </div>
          </button>
        )}
      </div>
    </div>
  );
}
