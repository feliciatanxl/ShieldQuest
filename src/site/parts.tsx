import type { ReactNode } from 'react';

import { navigate } from '../router.ts';

/**
 * Public-site building blocks.
 *
 * The site runs on the DEFAULT skin — the light "civic" one — because its
 * audience is educators, schools and grant assessors rather than players. It
 * sets no `data-skin`, so every token here resolves to the light ramp while the
 * exact same component code would be correct inside the dark player shell.
 * That is the point of two skins on one spine.
 */

/* ------------------------------------------------------------------ */
/* Section                                                             */
/* ------------------------------------------------------------------ */

type Tone = 'surface' | 'sunk' | 'inverse';

const TONES: Record<Tone, string> = {
  surface: 'bg-[var(--sq-surface)]',
  sunk: 'bg-[var(--sq-surface-sunk)]',
  // Navy bands. Used sparingly — twice on the page — for the two ideas an
  // assessor should still remember afterwards.
  inverse: 'bg-[var(--color-navy-950)]',
};

export function Section({
  id,
  tone = 'surface',
  children,
}: {
  id: string;
  tone?: Tone;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      className={`scroll-mt-20 border-b border-[var(--sq-line)] py-16 sm:py-20 ${TONES[tone]}`}
    >
      <div className="mx-auto max-w-6xl px-5 sm:px-8">{children}</div>
    </section>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  lede,
  inverse,
}: {
  eyebrow: string;
  title: string;
  lede?: string;
  inverse?: boolean;
}) {
  return (
    <header className="max-w-3xl">
      <p
        className={`text-xs font-extrabold uppercase tracking-[0.16em] ${
          inverse ? 'text-[var(--color-amber-400)]' : 'text-[var(--sq-action-text)]'
        }`}
      >
        {eyebrow}
      </p>
      <h2
        className={`mt-3 text-3xl font-black leading-tight tracking-tight sm:text-4xl ${
          inverse ? 'text-white' : 'text-[var(--sq-ink)]'
        }`}
      >
        {title}
      </h2>
      {lede ? (
        <p
          className={`mt-4 text-base leading-relaxed ${
            inverse ? 'text-[var(--color-navy-200)]' : 'text-[var(--sq-ink-muted)]'
          }`}
        >
          {lede}
        </p>
      ) : null}
    </header>
  );
}

/* ------------------------------------------------------------------ */
/* Stat                                                                */
/* ------------------------------------------------------------------ */

/**
 * A figure with its source attached.
 *
 * The source is not optional and is never in a footnote. Assessors check
 * numbers, and an unattributed crime statistic on a crime-prevention site does
 * more harm than leaving the statistic out. Every figure on this site traces to
 * a named Singapore Police Force brief — which is a statistics source, not a
 * backer, and must never be presented as an endorsement.
 */
export function Stat({ value, label, source }: { value: string; label: string; source: string }) {
  return (
    <div className="flex flex-col rounded-[var(--radius-card)] border border-[var(--sq-line)] bg-[var(--sq-surface)] p-5">
      <p className="text-3xl font-black tracking-tight text-[var(--sq-ink)]">{value}</p>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-[var(--sq-ink-muted)]">{label}</p>
      <p className="mt-3 border-t border-[var(--sq-line)] pt-2.5 text-[11px] font-medium leading-snug text-[var(--sq-ink-muted)] opacity-75">
        {source}
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Buttons and links                                                   */
/* ------------------------------------------------------------------ */

type SiteButtonVariant = 'primary' | 'secondary' | 'gold';

const BUTTONS: Record<SiteButtonVariant, string> = {
  primary: 'bg-[var(--sq-action)] text-white hover:bg-[var(--sq-action-hover)]',
  secondary:
    'bg-[var(--sq-surface)] text-[var(--sq-ink)] border border-[var(--sq-line-strong)] hover:border-[var(--sq-action-text)]',
  // Amber never carries white ink; it is 2.5:1. Earned/gold fills take navy.
  gold: 'bg-[var(--sq-earned)] text-[var(--color-navy-950)] hover:brightness-105',
};

export function SiteButton({
  children,
  variant = 'primary',
  className = '',
  ...rest
}: {
  children: ReactNode;
  variant?: SiteButtonVariant;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...rest}
      className={`inline-flex items-center justify-center gap-2 rounded-[var(--radius-control)] px-5 py-3 text-sm font-bold transition-[background-color,transform,filter,border-color] duration-150 active:scale-[0.98] ${BUTTONS[variant]} ${className}`}
    >
      {children}
    </button>
  );
}

/**
 * An in-page or in-app link that is a real anchor.
 *
 * Rendered as `<a href>` rather than a button so it can be opened in a new tab,
 * copied, and read as a link by assistive technology — then intercepted for
 * plain clicks so navigation stays client-side.
 */
export function SiteLink({
  to,
  children,
  className = '',
}: {
  to: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <a
      href={to}
      className={className}
      onClick={(event) => {
        // Leave modified clicks alone: ctrl/cmd/shift/middle-click mean "open
        // this somewhere else", and hijacking them is a bug, not a feature.
        if (event.defaultPrevented) return;
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        if (event.button !== 0) return;
        event.preventDefault();
        navigate(to);
      }}
    >
      {children}
    </a>
  );
}

/** The navy "callout" card used inside light sections. */
export function Callout({
  title,
  children,
  tone = 'action',
}: {
  title: string;
  children: ReactNode;
  tone?: 'action' | 'risk' | 'peer';
}) {
  const styles = {
    action: {
      border: 'color-mix(in oklab, var(--sq-action) 28%, transparent)',
      background: 'var(--color-civic-50)',
      heading: 'var(--color-civic-900)',
      body: 'var(--color-civic-900)',
    },
    risk: {
      border: 'color-mix(in oklab, var(--sq-risk) 32%, transparent)',
      background: 'var(--color-coral-50)',
      heading: 'var(--color-coral-800)',
      body: 'var(--color-coral-800)',
    },
    peer: {
      border: 'color-mix(in oklab, var(--sq-peer) 32%, transparent)',
      background: 'var(--color-teal-50)',
      heading: 'var(--color-teal-800)',
      body: 'var(--color-teal-800)',
    },
  }[tone];

  return (
    <div
      className="rounded-[var(--radius-card)] border p-6"
      style={{ borderColor: styles.border, background: styles.background }}
    >
      <h3 className="text-base font-extrabold" style={{ color: styles.heading }}>
        {title}
      </h3>
      <div className="mt-2 text-sm leading-relaxed" style={{ color: styles.body, opacity: 0.9 }}>
        {children}
      </div>
    </div>
  );
}
