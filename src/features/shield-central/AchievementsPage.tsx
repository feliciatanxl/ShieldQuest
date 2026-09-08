import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle,
  Trophy,
} from 'lucide-react';
import { ACHIEVEMENTS, DISTRICT_BADGES } from '../assessment/data';
import { useSessionStore } from '../../stores/sessionStore';

export function AchievementsPage() {
  const navigate = useNavigate();
  const { earnedAchievements } = useSessionStore();

  return (
    <div data-skin="game"
      className="flex min-h-dvh flex-col bg-[var(--sq-canvas)] text-[var(--sq-ink)]">
      {/* Top Bar */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-[var(--sq-line)] bg-[var(--sq-surface)]/95 px-4 py-3 backdrop-blur-md">
        <button
          type="button"
          onClick={() => navigate('/shield-central')}
          className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-[var(--sq-surface-raised)] text-[var(--sq-ink-muted)] transition hover:bg-[var(--sq-surface-raised)]"
          aria-label="Back to Shield Central"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="text-center">
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-[var(--sq-safe)]">
            Player Mastery
          </span>
          <h1 className="text-base font-extrabold text-[var(--sq-ink)] sm:text-lg">
            Achievements
          </h1>
        </div>
        <Link
          to="/board"
          className="rounded-[6px] bg-[var(--sq-action)] px-3 py-1.5 text-xs font-bold text-white transition hover:bg-[var(--sq-action-hover)]"
        >
          Board
        </Link>
      </header>

      {/* Main Content */}
      <main className="mx-auto w-full max-w-4xl flex-1 p-4 sm:p-6">
        {/* Banner */}
        <div className="rounded-[24px] border border-[var(--sq-safe)]/40 bg-gradient-to-r from-emerald-800 to-[var(--color-navy-900)] p-6 text-white shadow-lg">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <span className="inline-block rounded-full bg-[var(--sq-safe)]/20 px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-[var(--sq-safe)]">
                Personal Milestones
              </span>
              <h2 className="mt-2 text-2xl font-black">Skill Accomplishments</h2>
              <p className="mt-1 text-xs text-emerald-100 sm:text-sm">
                Tracked against personal decision milestones. Zero leaderboards, zero competitive ranking.
              </p>
            </div>
            <div className="flex gap-2 text-center">
              <div className="rounded-[16px] border border-white/10 bg-white/10 px-4 py-2.5 backdrop-blur-sm">
                <span className="block text-[10px] font-bold uppercase tracking-wider text-[var(--sq-safe)]">
                  Unlocked
                </span>
                <span className="text-xl font-black text-[var(--sq-earned-text)] tabular-nums">
                  {earnedAchievements.length} / {ACHIEVEMENTS.length}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* District Badges Showcase */}
        <div className="mt-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-[var(--sq-ink-muted)]">
              District Mastery Badges
            </h3>
          </div>

          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {Object.entries(DISTRICT_BADGES).map(([distId, badge]) => (
              <div
                key={distId}
                className="rounded-[16px] border border-[var(--sq-line)] bg-[var(--sq-surface)] p-4 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <span className="text-2xl">🏅</span>
                  <span className="rounded-[6px] bg-[var(--sq-safe)]/15 px-2 py-0.5 text-[10px] font-bold text-[var(--sq-safe)]">
                    District Cleared
                  </span>
                </div>
                <h4 className="mt-2 text-sm font-extrabold text-[var(--sq-ink)]">
                  {badge.name}
                </h4>
                <p className="mt-1 text-xs text-[var(--sq-ink-muted)] line-clamp-2">
                  {badge.blurb}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Core Achievements List */}
        <div className="mt-8">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-[var(--sq-ink-muted)]">
            S.H.I.E.L.D. Practice Milestones
          </h3>

          <div className="mt-3 space-y-3">
            {ACHIEVEMENTS.map((ach) => (
              <div
                key={ach.id}
                className="flex items-center justify-between rounded-[16px] border border-[var(--sq-line)] bg-[var(--sq-surface)] p-4 shadow-sm"
              >
                <div className="flex items-center gap-3.5">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[16px] bg-[var(--sq-safe)]/15 text-[var(--sq-safe)] border border-[var(--sq-safe)]/40">
                    <Trophy className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-extrabold text-[var(--sq-ink)]">
                      {ach.title}
                    </h4>
                    <p className="mt-0.5 text-xs text-[var(--sq-ink-muted)]">
                      {ach.description}
                    </p>
                    <div className="mt-1.5 flex items-center gap-2">
                      <div className="h-1.5 w-24 overflow-hidden rounded-full bg-[var(--sq-surface-raised)]">
                        <div
                          className="h-full bg-[var(--sq-safe)]"
                          style={{ width: `${Math.min(100, (ach.target / ach.target) * 100)}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-bold text-[var(--sq-ink-muted)]">
                        {ach.target} / {ach.target}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="shrink-0 text-right">
                  <span className="flex items-center gap-1 rounded-[6px] bg-[var(--sq-safe)]/15 px-2.5 py-1 text-xs font-black text-[var(--sq-safe)]">
                    <CheckCircle className="h-3.5 w-3.5" />
                    Completed
                  </span>
                  <span className="mt-1 block text-[10px] font-bold text-[var(--sq-earned-text)]">
                    +50 Tokens
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
