import { useEffect, useRef, type ReactNode } from 'react';

import { COMPETENCY_LABEL, COMPETENCY_LETTER, type ChoiceOutcome, type Competency } from '../game/types.ts';

/* ------------------------------------------------------------------ */
/* Button                                                              */
/* ------------------------------------------------------------------ */

type ButtonVariant = 'primary' | 'quiet' | 'ghost' | 'earned' | 'safe' | 'risk';

const VARIANTS: Record<ButtonVariant, string> = {
  primary: 'bg-[var(--sq-action)] text-[var(--sq-action-ink)] hover:bg-[var(--sq-action-hover)]',
  quiet:
    'bg-[var(--sq-surface-raised)] text-[var(--sq-ink)] border border-[var(--sq-line-strong)] hover:border-[var(--sq-action-text)]',
  ghost: 'bg-transparent text-[var(--sq-ink-muted)] hover:text-[var(--sq-ink)]',
  // Amber never carries white ink — it is 2.5:1. Earned fills take navy ink.
  earned: 'bg-[var(--sq-earned)] text-[var(--color-navy-950)] hover:brightness-105',
  safe: 'bg-[var(--sq-safe-fill)] text-white hover:brightness-110',
  risk: 'bg-[var(--sq-risk-fill)] text-white hover:brightness-110',
};

export function Button({
  children,
  variant = 'primary',
  full,
  className = '',
  ...rest
}: {
  children: ReactNode;
  variant?: ButtonVariant;
  full?: boolean;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...rest}
      className={`inline-flex items-center justify-center gap-2 rounded-[var(--radius-control)] px-4 py-3 text-sm font-semibold transition-[background-color,transform,filter] duration-150 active:scale-[0.98] ${VARIANTS[variant]} ${full ? 'w-full' : ''} ${className}`}
    >
      {children}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* Sheet                                                               */
/* ------------------------------------------------------------------ */

/**
 * A bottom sheet on a phone, a centred panel on a laptop.
 *
 * Focus is moved into the panel on open and the sheet traps Tab, because the
 * board behind it is a grid of 28 focusable buttons — without a trap, a
 * keyboard user tabs off the decision they are being asked to make and into
 * the board underneath it.
 */
export function Sheet({
  children,
  labelledBy,
  onDismiss,
  tone = 'default',
}: {
  children: ReactNode;
  labelledBy: string;
  /** Omitted when a decision is required — those sheets have no way out. */
  onDismiss?: () => void;
  tone?: 'default' | 'risk' | 'earned';
}) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;
    const previous = document.activeElement as HTMLElement | null;
    const focusable = panel.querySelector<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );
    (focusable ?? panel).focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape' && onDismiss) {
        event.preventDefault();
        onDismiss();
        return;
      }
      if (event.key !== 'Tab') return;
      const items = panel!.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      if (items.length === 0) return;
      const first = items[0]!;
      const last = items[items.length - 1]!;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      previous?.focus?.();
    };
  }, [onDismiss]);

  const accent =
    tone === 'risk'
      ? 'border-t-4 border-t-[var(--sq-risk)]'
      : tone === 'earned'
        ? 'border-t-4 border-t-[var(--sq-earned)]'
        : '';

  return (
    <div className="sq-sheet" role="presentation">
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        tabIndex={-1}
        className={`sq-sheet-panel sq-slide-up ${accent}`}
      >
        {children}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Status                                                              */
/* ------------------------------------------------------------------ */

/**
 * Outcome is never carried by colour alone.
 *
 * The accessibility commitment in the proposal calls for colour-independent
 * status cues, and this is the component that keeps that promise: every badge
 * pairs its colour with a word and a shape.
 */
export function OutcomeBadge({ outcome }: { outcome: ChoiceOutcome }) {
  const config = {
    SAFE: { label: 'Safer choice', mark: '✓', colour: 'var(--sq-safe)' },
    CAUTIOUS: { label: 'Partly there', mark: '~', colour: 'var(--sq-earned-text)' },
    RISKY: { label: 'Risky choice', mark: '!', colour: 'var(--sq-risk)' },
  }[outcome];

  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-[var(--radius-control)] border px-2.5 py-1 text-xs font-semibold"
      style={{ color: config.colour, borderColor: config.colour }}
    >
      <span aria-hidden="true">{config.mark}</span>
      {config.label}
    </span>
  );
}

export function CompetencyChip({ competency }: { competency: Competency }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-[var(--radius-control)] bg-[var(--sq-surface-sunk)] px-2.5 py-1 text-xs font-medium text-[var(--sq-ink-muted)]">
      <span
        aria-hidden="true"
        className="grid h-5 w-5 place-content-center rounded-[var(--radius-inset)] bg-[var(--sq-action)] text-[10px] font-bold text-[var(--sq-action-ink)]"
      >
        {COMPETENCY_LETTER[competency]}
      </span>
      {COMPETENCY_LABEL[competency]}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Meter                                                               */
/* ------------------------------------------------------------------ */

export function Meter({
  label,
  value,
  max = 100,
  colour,
  hint,
}: {
  label: string;
  value: number;
  max?: number;
  colour: string;
  hint?: string;
}) {
  const pct = Math.round((Math.min(value, max) / max) * 100);
  return (
    <div>
      <div className="flex items-baseline justify-between gap-2 text-[11px] font-medium">
        <span className="text-[var(--sq-ink-muted)]">{label}</span>
        <span className="tabular-nums text-[var(--sq-ink)]">{value}</span>
      </div>
      <div
        className="sq-meter mt-1"
        role="meter"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={hint ? `${label}. ${hint}` : label}
      >
        <i style={{ width: `${pct}%`, ['--meter-colour' as string]: colour }} />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Live region                                                         */
/* ------------------------------------------------------------------ */

/**
 * Everything the 3D board says without words, said in words.
 *
 * The dice tumbling, the token hopping and the camera pushing in are all
 * decoration over a state change. This announces the change itself, so the
 * board is followable with the screen off.
 */
export function Announcer({ message }: { message: string }) {
  return (
    <p aria-live="polite" role="status" className="sr-only">
      {message}
    </p>
  );
}
