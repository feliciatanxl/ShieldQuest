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
    <div className="flex min-h-full flex-col bg-slate-50 text-slate-800">
      {/* Top Bar */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur-md">
        <button
          type="button"
          onClick={() => navigate('/shield-central')}
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600 transition hover:bg-slate-200"
          aria-label="Back to Shield Central"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="text-center">
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-600">
            Player Mastery
          </span>
          <h1 className="text-base font-extrabold text-navy-900 sm:text-lg">
            Achievements
          </h1>
        </div>
        <Link
          to="/board"
          className="rounded-lg bg-navy-900 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-navy-800"
        >
          Board
        </Link>
      </header>

      {/* Main Content */}
      <main className="mx-auto w-full max-w-4xl flex-1 p-4 sm:p-6">
        {/* Banner */}
        <div className="rounded-3xl border border-emerald-200 bg-gradient-to-r from-emerald-800 to-navy-900 p-6 text-white shadow-lg">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <span className="inline-block rounded-full bg-emerald-500/20 px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-emerald-200">
                Personal Milestones
              </span>
              <h2 className="mt-2 text-2xl font-black">Skill Accomplishments</h2>
              <p className="mt-1 text-xs text-emerald-100 sm:text-sm">
                Tracked against personal decision milestones. Zero leaderboards, zero competitive ranking.
              </p>
            </div>
            <div className="flex gap-2 text-center">
              <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-2.5 backdrop-blur-sm">
                <span className="block text-[10px] font-bold uppercase tracking-wider text-emerald-200">
                  Unlocked
                </span>
                <span className="text-xl font-black text-amber-300 tabular-nums">
                  {earnedAchievements.length} / {ACHIEVEMENTS.length}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* District Badges Showcase */}
        <div className="mt-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
              District Mastery Badges
            </h3>
            <span className="rounded-md bg-slate-200/70 px-2 py-0.5 text-[10px] font-bold text-slate-600">
              ILLUSTRATIVE PROTOTYPE DATA
            </span>
          </div>

          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {Object.entries(DISTRICT_BADGES).map(([distId, badge]) => (
              <div
                key={distId}
                className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <span className="text-2xl">🏅</span>
                  <span className="rounded-md bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                    District Cleared
                  </span>
                </div>
                <h4 className="mt-2 text-sm font-extrabold text-navy-900">
                  {badge.name}
                </h4>
                <p className="mt-1 text-xs text-slate-500 line-clamp-2">
                  {badge.blurb}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Core Achievements List */}
        <div className="mt-8">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
            S.H.I.E.L.D. Practice Milestones
          </h3>

          <div className="mt-3 space-y-3">
            {ACHIEVEMENTS.map((ach) => (
              <div
                key={ach.id}
                className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
              >
                <div className="flex items-center gap-3.5">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200">
                    <Trophy className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-extrabold text-navy-900">
                      {ach.title}
                    </h4>
                    <p className="mt-0.5 text-xs text-slate-500">
                      {ach.description}
                    </p>
                    <div className="mt-1.5 flex items-center gap-2">
                      <div className="h-1.5 w-24 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full bg-emerald-500"
                          style={{ width: `${Math.min(100, (ach.target / ach.target) * 100)}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-bold text-slate-400">
                        {ach.target} / {ach.target}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="shrink-0 text-right">
                  <span className="flex items-center gap-1 rounded-lg bg-emerald-100 px-2.5 py-1 text-xs font-black text-emerald-800">
                    <CheckCircle className="h-3.5 w-3.5" />
                    Completed
                  </span>
                  <span className="mt-1 block text-[10px] font-bold text-amber-600">
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
