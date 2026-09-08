import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  AlertTriangle,
  ShieldCheck,
  Heart,
  HandHeart,
  ChevronRight,
  Shield,
  Sparkles,
} from 'lucide-react';
import { useSessionStore } from '../../stores/sessionStore';

type Step = 'intro' | 'chat' | 'reflect' | 'summary';

export function PeerShield() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('intro');
  const [selectedChoice, setSelectedChoice] = useState<number | null>(null);

  const choices = [
    {
      id: 1,
      text: 'Encourage them to stop and verify the offer with an adult.',
      risk: 'low',
      type: 'Safer Choice',
      helper: 'Puts time between urgency and irreversible financial action.',
    },
    {
      id: 2,
      text: 'Tell them it is probably fine because $300 is easy pocket money.',
      risk: 'high',
      type: 'Riskier Choice',
      helper: 'Encourages handing control of credentials to cyber criminals.',
    },
    {
      id: 3,
      text: 'Help them check official SPF anti-scam warnings and report the user.',
      risk: 'low',
      type: 'Safer Choice',
      helper: 'Directs them to verified institutional safeguards.',
    },
  ];

  const handleChoose = (id: number) => {
    setSelectedChoice(id);
    const chosen = choices.find((c) => c.id === id);
    if (chosen && chosen.risk === 'low') {
      try {
        useSessionStore.getState().completePreview('peer-shield-alex', 'beacon');
      } catch {
        // idempotent safeguard
      }
    }
    setTimeout(() => setStep('reflect'), 450);
  };

  return (
    <div data-skin="game"
      className="flex min-h-dvh flex-col bg-[var(--sq-canvas)] text-[var(--sq-ink)]">
      {/* Top Header */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-[var(--sq-line)] bg-[var(--sq-surface)]/95 px-4 py-3.5 backdrop-blur-md">
        <button
          type="button"
          onClick={() => (step === 'intro' ? navigate('/board') : setStep('intro'))}
          className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-[var(--sq-surface-raised)] text-[var(--sq-ink-muted)] transition hover:bg-[var(--sq-surface-raised)]"
          aria-label="Back"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="text-center">
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-[var(--sq-risk)]">
            Peer Shield Mode
          </span>
          <h1 className="text-base font-extrabold text-[var(--sq-ink)] sm:text-lg">
            Friend in Trouble
          </h1>
        </div>
        <Link
          to="/board"
          className="rounded-[6px] border border-[var(--sq-line)] px-2.5 py-1 text-xs font-bold text-[var(--sq-ink-muted)] transition hover:bg-[var(--sq-surface-raised)]"
        >
          Exit
        </Link>
      </header>

      {/* Main Content Area */}
      <main className="flex flex-1 flex-col items-center justify-center p-4 sm:p-6">
        {step === 'intro' && (
          <div className="w-full max-w-md animate-in fade-in zoom-in-95 duration-200">
            <div className="overflow-hidden rounded-[24px] border border-[var(--sq-line)] bg-[var(--sq-surface)] shadow-xl">
              <div className="relative overflow-hidden bg-gradient-to-br from-rose-600 to-rose-700 p-8 text-center text-white">
                <div className="relative z-10">
                  <span className="inline-block rounded-full bg-rose-800/60 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-[var(--sq-risk)]">
                    Bystander Intervention
                  </span>
                  <h2 className="mt-3 text-2xl font-black sm:text-3xl">
                    Friend in Trouble
                  </h2>
                  <p className="mt-1 text-xs font-semibold text-rose-100">
                    S.H.I.E.L.D. Skill: LEAD & DEFEND
                  </p>
                </div>
              </div>

              <div className="space-y-5 p-6">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--sq-ink-muted)]">
                    Guardian Mentors
                  </span>
                  <div className="mt-1.5 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-[16px] bg-[var(--sq-risk)]/15 text-[var(--sq-risk)]">
                      <HandHeart className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-bold text-[var(--sq-ink)]">Echo & Beacon</p>
                      <p className="text-xs text-[var(--sq-ink-muted)]">
                        Peer Support & Guiding Light
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-[16px] border border-[var(--sq-line)] bg-[var(--sq-surface-sunk)] p-4">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--sq-ink-muted)]">
                    Scenario Context
                  </span>
                  <p className="mt-1 text-xs leading-relaxed text-[var(--sq-ink)] sm:text-sm">
                    Your schoolmate Alex receives a suspicious message offering fast cash
                    just to "borrow" their bank account for a few hours. Alex is excited
                    and about to send their login details.
                  </p>
                </div>

                <div className="rounded-[16px] border border-[var(--sq-earned)]/40 bg-[var(--sq-earned)]/15 p-3 text-xs text-[var(--sq-earned-text)]">
                  <p className="font-bold flex items-center gap-1.5 text-[var(--sq-earned-text)]">
                    <Sparkles className="h-4 w-4 text-[var(--sq-earned-text)]" />
                    Peer Shield Principle
                  </p>
                  <p className="mt-1">
                    Bystander intervention protects friends before irreversible legal or financial harm occurs.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setStep('chat')}
                  className="flex min-h-[50px] w-full items-center justify-center gap-2 rounded-[10px] bg-[var(--sq-action)] py-3.5 text-base font-extrabold text-white shadow-lg shadow-navy-900/20 transition hover:bg-[var(--sq-action-hover)] active:scale-[0.98]"
                >
                  Start Intervention
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {step === 'chat' && (
          <div className="flex w-full max-w-md flex-1 flex-col justify-between py-2 animate-in fade-in duration-200">
            <div>
              <div className="mb-4 text-center text-xs font-semibold text-[var(--sq-ink-muted)]">
                Today · Direct Chat with Alex
              </div>

              {/* Chat Thread */}
              <div className="space-y-3">
                <div className="flex items-end gap-2.5">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[var(--sq-action)]/40 bg-[var(--sq-action)]/15 text-xs font-extrabold text-[var(--sq-action-text)]">
                    AL
                  </div>
                  <div className="max-w-[82%] rounded-[16px] rounded-bl-sm border border-[var(--sq-line)] bg-[var(--sq-surface)] p-3.5 text-xs text-[var(--sq-ink)] shadow-sm sm:text-sm">
                    Hey! Someone on Telegram just offered me $300 just to let them transfer some funds through my bank account. Should I do it? 🤑
                  </div>
                </div>

                <div className="flex items-end gap-2.5">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[var(--sq-action)]/40 bg-[var(--sq-action)]/15 text-xs font-extrabold text-[var(--sq-action-text)]">
                    AL
                  </div>
                  <div className="max-w-[82%] rounded-[16px] rounded-bl-sm border border-[var(--sq-line)] bg-[var(--sq-surface)] p-3.5 text-xs text-[var(--sq-ink)] shadow-sm sm:text-sm">
                    I really want that new gaming headset, but they are asking for my Singpass / bank login to set up the transfer... 🤔
                  </div>
                </div>
              </div>

              {/* Red Flags Notice */}
              <div className="mt-5 flex items-start gap-3 rounded-[16px] border border-[var(--sq-risk)]/40 bg-[var(--sq-risk)]/15 p-3.5 text-xs">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-[var(--sq-risk)]" />
                <div>
                  <h4 className="font-bold text-[var(--sq-risk)]">Critical Red Flags</h4>
                  <ul className="mt-1 list-disc space-y-0.5 pl-4 text-[var(--sq-risk)]">
                    <li>Asking for bank credentials or Singpass login.</li>
                    <li>Money mule scheme: transferring illicit funds is a criminal offence.</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Decision Choices */}
            <div className="mt-6">
              <h3 className="mb-3 text-center text-sm font-extrabold text-[var(--sq-ink)]">
                How do you respond to Alex?
              </h3>
              <div className="space-y-2.5">
                {choices.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => handleChoose(c.id)}
                    className={`w-full rounded-[16px] border-2 p-3.5 text-left transition active:scale-[0.98] ${
                      selectedChoice === c.id
                        ? 'border-[var(--sq-action)] bg-[var(--sq-action)]/15 text-[var(--sq-action-text)]'
                        : 'border-[var(--sq-line)] bg-[var(--sq-surface)] text-[var(--sq-ink)] hover:border-[var(--sq-line-strong)]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold uppercase tracking-wider text-[var(--sq-ink-muted)]">
                        {c.type}
                      </span>
                      {c.risk === 'low' ? (
                        <span className="rounded-[6px] bg-[var(--sq-safe)]/15 px-2 py-0.5 text-[10px] font-bold text-[var(--sq-safe)]">
                          Protective
                        </span>
                      ) : (
                        <span className="rounded-[6px] bg-[var(--sq-risk)]/15 px-2 py-0.5 text-[10px] font-bold text-[var(--sq-risk)]">
                          Dangerous
                        </span>
                      )}
                    </div>
                    <p className="mt-1.5 text-xs font-bold leading-snug sm:text-sm">
                      "{c.text}"
                    </p>
                    <p className="mt-1 text-[11px] text-[var(--sq-ink-muted)]">{c.helper}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 'reflect' && (
          <div className="w-full max-w-md text-center animate-in fade-in duration-200">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-[16px] border-2 border-[var(--sq-safe)]/40 bg-[var(--sq-safe)]/15 text-[var(--sq-safe)]">
              <HandHeart className="h-8 w-8" />
            </div>

            <h2 className="text-2xl font-black text-[var(--sq-ink)]">
              Bystander Reflection
            </h2>
            <p className="mt-1 text-xs text-[var(--sq-ink-muted)]">
              Evaluating the ripple effects of your intervention
            </p>

            <div className="mt-5 space-y-3 text-left">
              <div className="rounded-[16px] border border-[var(--sq-safe)]/40 bg-[var(--sq-safe)]/15 p-4">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--sq-safe)]">
                  What Helped
                </span>
                <p className="mt-1 text-xs font-semibold leading-relaxed text-[var(--sq-safe)] sm:text-sm">
                  You helped Alex slow down and identify the money mule risk before handing over credentials.
                  Private, respectful guidance gave them an easy way to back out without losing face.
                </p>
              </div>

              <div className="rounded-[16px] border border-[var(--sq-risk)]/40 bg-[var(--sq-risk)]/15 p-4">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--sq-risk)]">
                  What Could Escalate It
                </span>
                <p className="mt-1 text-xs font-semibold leading-relaxed text-[var(--sq-risk)] sm:text-sm">
                  Saying "it's probably fine" or mocking them would have pushed them into transferring illicit funds,
                  putting them at risk of criminal prosecution and account freezing.
                </p>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-3 gap-2">
              <div className="rounded-[16px] border border-[var(--sq-line)] bg-[var(--sq-surface)] p-3 text-center">
                <ShieldCheck className="mx-auto h-5 w-5 text-[var(--sq-safe)]" />
                <span className="mt-1 block text-xs font-black text-[var(--sq-ink)]">+40 Trust</span>
                <span className="text-[10px] text-[var(--sq-ink-muted)]">Peer Bond</span>
              </div>
              <div className="rounded-[16px] border border-[var(--sq-line)] bg-[var(--sq-surface)] p-3 text-center">
                <AlertTriangle className="mx-auto h-5 w-5 text-[var(--sq-safe)]" />
                <span className="mt-1 block text-xs font-black text-[var(--sq-ink)]">-30 Risk</span>
                <span className="text-[10px] text-[var(--sq-ink-muted)]">Mule Trap</span>
              </div>
              <div className="rounded-[16px] border border-[var(--sq-line)] bg-[var(--sq-surface)] p-3 text-center">
                <Heart className="mx-auto h-5 w-5 text-[var(--sq-risk)]" />
                <span className="mt-1 block text-xs font-black text-[var(--sq-ink)]">Protected</span>
                <span className="text-[10px] text-[var(--sq-ink-muted)]">Safe Choice</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setStep('summary')}
              className="mt-6 flex min-h-[50px] w-full items-center justify-center gap-2 rounded-[10px] bg-[var(--sq-action)] py-3.5 text-base font-extrabold text-white shadow-lg shadow-navy-900/20 transition hover:bg-[var(--sq-action-hover)]"
            >
              View Mission Debrief
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        )}

        {step === 'summary' && (
          <div className="w-full max-w-md animate-in fade-in duration-200">
            <div className="text-center">
              <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-[16px] bg-[var(--sq-earned)]/15 text-[var(--sq-earned-text)]">
                <Shield className="h-7 w-7" />
              </div>
              <h2 className="text-2xl font-black text-[var(--sq-ink)]">
                Peer Shield Success
              </h2>
              <p className="mt-1 text-xs text-[var(--sq-ink-muted)]">
                You successfully intervened to protect a peer!
              </p>
            </div>

            <div className="mt-5 space-y-4 rounded-[24px] border border-[var(--sq-line)] bg-[var(--sq-surface)] p-5 shadow-sm sm:p-6">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--sq-ink-muted)]">
                  Key Takeaway
                </span>
                <p className="mt-1 text-sm font-bold text-[var(--sq-ink)]">
                  Money mule recruitment often disguises itself as quick surveys or informal money transfers. Legitimate businesses never borrow personal bank accounts.
                </p>
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--sq-ink-muted)]">
                  Trusted Escalation Channels
                </span>
                <ul className="mt-1.5 list-disc space-y-1 pl-4 text-xs font-medium text-[var(--sq-ink-muted)]">
                  <li>SPF Anti-Scam Helpline (1799)</li>
                  <li>ScamShield WhatsApp & Mobile App</li>
                  <li>School Counsellor / Student Welfare Team</li>
                </ul>
              </div>

              <div className="rounded-[16px] border border-[var(--sq-risk)]/40 bg-[var(--sq-risk)]/15 p-4">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--sq-risk)]">
                  S.H.I.E.L.D. Competency Mastered
                </span>
                <div className="mt-1 flex items-center gap-2">
                  <HandHeart className="h-5 w-5 text-[var(--sq-risk)]" />
                  <span className="font-extrabold text-[var(--sq-risk)]">
                    LEAD & DEFEND — Bystander Action
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-2.5">
              <Link
                to="/board"
                className="flex min-h-[50px] w-full items-center justify-center rounded-[10px] bg-[var(--sq-action)] py-3.5 text-center text-sm font-extrabold text-white shadow-lg shadow-civic-600/20 transition hover:bg-[var(--sq-action-hover)]"
              >
                Return to City Board
              </Link>
              <Link
                to="/progress"
                className="flex min-h-[46px] w-full items-center justify-center rounded-[10px] border border-[var(--sq-line)] bg-[var(--sq-surface)] py-2.5 text-center text-xs font-bold text-[var(--sq-ink)] transition hover:bg-[var(--sq-surface-raised)]"
              >
                Check Player Progress
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
