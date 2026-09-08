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
    color: 'border-[var(--sq-earned)]/40 bg-[var(--sq-earned)]/15 text-[var(--sq-earned-text)]',
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
    color: 'border-[var(--sq-risk)]/40 bg-[var(--sq-risk)]/15 text-[var(--sq-risk)]',
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
    color: 'border-[var(--sq-safe)]/40 bg-[var(--sq-safe)]/15 text-[var(--sq-safe)]',
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
    color: 'border-[var(--sq-action)]/40 bg-[var(--sq-action)]/15 text-[var(--sq-action-text)]',
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
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-[var(--sq-risk)]">
            Emergency & Support
          </span>
          <h1 className="text-base font-extrabold text-[var(--sq-ink)] sm:text-lg">
            Trusted Help
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
        {/* Beacon Encouragement Banner */}
        <div className="rounded-[24px] border border-[var(--sq-risk)]/40 bg-gradient-to-r from-[var(--color-coral-800)] via-[var(--color-navy-900)] to-[var(--color-navy-950)] p-6 text-white shadow-lg">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[16px] bg-[var(--sq-risk)]/20 text-[var(--sq-risk)] ring-2 ring-[var(--sq-risk)]/30">
              <LifeBuoy className="h-6 w-6" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-[var(--sq-earned-text)]">
                Beacon's Guidance
              </span>
              <h2 className="text-xl font-black sm:text-2xl">
                “You never have to navigate a scam alone.”
              </h2>
              <p className="mt-1 text-xs leading-relaxed text-[var(--sq-ink-muted)] sm:text-sm">
                Real courage is knowing when to pause, step away from digital pressure, and invite a trusted adult into the room.
              </p>
            </div>
          </div>
        </div>

        {/* Behavioral Guidance Accordions */}
        <div className="mt-8 space-y-3">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-[var(--sq-ink-muted)]">
            Actionable Guidance By Situation
          </h3>

          {GUIDANCE_CATEGORIES.map((cat) => {
            const isOpen = openCat === cat.id;
            return (
              <div
                key={cat.id}
                className="overflow-hidden rounded-[16px] border border-[var(--sq-line)] bg-[var(--sq-surface)] shadow-sm transition"
              >
                <button
                  type="button"
                  onClick={() => setOpenCat(isOpen ? '' : cat.id)}
                  className="flex w-full items-center justify-between p-4 text-left font-extrabold text-[var(--sq-ink)] transition hover:bg-[var(--sq-surface-sunk)]"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="rounded-[6px] bg-[var(--sq-surface-raised)] px-2 py-0.5 text-[10px] font-bold text-[var(--sq-ink-muted)]">
                      {cat.badge}
                    </span>
                    <span className="text-sm sm:text-base">{cat.title}</span>
                  </div>
                  <ChevronDown
                    className={`h-5 w-5 text-[var(--sq-ink-muted)] transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-[var(--sq-ink)]' : ''
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="border-t border-[var(--sq-line)] p-4 pt-3 text-xs sm:text-sm">
                    <ul className="list-disc space-y-2 pl-5 text-[var(--sq-ink)]">
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
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-[var(--sq-ink-muted)]">
            Verified Singapore Emergency & Escalation Channels
          </h3>

          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {EMERGENCY_HOTLINES.map((hotline) => (
              <div
                key={hotline.service}
                className="flex flex-col justify-between rounded-[16px] border border-[var(--sq-line)] bg-[var(--sq-surface)] p-4 shadow-sm"
              >
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--sq-ink-muted)]">
                    {hotline.agency}
                  </span>
                  <h4 className="mt-0.5 text-sm font-extrabold text-[var(--sq-ink)]">
                    {hotline.service}
                  </h4>
                  <p className="mt-1.5 text-xs leading-relaxed text-[var(--sq-ink-muted)]">
                    {hotline.desc}
                  </p>
                </div>

                <div className="mt-4 rounded-[16px] border border-[var(--sq-line)] bg-[var(--sq-surface-sunk)] p-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-[var(--sq-risk)]">
                      {hotline.contact}
                    </span>
                    <span className="text-[10px] font-bold text-[var(--sq-ink-muted)]">
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
