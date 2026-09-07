import { useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Dice5,
  Eye,
  MessageSquare,
  Shield,
  Sparkles,
  Zap,
} from 'lucide-react';
import { PlayerAvatarMark } from '../city-board/PlayerAvatar';

interface PlayerOnboardingModalProps {
  open: boolean;
  onComplete: () => void;
}

const AVAILABLE_TOKENS = ['explorer-beacon', 'explorer-scout', 'explorer-sentinel', 'explorer-vanguard'];

export function PlayerOnboardingModal({ open, onComplete }: PlayerOnboardingModalProps) {
  const [step, setStep] = useState(1);
  const [selectedToken, setSelectedToken] = useState('explorer-beacon');

  if (!open) return null;

  const totalSteps = 7;

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      localStorage.setItem('sq_player_token', selectedToken);
      onComplete();
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/80 p-4 backdrop-blur-md">
      <div className="relative flex max-h-[90vh] w-full max-w-lg flex-col justify-between overflow-hidden rounded-3xl border-2 border-white/20 bg-navy-900 text-white shadow-2xl">
        {/* Top Progress Bar */}
        <div className="border-b border-white/10 p-5">
          <div className="flex items-center justify-between text-xs font-black uppercase tracking-wider text-amber-400">
            <span>Onboarding Briefing</span>
            <span className="tabular-nums">
              Step {step} of {totalSteps}
            </span>
          </div>
          <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-navy-950">
            <div
              className="h-full rounded-full bg-gradient-to-r from-amber-400 to-amber-500 transition-all duration-300"
              style={{ width: `${(step / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {/* Dynamic Step Content */}
        <div className="flex-1 overflow-y-auto p-6 text-center">
          {/* SCREEN 1: Welcome to ShieldQuest */}
          {step === 1 && (
            <div className="py-4">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-amber-400 to-amber-600 text-navy-950 shadow-xl shadow-amber-500/20">
                <Shield className="h-10 w-10 fill-current" />
              </div>
              <h2 className="mt-6 text-2xl font-black uppercase tracking-tight text-white sm:text-3xl">
                Welcome to ShieldQuest
              </h2>
              <p className="mt-3 text-sm font-medium leading-relaxed text-slate-300">
                Your city, your choices. Step into an interactive 2.5D district where you and your squad will navigate
                authentic challenges and uncover the real-world consequences behind online offers.
              </p>
            </div>
          )}

          {/* SCREEN 2: Your Mission */}
          {step === 2 && (
            <div className="py-4">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-civic-500/20 text-civic-400">
                <Zap className="h-8 w-8" />
              </div>
              <h2 className="mt-5 text-2xl font-black uppercase tracking-tight text-white">
                Your City Mission
              </h2>
              <p className="mt-2 text-xs font-semibold text-slate-300">
                Scams and digital crime are evolving fast. In this mission, you will:
              </p>
              <div className="mt-6 space-y-3 text-left">
                <div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-3.5">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 text-amber-400 shrink-0" />
                  <p className="text-xs text-slate-200">
                    <strong className="text-white">Travel 4 Distinct Districts:</strong> School Street, Retail Plaza,
                    Digi Tower, and Community Beacon.
                  </p>
                </div>
                <div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-3.5">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 text-amber-400 shrink-0" />
                  <p className="text-xs text-slate-200">
                    <strong className="text-white">Spot Risk Signals:</strong> Uncover hidden traps behind fast cash,
                    urgent messages, and borrowed accounts.
                  </p>
                </div>
                <div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-3.5">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 text-amber-400 shrink-0" />
                  <p className="text-xs text-slate-200">
                    <strong className="text-white">Protect Your Peers:</strong> Intervene constructively when you see a
                    friend being misled.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* SCREEN 3: Meet the S.H.I.E.L.D. Guardians */}
          {step === 3 && (
            <div className="py-2">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-500/20 text-teal-400">
                <Shield className="h-7 w-7" />
              </div>
              <h2 className="mt-3 text-xl font-black uppercase text-white">
                Meet the S.H.I.E.L.D. Guardians
              </h2>
              <p className="mt-1 text-xs text-slate-300">
                Six specialized allies represent your crime-prevention capabilities:
              </p>
              <div className="mt-4 grid grid-cols-2 gap-2 text-left">
                <div className="rounded-xl border border-amber-400/30 bg-amber-500/10 p-2.5">
                  <span className="text-[10px] font-black text-amber-300">SPOT · VeriFox</span>
                  <p className="mt-0.5 text-[11px] text-slate-300">Detect deceptive triggers</p>
                </div>
                <div className="rounded-xl border border-teal-400/30 bg-teal-500/10 p-2.5">
                  <span className="text-[10px] font-black text-teal-300">HOLD · Echo</span>
                  <p className="mt-0.5 text-[11px] text-slate-300">Pause before sending funds</p>
                </div>
                <div className="rounded-xl border border-blue-400/30 bg-blue-500/10 p-2.5">
                  <span className="text-[10px] font-black text-blue-300">IDENTIFY · Cluepaw</span>
                  <p className="mt-0.5 text-[11px] text-slate-300">Verify seller credentials</p>
                </div>
                <div className="rounded-xl border border-indigo-400/30 bg-indigo-500/10 p-2.5">
                  <span className="text-[10px] font-black text-indigo-300">EVALUATE · ByteBuddy</span>
                  <p className="mt-0.5 text-[11px] text-slate-300">Check app permissions</p>
                </div>
                <div className="rounded-xl border border-rose-400/30 bg-rose-500/10 p-2.5">
                  <span className="text-[10px] font-black text-rose-300">LEAD · Beacon</span>
                  <p className="mt-0.5 text-[11px] text-slate-300">Constructive peer guidance</p>
                </div>
                <div className="rounded-xl border border-emerald-400/30 bg-emerald-500/10 p-2.5">
                  <span className="text-[10px] font-black text-emerald-300">DEFEND · Shieldfin</span>
                  <p className="mt-0.5 text-[11px] text-slate-300">Safeguard bank accounts</p>
                </div>
              </div>
            </div>
          )}

          {/* SCREEN 4: How Decisions Work */}
          {step === 4 && (
            <div className="py-4">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-400">
                <Eye className="h-7 w-7" />
              </div>
              <h2 className="mt-4 text-xl font-black uppercase text-white">
                How Decisions Work
              </h2>
              <p className="mt-2 text-xs text-slate-300">
                Every scenario presents choices with multi-stage outcomes:
              </p>
              <div className="mt-6 space-y-3 text-left">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <span className="text-xs font-extrabold uppercase text-amber-400">1. Immediate Outcome</span>
                  <p className="mt-1 text-xs text-slate-300">
                    See what happens right away: do you earn coins, lose access, or successfully avoid a trap?
                  </p>
                </div>
                <div className="rounded-2xl border border-rose-400/20 bg-rose-500/10 p-4">
                  <span className="text-xs font-extrabold uppercase text-rose-300">2. Delayed Consequences</span>
                  <p className="mt-1 text-xs text-slate-300">
                    Real consequences unfold over time. An account lent today might receive frozen notices days later.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* SCREEN 5: Think–Vote–Explain */}
          {step === 5 && (
            <div className="py-4">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-civic-500/20 text-civic-400">
                <MessageSquare className="h-7 w-7" />
              </div>
              <h2 className="mt-4 text-xl font-black uppercase text-white">
                Think – Vote – Explain
              </h2>
              <p className="mt-2 text-xs text-slate-300">
                When you land on group decision spaces, your squad collaborates:
              </p>
              <div className="mt-6 grid grid-cols-3 gap-2.5 text-center">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                  <div className="text-sm font-black text-amber-400">THINK</div>
                  <p className="mt-1 text-[10px] text-slate-400">Private situational review</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                  <div className="text-sm font-black text-teal-400">VOTE</div>
                  <p className="mt-1 text-[10px] text-slate-400">Anonymous squad poll</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                  <div className="text-sm font-black text-civic-400">EXPLAIN</div>
                  <p className="mt-1 text-[10px] text-slate-400">Debate different perspectives</p>
                </div>
              </div>
              <p className="mt-6 text-xs text-slate-400 font-medium">
                No individual names are shown during voting. Psychological safety is guaranteed.
              </p>
            </div>
          )}

          {/* SCREEN 6: Choose Player Token */}
          {step === 6 && (
            <div className="py-4">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-400">
                <Dice5 className="h-7 w-7" />
              </div>
              <h2 className="mt-4 text-xl font-black uppercase text-white">
                Choose Your Token
              </h2>
              <p className="mt-1 text-xs text-slate-300">
                Select your Explorer crest to represent your pawn on the 2.5D board:
              </p>
              <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
                {AVAILABLE_TOKENS.map((tid) => {
                  const isSelected = selectedToken === tid;
                  return (
                    <button
                      key={tid}
                      type="button"
                      onClick={() => setSelectedToken(tid)}
                      className={`flex flex-col items-center justify-center rounded-2xl border-2 p-3 transition ${
                        isSelected
                          ? 'border-amber-400 bg-amber-500/20 shadow-lg shadow-amber-400/20'
                          : 'border-white/10 bg-white/5 hover:border-white/30'
                      }`}
                    >
                      <PlayerAvatarMark tokenId={tid} className="h-12 w-12" />
                      <span className="mt-2 text-[10px] font-black uppercase tracking-wider text-slate-300">
                        {tid.replace('explorer-', '')}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* SCREEN 7: Enter the City */}
          {step === 7 && (
            <div className="py-6">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-emerald-400 to-emerald-600 text-navy-950 shadow-xl shadow-emerald-500/25">
                <Sparkles className="h-10 w-10" />
              </div>
              <h2 className="mt-6 text-2xl font-black uppercase text-white">
                You Are Ready
              </h2>
              <p className="mt-3 text-sm text-slate-300 font-medium leading-relaxed">
                You start at <strong className="text-amber-400">Shield Central (GO)</strong>.
                Roll the dice, make wise choices with your squad, and build your crime-prevention SHIELD!
              </p>
            </div>
          )}
        </div>

        {/* Bottom Navigation Buttons */}
        <div className="flex items-center justify-between border-t border-white/10 bg-navy-950/60 p-4">
          {step > 1 ? (
            <button
              type="button"
              onClick={handleBack}
              className="inline-flex items-center gap-1.5 rounded-xl border border-white/20 px-4 py-2.5 text-xs font-bold text-slate-300 hover:bg-white/10"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back</span>
            </button>
          ) : (
            <div />
          )}

          <button
            type="button"
            onClick={handleNext}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 px-6 py-2.5 text-xs font-black uppercase tracking-wider text-navy-950 shadow-lg shadow-amber-400/20 hover:brightness-110 active:scale-95"
          >
            <span>{step === totalSteps ? 'Enter City' : 'Continue'}</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
