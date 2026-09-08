import { Section, SectionHeading } from '../../../design-system/DesignSystem';
import { SHIELD_FRAMEWORK } from '../../../lib/shield-framework';

/**
 * The S.H.I.E.L.D. Behavioural Framework.
 *
 * One of only two `inverse` sections on the page, spent here because this is
 * the thing the whole programme is built on and the thing an assessor should
 * remember afterwards.
 *
 * Rendered from `SHIELD_FRAMEWORK`, the same constant the player's Skills page
 * and the facilitator's coverage report read. Previously this section, the
 * Skills page and `types/guardians.ts` each carried their own wording and
 * their own Guardian-to-skill descriptions — which had drifted far enough that
 * Beacon and Shieldfin's abilities were swapped relative to the proposal.
 */
export function Framework() {
  return (
    <Section id="framework" tone="inverse">
      <SectionHeading
        inverse
        eyebrow="The framework"
        title="One decision process, reinforced by every scenario"
        lede="Scam tactics change constantly, so we do not teach tactics. We teach a sequence young people can run on a situation nobody has warned them about yet."
      />

      {/*
        `subgrid` is what actually aligns these.

        Each card has three bands — heading, meaning, Guardian — and they have
        to line up across a row. Bottom-aligning the Guardian line with
        `flex-1` got row one right but left row two 16px out, because "Lead the
        Right Choice" has a one-line ability where its neighbours wrap to two.
        Every card now inherits the row's own track sizing, so all three bands
        align at any breakpoint with no fixed heights or line clamps.
      */}
      <ol className="mt-12 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {SHIELD_FRAMEWORK.map((skill) => (
          <li
            key={skill.competency}
            className="row-span-3 grid grid-rows-subgrid rounded-[16px] border border-[var(--color-navy-800)] bg-[var(--color-navy-900)] p-5"
          >
            <div className="flex items-center gap-3">
              <span
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-[var(--color-amber-400)] text-base font-black text-[var(--color-navy-950)]"
                aria-hidden="true"
              >
                {skill.letter}
              </span>
              <h3 className="text-sm font-extrabold text-white">{skill.label}</h3>
            </div>

            <p className="mt-3 text-sm leading-relaxed text-[var(--color-navy-200)]">
              {skill.meaning}
            </p>

            <p className="mt-4 border-t border-white/10 pt-3 text-xs text-[var(--color-navy-200)]/80">
              <span className="font-bold text-[var(--color-amber-300)]">{skill.guardian}</span>{' '}
              — {skill.guardianAbility}
            </p>
          </li>
        ))}
      </ol>

      <p className="mx-auto mt-10 max-w-2xl text-center text-sm leading-relaxed text-[var(--color-navy-200)]">
        Guardians are <strong className="font-bold text-white">earned</strong> by demonstrating
        these skills in play — never awarded by chance, and never sold. Progress means a player got
        better, not luckier.
      </p>
    </Section>
  );
}
