import React from 'react';

/**
 * Page section rhythm.
 *
 * The public site previously alternated `bg-white`, `bg-slate-50`,
 * `bg-slate-100`, `bg-navy-950` and a pair of one-off gradients across eleven
 * hand-rolled sections, with no rule for which came next. The result read as
 * eleven unrelated pages stacked together.
 *
 * The rule now: sections alternate between exactly two quiet tones (`surface`
 * and `sunk`), and `inverse` is spent sparingly — at most twice per page — to
 * mark a genuine shift in register. On the landing page those two moments are
 * the S.H.I.E.L.D. framework and the safety/privacy commitment: the two things
 * an evaluator most needs to remember.
 */
export type SectionTone = 'surface' | 'sunk' | 'inverse';

const toneStyles: Record<SectionTone, string> = {
  surface: 'bg-[var(--sq-surface)] text-[var(--sq-ink)]',
  sunk: 'bg-[var(--sq-surface-sunk)] text-[var(--sq-ink)]',
  inverse: 'bg-[var(--color-navy-950)] text-white',
};

export function Section({
  tone = 'surface',
  id,
  children,
  className = '',
  bleed = false,
}: {
  tone?: SectionTone;
  id?: string;
  children: React.ReactNode;
  className?: string;
  /** Skip the inner max-width container — for full-bleed layouts. */
  bleed?: boolean;
}) {
  return (
    <section
      id={id}
      className={`scroll-mt-20 border-b border-[var(--sq-line)] py-16 sm:py-20 ${toneStyles[tone]} ${className}`}
    >
      {bleed ? children : <div className="mx-auto max-w-6xl px-5 sm:px-8">{children}</div>}
    </section>
  );
}

/**
 * The small uppercase label above a section heading. Purely typographic
 * hierarchy — it must never be the only thing carrying meaning, since it is
 * visually quiet and read late by screen readers.
 */
export function Eyebrow({
  children,
  tone = 'action',
  className = '',
}: {
  children: React.ReactNode;
  tone?: 'action' | 'muted' | 'inverse';
  className?: string;
}) {
  const tones = {
    action: 'text-[var(--sq-action-text)]',
    muted: 'text-[var(--sq-ink-muted)]',
    inverse: 'text-[var(--color-civic-300)]',
  };
  return (
    <p className={`text-xs font-extrabold uppercase tracking-[0.14em] ${tones[tone]} ${className}`}>
      {children}
    </p>
  );
}

/**
 * Section heading block. Centred by default because most landing sections are
 * centred; pass `align="start"` for split layouts.
 */
export function SectionHeading({
  eyebrow,
  title,
  lede,
  align = 'center',
  inverse = false,
}: {
  eyebrow?: string;
  title: React.ReactNode;
  lede?: React.ReactNode;
  align?: 'center' | 'start';
  inverse?: boolean;
}) {
  return (
    <div
      className={
        align === 'center' ? 'mx-auto max-w-2xl text-center' : 'max-w-2xl text-left'
      }
    >
      {eyebrow && <Eyebrow tone={inverse ? 'inverse' : 'action'}>{eyebrow}</Eyebrow>}
      <h2
        className={`mt-2.5 text-3xl font-black tracking-tight sm:text-4xl ${
          inverse ? 'text-white' : 'text-[var(--sq-ink)]'
        }`}
      >
        {title}
      </h2>
      {lede && (
        <p
          className={`mt-4 text-base leading-relaxed ${
            inverse ? 'text-[var(--color-navy-200)]' : 'text-[var(--sq-ink-muted)]'
          }`}
        >
          {lede}
        </p>
      )}
    </div>
  );
}
