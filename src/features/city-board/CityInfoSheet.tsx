import Link from './navigation';
import { Dices, Lock, Route, SlidersHorizontal } from 'lucide-react';
import { BoardLegend } from './board/SpaceSheet';
import { Modal } from './presentation/Modal';
import type { ResolvedSpace } from './hooks/useBoard';
import { PROTOTYPE_DISCLAIMER } from './data/reference';
import { COMPETENCY_LABEL, COMPETENCY_LETTER, COMPETENCY_ORDER } from '../../../types/city-board';

/**
 * "About this game".
 *
 * The framework, the structure and the prototype framing all still exist and are
 * one tap away — they simply no longer occupy the screen a player came to play
 * on. On a phone this arrives as a sheet over the board; on a laptop the same
 * content is also permanently visible in the context rail.
 */
export function CityInfoSheet({
  open,
  onClose,
  spaces,
}: {
  open: boolean;
  onClose: () => void;
  /** The resolved board, so the legend shows the real space types. */
  spaces: ResolvedSpace[];
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      labelledBy="about-sheet-title"
      size="wide"
      className="bg-surface"
    >
      <div className="flex max-h-[82dvh] min-h-0 flex-col">
        <span
          aria-hidden="true"
          className="mx-auto mt-2 h-1 w-9 shrink-0 rounded-full bg-line-strong sm:hidden"
        />

        <header className="shrink-0 border-b border-line px-5 pb-4 pr-12 pt-4 sm:px-6">
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[var(--sq-action-text)]">
            Project SHIELD
          </p>
          <h2
            id="about-sheet-title"
            className="mt-1 text-[19px] font-extrabold tracking-tight text-[var(--sq-ink)]"
          >
            About ShieldQuest
          </h2>
        </header>

        {/*
          One spacing scale for the whole sheet.

          This body mixed `mt-1`, `mt-1.5`, `mt-2.5`, `p-3.5` and `space-y-4`
          with no rule, on a 16px inset — which is what made an explanatory
          sheet feel squeezed. It is now a single rhythm: 24px between
          sections, 16px inside one, and 8px from a heading to its content.

          Every section is also boxed with the same padding, so all four
          headings share one left edge. Two of them were unboxed, which left
          their headings sitting 14px to the left of the other two.
        */}
        <div className="thin-scroll min-h-0 flex-1 space-y-6 overflow-y-auto px-5 py-5 sm:px-6">
          <p className="text-[15px] leading-relaxed text-ink">
            A youth civic-learning experience where crime prevention is practised as a decision, not
            delivered as a talk.
          </p>

          <section className="rounded-[16px] border border-line bg-surface-sunk p-4">
            <h3 className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-ink-soft">
              <Route className="h-3.5 w-3.5" aria-hidden="true" />
              How a turn works
            </h3>
            <p className="mt-2 text-[14px] font-bold leading-relaxed text-[var(--sq-ink)]">
              Roll → Move → Land → Play → Decide → Learn → Back to the board
            </p>
            <p className="mt-3 text-[13px] leading-relaxed text-ink-muted">
              The city board is the engagement layer; the scenario engine, delayed consequences and
              Peer Shield are the substance.
            </p>
          </section>

          <section className="rounded-[16px] border border-[var(--sq-earned)]/40 bg-[var(--sq-earned)]/15 p-4">
            <h3 className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--sq-earned-text)]">
              <Dices className="h-3.5 w-3.5" aria-hidden="true" />
              What the dice does
            </h3>
            <p className="mt-2 text-[13px] leading-relaxed text-ink">
              It moves you, and nothing else. The dice never decides whether a choice was safe,
              never awards Shield Tokens, never strengthens a Guardian and never decides who wins —
              there is nothing to win. Every district is also reachable directly from the city
              screen, so nothing is locked behind a roll.
            </p>
          </section>

          <section className="rounded-[16px] border border-line bg-surface-sunk p-4">
            <h3 className="text-[11px] font-bold uppercase tracking-[0.12em] text-ink-soft">
              Board spaces
            </h3>
            <div className="mt-3">
              <BoardLegend spaces={spaces} />
            </div>
          </section>

          <section className="rounded-[16px] border border-line bg-surface-sunk p-4">
            <h3 className="text-[11px] font-bold uppercase tracking-[0.12em] text-ink-soft">
              The six skills you practise
            </h3>
            <p className="mt-2 text-[13px] leading-relaxed text-ink-muted">
              Every activity is tagged with the skill it builds. You see the tag on the mission, not
              a lecture about the framework.
            </p>
            <ul className="mt-3 grid grid-cols-1 gap-x-4 gap-y-2 sm:grid-cols-2">
              {COMPETENCY_ORDER.map((c) => (
                <li key={c} className="flex items-center gap-2.5">
                  <span
                    aria-hidden="true"
                    className="grid h-6 w-6 shrink-0 place-items-center rounded-[6px] bg-[var(--color-navy-900)] text-[11px] font-extrabold text-white"
                  >
                    {COMPETENCY_LETTER[c]}
                  </span>
                  <span className="text-[13px] font-medium text-ink">{COMPETENCY_LABEL[c]}</span>
                </li>
              ))}
            </ul>
          </section>

          <p className="flex items-start gap-2.5 rounded-[10px] border border-line px-4 py-3.5 text-[12px] leading-relaxed text-ink-muted">
            <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            ShieldQuest records what you have practised so it can suggest what to practise next. It
            does not profile you, predict behaviour, or rank you against other participants.
          </p>
        </div>

        <div className="shrink-0 space-y-3 border-t border-line px-5 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4 sm:px-6">
          <Link
            href="/admin"
            className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-[10px] border border-line px-3 text-[13px] font-semibold text-ink-muted transition hover:border-[var(--sq-action)]/40 hover:text-[var(--sq-action-text)]"
          >
            <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
            Scenario Management Portal
          </Link>
          <p className="text-center text-[11px] leading-relaxed text-ink-soft">
            {PROTOTYPE_DISCLAIMER}. Not an official Singapore Police Force system.
          </p>
        </div>
      </div>
    </Modal>
  );
}
