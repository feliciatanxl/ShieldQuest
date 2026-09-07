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
    <div className="flex min-h-full flex-col bg-slate-50 text-slate-800">
      {/* Top Header */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200 bg-white/95 px-4 py-3.5 backdrop-blur-md">
        <button
          type="button"
          onClick={() => (step === 'intro' ? navigate('/board') : setStep('intro'))}
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600 transition hover:bg-slate-200"
          aria-label="Back"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="text-center">
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-rose-600">
            Peer Shield Mode
          </span>
          <h1 className="text-base font-extrabold text-navy-900 sm:text-lg">
            Friend in Trouble
          </h1>
        </div>
        <Link
          to="/board"
          className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-bold text-slate-600 transition hover:bg-slate-100"
        >
          Exit
        </Link>
      </header>

      {/* Main Content Area */}
      <main className="flex flex-1 flex-col items-center justify-center p-4 sm:p-6">
        {step === 'intro' && (
          <div className="w-full max-w-md animate-in fade-in zoom-in-95 duration-200">
            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl">
              <div className="relative overflow-hidden bg-gradient-to-br from-rose-600 to-rose-700 p-8 text-center text-white">
                <div className="relative z-10">
                  <span className="inline-block rounded-full bg-rose-800/60 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-rose-200">
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
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Guardian Mentors
                  </span>
                  <div className="mt-1.5 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-rose-100 text-rose-600">
                      <HandHeart className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-800">Echo & Beacon</p>
                      <p className="text-xs text-slate-500">
                        Peer Support & Guiding Light
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Scenario Context
                  </span>
                  <p className="mt-1 text-xs leading-relaxed text-slate-700 sm:text-sm">
                    Your schoolmate Alex receives a suspicious message offering fast cash
                    just to "borrow" their bank account for a few hours. Alex is excited
                    and about to send their login details.
                  </p>
                </div>

                <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
                  <p className="font-bold flex items-center gap-1.5 text-amber-900">
                    <Sparkles className="h-4 w-4 text-amber-600" />
                    Peer Shield Principle
                  </p>
                  <p className="mt-1">
                    Bystander intervention protects friends before irreversible legal or financial harm occurs.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setStep('chat')}
                  className="flex min-h-[50px] w-full items-center justify-center gap-2 rounded-xl bg-navy-900 py-3.5 text-base font-extrabold text-white shadow-lg shadow-navy-900/20 transition hover:bg-navy-800 active:scale-[0.98]"
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
              <div className="mb-4 text-center text-xs font-semibold text-slate-400">
                Today · Direct Chat with Alex
              </div>

              {/* Chat Thread */}
              <div className="space-y-3">
                <div className="flex items-end gap-2.5">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-indigo-200 bg-indigo-100 text-xs font-extrabold text-indigo-700">
                    AL
                  </div>
                  <div className="max-w-[82%] rounded-2xl rounded-bl-sm border border-slate-200 bg-white p-3.5 text-xs text-slate-800 shadow-sm sm:text-sm">
                    Hey! Someone on Telegram just offered me $300 just to let them transfer some funds through my bank account. Should I do it? 🤑
                  </div>
                </div>

                <div className="flex items-end gap-2.5">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-indigo-200 bg-indigo-100 text-xs font-extrabold text-indigo-700">
                    AL
                  </div>
                  <div className="max-w-[82%] rounded-2xl rounded-bl-sm border border-slate-200 bg-white p-3.5 text-xs text-slate-800 shadow-sm sm:text-sm">
                    I really want that new gaming headset, but they are asking for my Singpass / bank login to set up the transfer... 🤔
                  </div>
                </div>
              </div>

              {/* Red Flags Notice */}
              <div className="mt-5 flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50/80 p-3.5 text-xs">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" />
                <div>
                  <h4 className="font-bold text-rose-900">Critical Red Flags</h4>
                  <ul className="mt-1 list-disc space-y-0.5 pl-4 text-rose-800">
                    <li>Asking for bank credentials or Singpass login.</li>
                    <li>Money mule scheme: transferring illicit funds is a criminal offence.</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Decision Choices */}
            <div className="mt-6">
              <h3 className="mb-3 text-center text-sm font-extrabold text-navy-900">
                How do you respond to Alex?
              </h3>
              <div className="space-y-2.5">
                {choices.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => handleChoose(c.id)}
                    className={`w-full rounded-2xl border-2 p-3.5 text-left transition active:scale-[0.98] ${
                      selectedChoice === c.id
                        ? 'border-civic-600 bg-civic-50 text-civic-900'
                        : 'border-slate-200 bg-white text-slate-800 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
                        {c.type}
                      </span>
                      {c.risk === 'low' ? (
                        <span className="rounded-md bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                          Protective
                        </span>
                      ) : (
                        <span className="rounded-md bg-rose-100 px-2 py-0.5 text-[10px] font-bold text-rose-700">
                          Dangerous
                        </span>
                      )}
                    </div>
                    <p className="mt-1.5 text-xs font-bold leading-snug sm:text-sm">
                      "{c.text}"
                    </p>
                    <p className="mt-1 text-[11px] text-slate-500">{c.helper}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 'reflect' && (
          <div className="w-full max-w-md text-center animate-in fade-in duration-200">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border-2 border-emerald-200 bg-emerald-100 text-emerald-600">
              <HandHeart className="h-8 w-8" />
            </div>

            <h2 className="text-2xl font-black text-navy-900">
              Bystander Reflection
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Evaluating the ripple effects of your intervention
            </p>

            <div className="mt-5 space-y-3 text-left">
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700">
                  What Helped
                </span>
                <p className="mt-1 text-xs font-semibold leading-relaxed text-emerald-950 sm:text-sm">
                  You helped Alex slow down and identify the money mule risk before handing over credentials.
                  Private, respectful guidance gave them an easy way to back out without losing face.
                </p>
              </div>

              <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-rose-700">
                  What Could Escalate It
                </span>
                <p className="mt-1 text-xs font-semibold leading-relaxed text-rose-950 sm:text-sm">
                  Saying "it's probably fine" or mocking them would have pushed them into transferring illicit funds,
                  putting them at risk of criminal prosecution and account freezing.
                </p>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-3 gap-2">
              <div className="rounded-2xl border border-slate-200 bg-white p-3 text-center">
                <ShieldCheck className="mx-auto h-5 w-5 text-emerald-600" />
                <span className="mt-1 block text-xs font-black text-navy-900">+40 Trust</span>
                <span className="text-[10px] text-slate-400">Peer Bond</span>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-3 text-center">
                <AlertTriangle className="mx-auto h-5 w-5 text-emerald-600" />
                <span className="mt-1 block text-xs font-black text-navy-900">-30 Risk</span>
                <span className="text-[10px] text-slate-400">Mule Trap</span>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-3 text-center">
                <Heart className="mx-auto h-5 w-5 text-rose-500" />
                <span className="mt-1 block text-xs font-black text-navy-900">Protected</span>
                <span className="text-[10px] text-slate-400">Safe Choice</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setStep('summary')}
              className="mt-6 flex min-h-[50px] w-full items-center justify-center gap-2 rounded-xl bg-navy-900 py-3.5 text-base font-extrabold text-white shadow-lg shadow-navy-900/20 transition hover:bg-navy-800"
            >
              View Mission Debrief
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        )}

        {step === 'summary' && (
          <div className="w-full max-w-md animate-in fade-in duration-200">
            <div className="text-center">
              <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-amber-600">
                <Shield className="h-7 w-7" />
              </div>
              <h2 className="text-2xl font-black text-navy-900">
                Peer Shield Success
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                You successfully intervened to protect a peer!
              </p>
            </div>

            <div className="mt-5 space-y-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Key Takeaway
                </span>
                <p className="mt-1 text-sm font-bold text-slate-800">
                  Money mule recruitment often disguises itself as quick surveys or informal money transfers. Legitimate businesses never borrow personal bank accounts.
                </p>
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Trusted Escalation Channels
                </span>
                <ul className="mt-1.5 list-disc space-y-1 pl-4 text-xs font-medium text-slate-600">
                  <li>SPF Anti-Scam Helpline (1799)</li>
                  <li>ScamShield WhatsApp & Mobile App</li>
                  <li>School Counsellor / Student Welfare Team</li>
                </ul>
              </div>

              <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4">
                <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700">
                  S.H.I.E.L.D. Competency Mastered
                </span>
                <div className="mt-1 flex items-center gap-2">
                  <HandHeart className="h-5 w-5 text-rose-600" />
                  <span className="font-extrabold text-rose-950">
                    LEAD & DEFEND — Bystander Action
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-2.5">
              <Link
                to="/board"
                className="flex min-h-[50px] w-full items-center justify-center rounded-xl bg-civic-600 py-3.5 text-center text-sm font-extrabold text-white shadow-lg shadow-civic-600/20 transition hover:bg-civic-700"
              >
                Return to City Board
              </Link>
              <Link
                to="/progress"
                className="flex min-h-[46px] w-full items-center justify-center rounded-xl border border-slate-200 bg-white py-2.5 text-center text-xs font-bold text-slate-700 transition hover:bg-slate-100"
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
