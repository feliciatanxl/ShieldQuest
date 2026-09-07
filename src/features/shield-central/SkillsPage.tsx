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
    color: 'border-rose-200 bg-rose-50 text-rose-700',
    icon: Clock,
  },
  {
    letter: 'I',
    name: 'IDENTIFY the Influence',
    guardian: 'Cluepaw',
    focus: 'Situational & Social Awareness',
    meaning: 'Investigate who is pushing the choice, what they gain, and whether hidden psychological tactics are at play.',
    practice: 'Dissecting social engineering, fake authority, peer manipulation.',
    color: 'border-indigo-200 bg-indigo-50 text-indigo-700',
    icon: Zap,
  },
  {
    letter: 'E',
    name: 'EVALUATE Consequences',
    guardian: 'ByteBuddy',
    focus: 'Cyber Hygiene & Long-Term Costs',
    meaning: 'Follow the choice past the moment it is made. What does this cost in 3 days, 3 months, or on your permanent record?',
    practice: 'Money mule legal repercussions, credential leakage, recovery costs.',
    color: 'border-cyan-200 bg-cyan-50 text-cyan-700',
    icon: Scale,
  },
  {
    letter: 'L',
    name: 'LEAD with Safe Choices',
    guardian: 'Beacon',
    focus: 'Safe Reporting & Adult Guidance',
    meaning: 'Make the choice that stands up to scrutiny and know how to escalate safely to official channels.',
    practice: 'Reporting via 1799, informing school counsellors, taking accountability.',
    color: 'border-amber-200 bg-amber-50 text-amber-700',
    icon: Shield,
  },
  {
    letter: 'D',
    name: 'DEFEND Your Peers',
    guardian: 'Shieldfin',
    focus: 'Peer Support & De-Escalation',
    meaning: 'Intervene privately and constructively for someone else without escalating the conflict or shaming them.',
    practice: 'Peer Shield mode, discreet intervention, non-judgmental support.',
    color: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    icon: HandHeart,
  },
];

export function SkillsPage() {
  const navigate = useNavigate();

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
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-blue-600">
            Competency Framework
          </span>
          <h1 className="text-base font-extrabold text-navy-900 sm:text-lg">
            S.H.I.E.L.D. Skills
          </h1>
        </div>
        <Link
          to="/guardians"
          className="rounded-lg bg-navy-900 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-navy-800"
        >
          Guardians
        </Link>
      </header>

      {/* Main Content */}
      <main className="mx-auto w-full max-w-4xl flex-1 p-4 sm:p-6">
        {/* Framework Banner */}
        <div className="rounded-3xl border border-blue-200 bg-gradient-to-r from-blue-900 to-navy-900 p-6 text-white shadow-lg">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <span className="inline-block rounded-full bg-blue-500/20 px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-blue-200">
                Evidence-Based Methodology
              </span>
              <h2 className="mt-2 text-2xl font-black">The S.H.I.E.L.D. Competencies</h2>
              <p className="mt-1 text-xs text-blue-100 sm:text-sm">
                Structured decision-making framework designed to replace panic with reflex actions.
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/10 p-3 text-center backdrop-blur-sm">
              <span className="block text-[10px] font-bold uppercase text-blue-200">
                Core Domains
              </span>
              <span className="text-xl font-black text-amber-300">
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
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:border-slate-300"
              >
                <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-start">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-navy-900 text-xl font-black text-white shadow-sm">
                    {skill.letter}
                  </div>

                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base font-black text-navy-900 flex items-center gap-1.5">
                        <Icon className="h-4 w-4 text-civic-600" />
                        {skill.name}
                      </h3>
                      <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-600">
                        Guardian: {skill.guardian}
                      </span>
                    </div>

                    <p className="mt-2 text-xs leading-relaxed text-slate-600 sm:text-sm">
                      {skill.meaning}
                    </p>

                    <div className="mt-3 flex items-center gap-2 rounded-xl bg-slate-50 p-2.5 text-xs text-slate-500">
                      <strong className="text-slate-700">Practised In:</strong> {skill.practice}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Ethical Design Note */}
        <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-100/70 p-4 text-xs leading-relaxed text-slate-600">
          <p className="font-bold text-slate-800">Educational Design Principle:</p>
          <p className="mt-1">
            S.H.I.E.L.D. counts record opportunities to practise. They are not an individual risk assessment,
            an IQ score, or a diagnostic badge, and participants are never ranked against their peers.
          </p>
        </div>
      </main>
    </div>
  );
}
