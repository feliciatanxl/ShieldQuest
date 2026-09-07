import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ChevronDown,
  LifeBuoy,
} from 'lucide-react';

interface HelpCategory {
  id: string;
  title: string;
  badge: string;
  color: string;
  guidance: string[];
}

const GUIDANCE_CATEGORIES: HelpCategory[] = [
  {
    id: 'unsure',
    title: "I'm not sure if this is a scam or safe",
    badge: 'Immediate Pause',
    color: 'border-amber-200 bg-amber-50 text-amber-900',
    guidance: [
      'Not being sure is a good reason to pause, never to guess.',
      'Step away from the screen or chat before replying. Anything genuinely legitimate survives a delay.',
      'Say it out loud to an older sibling, parent, teacher, or trusted adult. Hearing yourself describe it usually exposes the trick.',
      'If someone asks you to transfer money, provide an OTP, or share your bank/Singpass credentials, stop immediately.',
    ],
  },
  {
    id: 'happened',
    title: 'Something already happened to me',
    badge: 'Safe Disclosure',
    color: 'border-rose-200 bg-rose-50 text-rose-900',
    guidance: [
      'What happened to you is NOT your fault. Fraud syndicates invest millions designing psychological traps specifically to exploit normal human trust.',
      'Cut off contact immediately. Do not attempt to negotiate, retaliate, or "win back" lost money.',
      'Notify your bank immediately to freeze compromised accounts or cards.',
      'Tell a trusted adult right away. Scams grow worse the longer they are kept secret.',
      'Preserve screenshots and chat logs, but do NOT confront the perpetrators yourself.',
    ],
  },
  {
    id: 'friend',
    title: "I'm worried about a friend's choices",
    badge: 'Peer Support',
    color: 'border-emerald-200 bg-emerald-50 text-emerald-900',
    guidance: [
      'Speak to them privately rather than in front of a group. This allows them to step back without losing face.',
      'Name the risk, not the person. "That offer sounds like a mule scam" lands far better than "You are being gullible".',
      'Give them an actionable exit: "Let us check with Mr. Tan or the police helpline first before you click."',
      'If they refuse and are about to commit an illegal act (e.g. money mule), escalate quietly to a trusted teacher or counsellor.',
    ],
  },
  {
    id: 'adult',
    title: 'How to approach a trusted adult',
    badge: 'Escalation',
    color: 'border-blue-200 bg-blue-50 text-blue-900',
    guidance: [
      'A trusted adult can be a parent, guardian, favourite teacher, school counsellor, or youth worker.',
      'You do not need to have all the answers or forensic proof before asking for help.',
      'If the first adult does not listen or dismisses your concern, do not give up — approach another.',
    ],
  },
];

const EMERGENCY_HOTLINES = [
  {
    agency: 'Singapore Police Force (SPF)',
    service: 'Anti-Scam Helpline',
    contact: '1799',
    hours: '24/7 Toll-Free',
    desc: 'Call immediately to report ongoing scam calls, check suspicious messages, or report compromised credentials.',
  },
  {
    agency: 'National Crime Prevention Council',
    service: 'ScamShield Official Service',
    contact: 'ScamShield App & WhatsApp (+65 9938 2486)',
    hours: '24/7 Automated & Live Check',
    desc: 'Official app and WhatsApp bot to check suspicious numbers, website URLs, and fraudulent SMS.',
  },
  {
    agency: 'Samaritans of Singapore (SOS)',
    service: 'Youth Mental Wellness & Crisis',
    contact: '1767 / CareText (+65 9151 1767)',
    hours: '24/7 Confidential Helpline',
    desc: 'Confidential emotional support if you or a friend are feeling overwhelmed, distressed, or coerced.',
  },
  {
    agency: 'Police Emergency Line',
    service: 'Urgent Police Assistance',
    contact: '999 (SMS 71999)',
    hours: 'Immediate Emergency Only',
    desc: 'For immediate danger or ongoing physical threats.',
  },
];

export function TrustedHelpPage() {
  const navigate = useNavigate();
  const [openCat, setOpenCat] = useState<string>('unsure');

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
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-rose-600">
            Emergency & Support
          </span>
          <h1 className="text-base font-extrabold text-navy-900 sm:text-lg">
            Trusted Help
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
        {/* Beacon Encouragement Banner */}
        <div className="rounded-3xl border border-rose-200 bg-gradient-to-r from-rose-900 via-navy-900 to-slate-900 p-6 text-white shadow-lg">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-rose-500/20 text-rose-300 ring-2 ring-rose-400/30">
              <LifeBuoy className="h-6 w-6" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-300">
                Beacon's Guidance
              </span>
              <h2 className="text-xl font-black sm:text-2xl">
                “You never have to navigate a scam alone.”
              </h2>
              <p className="mt-1 text-xs leading-relaxed text-slate-200 sm:text-sm">
                Real courage is knowing when to pause, step away from digital pressure, and invite a trusted adult into the room.
              </p>
            </div>
          </div>
        </div>

        {/* Behavioral Guidance Accordions */}
        <div className="mt-8 space-y-3">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
            Actionable Guidance By Situation
          </h3>

          {GUIDANCE_CATEGORIES.map((cat) => {
            const isOpen = openCat === cat.id;
            return (
              <div
                key={cat.id}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition"
              >
                <button
                  type="button"
                  onClick={() => setOpenCat(isOpen ? '' : cat.id)}
                  className="flex w-full items-center justify-between p-4 text-left font-extrabold text-navy-900 transition hover:bg-slate-50"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">
                      {cat.badge}
                    </span>
                    <span className="text-sm sm:text-base">{cat.title}</span>
                  </div>
                  <ChevronDown
                    className={`h-5 w-5 text-slate-400 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-navy-900' : ''
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="border-t border-slate-100 p-4 pt-3 text-xs sm:text-sm">
                    <ul className="list-disc space-y-2 pl-5 text-slate-700">
                      {cat.guidance.map((item, idx) => (
                        <li key={idx} className="leading-relaxed">
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Official Singapore Hotlines */}
        <div className="mt-8">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
            Verified Singapore Emergency & Escalation Channels
          </h3>

          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {EMERGENCY_HOTLINES.map((hotline) => (
              <div
                key={hotline.service}
                className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
              >
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    {hotline.agency}
                  </span>
                  <h4 className="mt-0.5 text-sm font-extrabold text-navy-900">
                    {hotline.service}
                  </h4>
                  <p className="mt-1.5 text-xs leading-relaxed text-slate-600">
                    {hotline.desc}
                  </p>
                </div>

                <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50 p-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-rose-600">
                      {hotline.contact}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400">
                      {hotline.hours}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
