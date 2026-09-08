import type { ReactNode } from 'react';
import { COMPETENCY_LABEL, COMPETENCY_LETTER, type Competency } from '../../types/guardians';

/**
 * The S.H.I.E.L.D. framework surfaces here and nowhere else — a small badge at
 * the moment a skill is practised, rather than a page of academic text.
 *
 * Both components below read their colours from the skin instead of taking a
 * `tone: 'light' | 'dark'` prop. That prop was the same trap that made
 * `BrandMark`'s wordmark disappear: it asked every caller to remember which
 * kind of surface it was sitting on, and one that forgot rendered
 * `text-ink-soft` on a `civic-50` tint inside the dark player skin — 1.95:1.
 *
 * The `overDark` escape hatch is for the one genuine case the skin cannot
 * express: a panel that is deliberately darker than its own skin's surface,
 * such as the consequence takeover.
 */
export function SkillBadge({
  competency,
  caption = 'Skill practised',
  overDark = false,
}: {
  competency: Competency;
  caption?: string;
  /** For panels intentionally darker than the surrounding skin. */
  overDark?: boolean;
}) {
  return (
    <div
      className={`inline-flex items-center gap-2.5 rounded-[10px] border px-3 py-2 ${
        overDark
          ? 'border-white/15 bg-white/10'
          : 'border-[var(--sq-action)]/30 bg-[var(--sq-action)]/12'
      }`}
    >
      <span
        aria-hidden="true"
        className="grid h-7 w-7 shrink-0 place-items-center rounded-[6px] bg-[var(--sq-action)] text-sm font-extrabold text-[var(--sq-action-ink)]"
      >
        {COMPETENCY_LETTER[competency]}
      </span>
      <span className="leading-tight">
        <span
          className={`block text-[11px] font-bold uppercase tracking-[0.12em] ${
            overDark ? 'text-white/70' : 'text-[var(--sq-ink-muted)]'
          }`}
        >
          {caption}
        </span>
        <span
          className={`block text-[13px] font-semibold ${
            overDark ? 'text-white' : 'text-[var(--sq-ink)]'
          }`}
        >
          {COMPETENCY_LETTER[competency]} — {COMPETENCY_LABEL[competency]}
        </span>
      </span>
    </div>
  );
}

/** Small uppercase section heading used throughout the debrief surfaces. */
export function SectionLabel({
  children,
  overDark = false,
}: {
  children: ReactNode;
  /** For panels intentionally darker than the surrounding skin. */
  overDark?: boolean;
}) {
  return (
    <h3
      className={`text-[11px] font-bold uppercase tracking-[0.12em] ${
        overDark ? 'text-white/65' : 'text-[var(--sq-ink-muted)]'
      }`}
    >
      {children}
    </h3>
  );
}
