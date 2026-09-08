import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Award,
  BookOpen,
  ChevronRight,
  ClipboardCheck,
  LifeBuoy,
  Settings,
  Shield,
  Trophy,
} from 'lucide-react';
import { useSessionStore } from '../../stores/sessionStore';

export function ShieldCentralHub() {
  const navigate = useNavigate();
  const { shieldTokens, earnedAchievements, districtBadges } = useSessionStore();

  const hubTiles = [
    {
      to: '/shield-central/casebook',
      title: 'Shield Casebook',
      eyebrow: 'Threat Dossiers',
      desc: 'Investigate scam types, red flags, and forensic evidence from your journey.',
      icon: BookOpen,
      color: 'bg-[var(--sq-action)]',
      tag: '10 Cases',
    },
    {
      to: '/shield-central/rewards',
      title: 'Rewards & Badges',
      eyebrow: 'Recognition',
      desc: 'Equip profile frames, unlock guardian auras, and redeem earned Shield Tokens.',
      icon: Award,
      color: 'bg-[var(--sq-earned)] text-[var(--color-navy-950)]',
      tag: `${shieldTokens} Tokens`,
    },
    {
      to: '/shield-central/achievements',
      title: 'Achievements',
      eyebrow: 'Milestones',
      desc: 'Track completed scenario goals, perfect voting rounds, and district mastery.',
      icon: Trophy,
      color: 'bg-[var(--sq-earned)] text-[var(--color-navy-950)]',
      tag: `${earnedAchievements.length} Unlocked`,
    },
    {
      to: '/shield-central/skills',
      title: 'S.H.I.E.L.D. Skills',
      eyebrow: 'Framework',
      desc: 'Explore the 6 core youth crime-prevention competencies and your practice ledger.',
      icon: Shield,
      color: 'bg-[var(--sq-action)]',
      tag: '6 Competencies',
    },
    {
      to: '/shield-central/trusted-help',
      title: 'Trusted Help & Hotlines',
      eyebrow: 'Support & Escalation',
      desc: 'Official Singapore emergency channels (1799 Anti-Scam, ScamShield, SOS) and adult guidance.',
      icon: LifeBuoy,
      color: 'bg-[var(--sq-peer)]',
      tag: 'Emergency Guides',
    },
    {
      to: '/shield-central/check-in',
      title: 'Session Check-In',
      eyebrow: 'Evaluation',
      desc: 'Pre- and post-workshop reflective surveys for facilitated pilot sessions.',
      icon: ClipboardCheck,
      color: 'bg-[var(--sq-action)]',
      tag: 'Ungraded Survey',
    },
    {
      to: '/shield-central/settings',
      title: 'Accessibility & Settings',
      eyebrow: 'Preferences',
      desc: 'Toggle reduced motion, audio effects, high-contrast text, and squad pseudonyms.',
      icon: Settings,
      color: 'bg-[var(--sq-surface-raised)]',
      tag: 'Accessibility',
    },
  ];

  return (
    <div data-skin="game"
      className="flex min-h-dvh flex-col bg-[var(--sq-canvas)] text-[var(--sq-ink)]">
      {/* Top Navigation */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-[var(--sq-line)] bg-[var(--sq-surface)]/95 px-4 py-3 backdrop-blur-md">
        <button
          type="button"
          onClick={() => navigate('/board')}
          className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-[var(--sq-surface-raised)] text-[var(--sq-ink-muted)] transition hover:bg-[var(--sq-surface-raised)]"
          aria-label="Back to Board"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="text-center">
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-[var(--sq-earned-text)]">
            Player Operations
          </span>
          <h1 className="text-base font-extrabold text-[var(--sq-ink)] sm:text-lg">
            Shield Central
          </h1>
        </div>
        <Link
          to="/board"
          className="rounded-[6px] bg-[var(--sq-action)] px-3 py-1.5 text-xs font-bold text-white transition hover:bg-[var(--sq-action-hover)]"
        >
          City Board
        </Link>
      </header>

      {/* Hero Banner */}
      <div className="border-b border-[var(--sq-line)] bg-gradient-to-r from-[var(--color-navy-950)] via-[var(--color-navy-900)] to-[var(--color-civic-900)] px-5 py-8 text-white sm:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-[16px] bg-[var(--sq-earned)]/20 text-[var(--sq-earned-text)] ring-2 ring-[var(--sq-earned)]/30">
                <Shield className="h-8 w-8" />
              </div>
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-widest text-[var(--sq-earned-text)]">
                  Project SHIELD · Hub
                </p>
                <h2 className="text-2xl font-black tracking-tight sm:text-3xl">
                  Shield Central Operations
                </h2>
                <p className="mt-1 text-xs text-[var(--sq-ink-muted)] sm:text-sm">
                  Your headquarters for investigation files, rewards, safety guides, and progress.
                </p>
              </div>
            </div>

            {/* Quick Stats Bar */}
            <div className="flex gap-2 sm:gap-3">
              <div className="rounded-[10px] border border-white/10 bg-white/10 px-3.5 py-2 text-center backdrop-blur-sm">
                <span className="block text-[10px] font-bold uppercase tracking-wider text-[var(--sq-earned-text)]">
                  Shield Tokens
                </span>
                <span className="text-lg font-black text-white tabular-nums sm:text-xl">
                  {shieldTokens}
                </span>
              </div>
              <div className="rounded-[10px] border border-white/10 bg-white/10 px-3.5 py-2 text-center backdrop-blur-sm">
                <span className="block text-[10px] font-bold uppercase tracking-wider text-[var(--sq-safe)]">
                  Badges
                </span>
                <span className="text-lg font-black text-white tabular-nums sm:text-xl">
                  {districtBadges.length}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Hub Grid */}
      <main className="mx-auto w-full max-w-4xl flex-1 p-4 sm:p-6 sm:py-8">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-[var(--sq-ink-muted)]">
            Navigation Modules
          </h3>
        </div>

        <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
          {hubTiles.map((tile) => {
            const Icon = tile.icon;
            return (
              <Link
                key={tile.to}
                to={tile.to}
                className="group relative flex flex-col justify-between overflow-hidden rounded-[16px] border border-[var(--sq-line)] bg-[var(--sq-surface)] p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-[var(--sq-line-strong)] hover:shadow-md"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className={`flex h-11 w-11 items-center justify-center rounded-[10px] text-white shadow-sm ${tile.color}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="rounded-full bg-[var(--sq-surface-raised)] px-2.5 py-1 text-[11px] font-extrabold text-[var(--sq-ink-muted)] group-hover:bg-[var(--sq-surface-raised)]">
                      {tile.tag}
                    </span>
                  </div>
                  <div className="mt-4">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--sq-ink-muted)]">
                      {tile.eyebrow}
                    </span>
                    <h4 className="mt-0.5 text-base font-extrabold text-[var(--sq-ink)] group-hover:text-[var(--sq-action-text)]">
                      {tile.title}
                    </h4>
                    <p className="mt-1.5 text-xs leading-relaxed text-[var(--sq-ink-muted)]">
                      {tile.desc}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-1 text-xs font-bold text-[var(--sq-action-text)] group-hover:translate-x-1 transition-transform">
                  Enter module
                  <ChevronRight className="h-3.5 w-3.5" />
                </div>
              </Link>
            );
          })}
        </div>
      </main>
    </div>
  );
}
