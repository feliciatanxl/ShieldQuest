import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Clock,
  Eye,
  HandHeart,
  Scale,
  Shield,
  Zap,
} from 'lucide-react';

const SHIELD_SKILLS = [
  {
    letter: 'S',
    name: 'SPOT the Risk',
    guardian: 'VeriFox',
    focus: 'Verification & Threat Detection',
    meaning: 'Notice the signals that a situation is not what it appears to be — artificial urgency, easy money, or requests for bank logins.',
    practice: 'Phishing analysis, impersonation detection, scam website audits.',
    color: 'border-orange-200 bg-orange-50 text-orange-700',
    icon: Eye,
  },
  {
    letter: 'H',
    name: 'HOLD Before Acting',
    guardian: 'Echo',
    focus: 'Consultation & Time Delays',
    meaning: 'Put time between pressure and your decision. Legitimate opportunities always survive a healthy delay.',
    practice: 'Resisting high-pressure countdowns, second opinions, calm pause.',
    color: 'border-[var(--sq-risk)]/40 bg-[var(--sq-risk)]/15 text-[var(--sq-risk)]',
    icon: Clock,
  },
  {
    letter: 'I',
    name: 'IDENTIFY the Influence',
    guardian: 'Cluepaw',
    focus: 'Situational & Social Awareness',
    meaning: 'Investigate who is pushing the choice, what they gain, and whether hidden psychological tactics are at play.',
    practice: 'Dissecting social engineering, fake authority, peer manipulation.',
    color: 'border-[var(--sq-action)]/40 bg-[var(--sq-action)]/15 text-[var(--sq-action-text)]',
    icon: Zap,
  },
  {
    letter: 'E',
    name: 'EVALUATE Consequences',
    guardian: 'ByteBuddy',
    focus: 'Cyber Hygiene & Long-Term Costs',
    meaning: 'Follow the choice past the moment it is made. What does this cost in 3 days, 3 months, or on your permanent record?',
    practice: 'Money mule legal repercussions, credential leakage, recovery costs.',
    color: 'border-[var(--sq-action)]/40 bg-[var(--sq-action)]/15 text-[var(--sq-action-text)]',
    icon: Scale,
  },
  {
    letter: 'L',
    name: 'LEAD with Safe Choices',
    guardian: 'Beacon',
    focus: 'Safe Reporting & Adult Guidance',
    meaning: 'Make the choice that stands up to scrutiny and know how to escalate safely to official channels.',
    practice: 'Reporting via 1799, informing school counsellors, taking accountability.',
    color: 'border-[var(--sq-earned)]/40 bg-[var(--sq-earned)]/15 text-[var(--sq-earned-text)]',
    icon: Shield,
  },
  {
    letter: 'D',
    name: 'DEFEND Your Peers',
    guardian: 'Shieldfin',
    focus: 'Peer Support & De-Escalation',
    meaning: 'Intervene privately and constructively for someone else without escalating the conflict or shaming them.',
    practice: 'Peer Shield mode, discreet intervention, non-judgmental support.',
    color: 'border-[var(--sq-safe)]/40 bg-[var(--sq-safe)]/15 text-[var(--sq-safe)]',
    icon: HandHeart,
  },
];

export function SkillsPage() {
  const navigate = useNavigate();

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
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-[var(--sq-action-text)]">
            Competency Framework
          </span>
          <h1 className="text-base font-extrabold text-[var(--sq-ink)] sm:text-lg">
            S.H.I.E.L.D. Skills
          </h1>
        </div>
        <Link
          to="/guardians"
          className="rounded-[6px] bg-[var(--sq-action)] px-3 py-1.5 text-xs font-bold text-white transition hover:bg-[var(--sq-action-hover)]"
        >
          Guardians
        </Link>
      </header>

      {/* Main Content */}
      <main className="mx-auto w-full max-w-4xl flex-1 p-4 sm:p-6">
        {/* Framework Banner */}
        <div className="rounded-[24px] border border-[var(--sq-action)]/40 bg-gradient-to-r from-blue-900 to-[var(--color-navy-900)] p-6 text-white shadow-lg">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <span className="inline-block rounded-full bg-[var(--sq-action)]/20 px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-[var(--sq-action-text)]">
                Evidence-Based Methodology
              </span>
              <h2 className="mt-2 text-2xl font-black">The S.H.I.E.L.D. Competencies</h2>
              <p className="mt-1 text-xs text-blue-100 sm:text-sm">
                Structured decision-making framework designed to replace panic with reflex actions.
              </p>
            </div>
            <div className="rounded-[16px] border border-white/10 bg-white/10 p-3 text-center backdrop-blur-sm">
              <span className="block text-[10px] font-bold uppercase text-[var(--sq-action-text)]">
                Core Domains
              </span>
              <span className="text-xl font-black text-[var(--sq-earned-text)]">
                6 Competencies
              </span>
            </div>
          </div>
        </div>

        {/* Competencies Grid */}
        <div className="mt-6 space-y-4">
          {SHIELD_SKILLS.map((skill) => {
            const Icon = skill.icon;
            return (
              <div
                key={skill.letter}
                className="overflow-hidden rounded-[16px] border border-[var(--sq-line)] bg-[var(--sq-surface)] shadow-sm transition hover:border-[var(--sq-line-strong)]"
              >
                <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-start">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[16px] bg-[var(--sq-action)] text-xl font-black text-white shadow-sm">
                    {skill.letter}
                  </div>

                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base font-black text-[var(--sq-ink)] flex items-center gap-1.5">
                        <Icon className="h-4 w-4 text-[var(--sq-action-text)]" />
                        {skill.name}
                      </h3>
                      <span className="rounded-[6px] bg-[var(--sq-surface-raised)] px-2 py-0.5 text-[11px] font-bold text-[var(--sq-ink-muted)]">
                        Guardian: {skill.guardian}
                      </span>
                    </div>

                    <p className="mt-2 text-xs leading-relaxed text-[var(--sq-ink-muted)] sm:text-sm">
                      {skill.meaning}
                    </p>

                    <div className="mt-3 flex items-center gap-2 rounded-[16px] bg-[var(--sq-surface-sunk)] p-2.5 text-xs text-[var(--sq-ink-muted)]">
                      <strong className="text-[var(--sq-ink)]">Practised In:</strong> {skill.practice}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Ethical Design Note */}
        <div className="mt-6 rounded-[16px] border border-[var(--sq-line)] bg-[var(--sq-surface-raised)]/70 p-4 text-xs leading-relaxed text-[var(--sq-ink-muted)]">
          <p className="font-bold text-[var(--sq-ink)]">Educational Design Principle:</p>
          <p className="mt-1">
            S.H.I.E.L.D. counts record opportunities to practise. They are not an individual risk assessment,
            an IQ score, or a diagnostic badge, and participants are never ranked against their peers.
          </p>
        </div>
      </main>
    </div>
  );
}
