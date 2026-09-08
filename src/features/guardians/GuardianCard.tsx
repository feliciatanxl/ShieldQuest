import { Check, CircleDashed, Handshake } from 'lucide-react';
import { GuardianPlate } from './GuardianArt';
import { guardianStanding } from './progress';
import { COMPETENCY_LABEL, type Guardian, type GuardianAward } from '../../../types/guardians';

/** Segmented progress bar — reads clearly on a projector and needs no colour. */
function ProgressPips({
  progress,
  target,
  emphasis = false,
}: {
  progress: number;
  target: number;
  emphasis?: boolean;
}) {
  return (
    <div className="flex items-center gap-1.5" aria-hidden="true">
      {Array.from({ length: target }, (_, i) => (
        <span
          key={i}
          className={`h-2 flex-1 rounded-full ${
            i < progress ? (emphasis ? 'bg-amber-500' : 'bg-civic-600') : 'bg-line'
          }`}
        />
      ))}
    </div>
  );
}

/**
 * Guardians represent prevention skills, not collectibles — every card leads
 * with the skill it stands for and what strengthens it.
 *
 * All six are always listed, met or not. A Guardian the player has not reached
 * yet says so in words and explains what would meet it, because the roster is
 * the map of the skill system: hiding four of the six would turn "skills you
 * are building" into a collection with gaps in it.
 */
export function GuardianCard({
  guardian,
  cumulative,
  met,
  featured = false,
  aura = false,
  className = '',
}: {
  guardian: Guardian;
  cumulative: number;
  /** True once the player has demonstrated this Guardian's competency. */
  met: boolean;
  featured?: boolean;
  /** An equipped Guardian cosmetic. Appearance only — it changes nothing. */
  aura?: boolean;
  /**
   * Passed by the caller so the card can be a DIRECT grid child. It used to be
   * wrapped in a div carrying the responsive show/hide, and that wrapper broke
   * the subgrid chain that aligns these cards to one another.
   */
  className?: string;
}) {
  const { level, progress, target } = guardianStanding(guardian, cumulative);

  return (
    <article
      /*
        `row-span-2 grid-rows-subgrid` gives the card the row's own two tracks:
        one for the portrait block, one for the progress / "how you meet" box.
        Those boxes hold anywhere from two to four lines of text, so without
        this they were visibly different heights side by side.
      */
      className={`row-span-2 grid grid-rows-subgrid gap-3 rounded-[16px] border p-3.5 ${
        !met
          ? 'border-dashed border-line-strong bg-surface-sunk'
          : featured
            ? 'border-[var(--sq-earned)]/40 bg-[var(--sq-earned)]/15'
            : 'border-line bg-surface'
      } ${className}`}
    >
      <div className="flex items-start gap-3">
        <GuardianPlate
          guardian={guardian}
          className={`h-11 w-11 rounded-[16px] text-[17px] ${aura ? 'guardian-aura' : ''} ${
            met ? '' : 'opacity-55 saturate-50'
          }`}
          tone={met && featured ? 'amber' : 'navy'}
        />

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
            <h3 className="text-base font-extrabold uppercase tracking-wide text-[var(--sq-ink)]">
              {guardian.name}
            </h3>
            {met && (
              <span className="rounded-[6px] bg-navy-900/8 px-1.5 py-0.5 text-[11px] font-bold text-[var(--sq-ink)]">
                Level {level}
              </span>
            )}
            <MetBadge met={met} />
          </div>
          <p className="mt-0.5 text-[13px] font-bold text-[var(--sq-action-text)]">{guardian.skill}</p>
          <p className="mt-1 text-[13px] italic text-ink-muted">“{guardian.motto}”</p>
        </div>
      </div>

      {met ? (
        <div>
          <div className="mb-1.5 flex items-baseline justify-between">
            <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-ink-soft">
              {guardian.skill} progress
            </span>
            <span className="text-[13px] font-bold tabular-nums text-[var(--sq-ink)]">
              {progress} / {target}
            </span>
          </div>
          <ProgressPips progress={progress} target={target} emphasis={featured} />
          <p className="mt-2 text-[13px] leading-snug text-ink-muted">
            {progress === 0 && level > 1
              ? `Level ${level} reached. ${guardian.description}`
              : `Complete ${target - progress} more ${guardian.skill.toLowerCase()} decision${
                  target - progress === 1 ? '' : 's'
                } to strengthen ${guardian.name}.`}
          </p>
        </div>
      ) : (
        <div className="rounded-[10px] border border-line bg-surface px-3 py-2.5">
          <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-ink-soft">
            How you meet {guardian.name}
          </p>
          <p className="mt-1 text-[13px] leading-snug text-ink-muted">
            Complete your first{' '}
            <span className="font-bold text-[var(--sq-ink)]">{COMPETENCY_LABEL[guardian.competency]}</span>{' '}
            activity in the city. {guardian.description}
          </p>
        </div>
      )}
    </article>
  );
}

/**
 * Met state in words, never in colour alone.
 *
 * The wording matters as much as the accessibility of it: a Guardian is met or
 * not yet met. It is never locked, never for sale and never rolled for, so the
 * label never suggests otherwise.
 */
export function MetBadge({ met }: { met: boolean }) {
  return met ? (
    <span className="inline-flex items-center gap-1 rounded-[6px] bg-[var(--sq-safe)]/15 px-1.5 py-0.5 text-[11px] font-bold text-[var(--sq-safe)]">
      <Handshake className="h-3 w-3" aria-hidden="true" />
      Met
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 rounded-[6px] bg-navy-900/6 px-1.5 py-0.5 text-[11px] font-bold text-ink-soft">
      <CircleDashed className="h-3 w-3" aria-hidden="true" />
      Not yet met
    </span>
  );
}

/**
 * Shown inside a debrief to say what the completion did to its Guardian.
 *
 * Three states, because there are three things that can have happened: the
 * Guardian was met, it was progressed, or this activity had already paid its
 * one Guardian grant and the run was practice. Claiming "+1" for the third
 * would be the screen reporting something that did not occur.
 */
export function GuardianProgressNote({
  name,
  award,
}: {
  name: string;
  /** What the completion granted. `null` when the activity had already paid. */
  award: GuardianAward | null;
}) {
  if (award === 'MET') {
    return (
      <p className="inline-flex items-center gap-2 rounded-[6px] border border-[var(--sq-safe)]/40 bg-[var(--sq-safe)]/15 px-3 py-2 text-[13px] font-semibold text-[var(--sq-safe)]">
        <Handshake className="h-4 w-4 shrink-0" aria-hidden="true" />
        {name} met — Guardian added to your roster
      </p>
    );
  }

  if (award === 'PROGRESSED') {
    return (
      <p className="inline-flex items-center gap-2 rounded-[6px] border border-[var(--sq-earned)]/40 bg-[var(--sq-earned)]/15 px-3 py-2 text-[13px] font-semibold text-[var(--sq-earned-text)]">
        <Check className="h-4 w-4 shrink-0" aria-hidden="true" />
        {name} progress +1
      </p>
    );
  }

  return (
    <p className="inline-flex items-center gap-2 rounded-[6px] border border-line bg-surface-sunk px-3 py-2 text-[13px] font-semibold text-ink-muted">
      <Check className="h-4 w-4 shrink-0" aria-hidden="true" />
      {name} progress already earned — practice run
    </p>
  );
}
