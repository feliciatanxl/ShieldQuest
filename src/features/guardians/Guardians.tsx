import { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { GuardianCard } from './GuardianCard';
import { GuardianPlate } from './GuardianArt';
import { PlayerSheet, sheetMeasure } from '../../components/PlayerSheet';
import { guardianStanding } from './progress';
import { useShieldProgress } from './useShieldProgress';
import { guardians } from './data';
import type { GuardianId } from '../../../types';

/**
 * View 4 — Guardians.
 *
 * Guardians are the visible form of the S.H.I.E.L.D. competencies: each one
 * stands for a prevention skill and strengthens only when that skill is
 * practised, so progression is evidence of learning rather than collection.
 * There is nothing to roll for, nothing to collect and nothing to spend — the
 * selector below only changes which skill you are reading about.
 *
 * On a phone that selector is the whole point: six full cards stacked is five
 * screens of scrolling to compare six things. One card at a time, chosen from a
 * grid of six portraits, fits. A tablet has room to show them all at once, so it
 * does — same cards, same markup, the grid simply steps out of the way.
 *
 * The grid is two rows of three rather than one row of six. Six tiles across a
 * 390px phone leaves about 60px each, which is not enough for a portrait, a
 * name and a level, and the name is what a player is actually choosing by.
 */
export function Guardians({ onPractice }: { onPractice: () => void }) {
  const { profile } = useShieldProgress();

  const currentId = guardians.some((g) => g.id === profile.currentGuardianId)
    ? profile.currentGuardianId
    : guardians[0].id;
  const [selectedId, setSelectedId] = useState(currentId);

  const isMet = (id: GuardianId) => profile.metGuardians.includes(id);
  const metCount = guardians.filter((g) => isMet(g.id)).length;

  /*
   * Only met Guardians contribute. A stored session from before Guardians had
   * to be earned can still carry a progress figure for a Guardian the player
   * has not met, and counting it here would put practice on the board that
   * never happened.
   */
  const totalPractised = guardians.reduce(
    (sum, g) => sum + (isMet(g.id) ? (profile.guardianProgress[g.id] ?? 0) : 0),
    0,
  );

  return (
    <div className="city-feature guardian-feature">
      <p className="guardian-preview-note">Local preview · Progress resets when you reload.</p>
      <PlayerSheet
        className="pb-6"
        header={
          <header className="sticky top-0 z-20 bg-navy-900 px-4 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))] text-white xl:px-6">
            <div className={sheetMeasure()}>
              <div className="flex items-end justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--sq-earned)]">
                    Your Guardians
                  </p>
                  <h1 className="mt-0.5 text-xl font-extrabold leading-tight tracking-tight">
                    Skills you are building
                  </h1>
                </div>
                <div className="flex shrink-0 gap-1.5">
                  <p className="rounded-[6px] bg-white/10 px-2.5 py-1 text-right text-[11px] font-semibold leading-tight">
                    <span className="block text-[15px] font-extrabold tabular-nums text-[var(--sq-earned)]">
                      {metCount}/{guardians.length}
                    </span>
                    <span className="text-[var(--sq-ink-muted)]">met</span>
                  </p>
                  <p className="rounded-[6px] bg-white/10 px-2.5 py-1 text-right text-[11px] font-semibold leading-tight">
                    <span className="block text-[15px] font-extrabold tabular-nums text-[var(--sq-earned)]">
                      {totalPractised}
                    </span>
                    <span className="text-[var(--sq-ink-muted)]">practised</span>
                  </p>
                </div>
              </div>
              <p className="mt-1.5 text-[12px] leading-snug text-[var(--sq-ink-muted)] xl:text-[13.5px]">
                You meet a Guardian by completing an activity that practises its skill, and it grows
                as you keep practising — never by spending anything, and never by chance.
              </p>
            </div>
          </header>
        }
      >
        <div className="space-y-3.5 px-4 pt-3.5 xl:space-y-5 xl:px-6 xl:pt-5">
          {/* Selector. Hidden once every card is on screen at once. */}
          <div className="md:hidden">
            <h2
              id="guardian-selector"
              className="mb-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-ink-soft"
            >
              Choose a Guardian
            </h2>
            <ul aria-labelledby="guardian-selector" className="grid grid-cols-3 gap-1.5">
              {guardians.map((g) => {
                const met = isMet(g.id);
                const { level } = guardianStanding(g, profile.guardianProgress[g.id] ?? 0);
                const active = g.id === selectedId;
                return (
                  <li key={g.id}>
                    <button
                      type="button"
                      onClick={() => setSelectedId(g.id)}
                      aria-current={active ? 'true' : undefined}
                      aria-controls="guardian-detail"
                      className={`flex min-h-[62px] w-full flex-col items-center justify-center gap-1 rounded-[10px] border px-1 py-1.5 transition ${
                        active
                          ? 'border-amber-500 bg-[var(--sq-earned)]/15'
                          : 'border-line bg-surface hover:border-[var(--sq-action)]/40'
                      }`}
                    >
                      <GuardianPlate
                        guardian={g}
                        className={`h-7 w-7 rounded-[6px] text-[12px] ${
                          met ? '' : 'opacity-55 saturate-50'
                        }`}
                        tone={active ? 'amber' : 'navy'}
                      />
                      <span
                        className={`w-full truncate text-[11px] font-extrabold uppercase tracking-wide ${
                          active ? 'text-[var(--sq-earned-text)]' : 'text-[var(--sq-ink)]'
                        }`}
                      >
                        {g.name}
                      </span>
                      {/* Never a level for a Guardian that has not been met —
                        "Lv 1" would read as owned-but-empty. */}
                      <span className="text-[10px] font-bold tabular-nums text-ink-soft">
                        {met ? (
                          <>
                            Lv {level}
                            {g.id === currentId && (
                              <span className="text-[var(--sq-earned-text)]"> · current</span>
                            )}
                          </>
                        ) : (
                          'Not yet met'
                        )}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          {/*
          One set of cards for both layouts: the phone shows the selected one,
          a tablet shows all six. Hiding with CSS rather than unmounting keeps
          a single copy in the accessibility tree at either width.
        */}
          <div
            id="guardian-detail"
            className="space-y-2.5 md:grid md:grid-cols-2 md:items-start md:gap-3 md:space-y-0 xl:grid-cols-3 xl:gap-5"
          >
            {guardians.map((g) => (
              <div key={g.id} className={g.id === selectedId ? '' : 'hidden md:block'}>
                <GuardianCard
                  guardian={g}
                  cumulative={profile.guardianProgress[g.id] ?? 0}
                  met={isMet(g.id)}
                  featured={g.id === currentId}
                />
              </div>
            ))}
          </div>

          {/* The board decides what to practise next, so it is the right target
            here rather than hard-coding one mission that may already be done. */}
          <button
            type="button"
            onClick={onPractice}
            className="flex min-h-[52px] w-full items-center justify-center gap-2 rounded-[10px] bg-civic-600 px-4 text-[15px] font-extrabold text-white transition hover:bg-civic-700"
          >
            Practise in ShieldQuest City
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </PlayerSheet>
    </div>
  );
}
