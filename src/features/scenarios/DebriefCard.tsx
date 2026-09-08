import { Check, Lightbulb, MessageSquareQuote, ShieldAlert } from 'lucide-react';
import { SectionLabel, SkillBadge } from '../../components/SkillBadges';
import { GuardianProgressNote } from '../guardians/GuardianCard';
import type {
  ChoiceOutcome,
  DecisionDebrief,
  Deltas,
  GuardianAward,
} from '../../../types/scenarios';

const OUTCOME_STYLE: Record<ChoiceOutcome, { wrap: string; head: string; Icon: typeof Check }> = {
  SAFE: {
    wrap: 'border-[var(--sq-safe)]/40 bg-[var(--sq-safe)]/15',
    head: 'text-[var(--sq-safe)]',
    Icon: Check,
  },
  CAUTIOUS: {
    wrap: 'border-[var(--sq-earned)]/40 bg-[var(--sq-earned)]/15',
    head: 'text-[var(--sq-earned-text)]',
    Icon: Lightbulb,
  },
  RISKY: {
    wrap: 'border-[var(--sq-risk)]/40 bg-[var(--sq-risk)]/15',
    head: 'text-[var(--sq-risk)]',
    Icon: ShieldAlert,
  },
};

/** Human-readable stat movements, e.g. "Trust +10". */
export function deltaLines(deltas: Deltas): string[] {
  const out: string[] = [];
  const push = (label: string, n?: number) => {
    if (n) out.push(`${label} ${n > 0 ? '+' : ''}${n}`);
  };
  push('Trust', deltas.trust);
  push('Risk', deltas.risk);
  push('Community Resilience', deltas.resilience);
  return out;
}

/**
 * The teaching payload for every non-delayed outcome. Never just "Correct!" —
 * the player is told what they acted on and which skill it exercised.
 */
export function DebriefCard({
  outcome,
  debrief,
  deltas,
  guardianName,
  guardianAward,
  skillCaption = 'Skill practised',
}: {
  outcome: ChoiceOutcome;
  debrief: DecisionDebrief;
  deltas: Deltas;
  guardianName?: string;
  /** What this decision granted its Guardian. `null` when already paid. */
  guardianAward: GuardianAward | null;
  skillCaption?: string;
}) {
  const { wrap, head, Icon } = OUTCOME_STYLE[outcome];
  const stats = deltaLines(deltas);

  return (
    <section className={`animate-rise space-y-4 rounded-[16px] border p-4 ${wrap}`} aria-live="polite">
      <div className="flex items-start gap-2.5">
        <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${head}`} strokeWidth={2.6} aria-hidden="true" />
        <div>
          <h2 className={`text-lg font-extrabold uppercase tracking-wide ${head}`}>
            {debrief.headline}
          </h2>
          <p className="mt-1 text-[14px] leading-relaxed text-ink">{debrief.body}</p>
        </div>
      </div>

      {debrief.spotted && debrief.spotted.length > 0 && (
        <div>
          <SectionLabel>You spotted</SectionLabel>
          <ul className="mt-2 space-y-1.5">
            {debrief.spotted.map((item) => (
              <li key={item} className="flex items-start gap-2 text-[13px]">
                <Check
                  className="mt-0.5 h-4 w-4 shrink-0 text-[var(--sq-safe)]"
                  strokeWidth={3}
                  aria-hidden="true"
                />
                <span className="text-ink">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {stats.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {stats.map((s) => (
            <span
              key={s}
              className="rounded-[6px] border border-line bg-surface px-2.5 py-1 text-[13px] font-bold text-[var(--sq-ink)] tabular-nums"
            >
              {s}
            </span>
          ))}
        </div>
      )}

      {debrief.sampleScript && (
        <div className="rounded-[16px] border border-line bg-surface p-3.5">
          <SectionLabel>You might say</SectionLabel>
          <p className="mt-2 flex gap-2 text-[14px] italic leading-relaxed text-ink">
            <MessageSquareQuote
              className="mt-0.5 h-4 w-4 shrink-0 text-[var(--sq-peer)]"
              aria-hidden="true"
            />
            “{debrief.sampleScript}”
          </p>
        </div>
      )}

      {debrief.saferResponse && (
        <div className="rounded-[16px] border border-line bg-surface p-3.5">
          <SectionLabel>Safer response</SectionLabel>
          <p className="mt-1.5 text-[13px] leading-relaxed text-ink-muted">
            {debrief.saferResponse}
          </p>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <SkillBadge competency={debrief.competency} caption={skillCaption} />
        {guardianName && <GuardianProgressNote name={guardianName} award={guardianAward} />}
      </div>
    </section>
  );
}
