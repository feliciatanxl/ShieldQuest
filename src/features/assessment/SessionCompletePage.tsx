import { Link } from 'react-router-dom';
import {
  MapPin,
  Shield,
  Trophy,
} from 'lucide-react';
import { useSessionStore } from '../../stores/sessionStore';

export function SessionCompletePage() {
  const { shieldTokens, districtBadges } = useSessionStore();

  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center bg-gradient-to-b from-navy-950 via-navy-900 to-slate-900 p-4 text-white sm:p-6">
      <div className="w-full max-w-lg text-center animate-in fade-in zoom-in-95 duration-200">
        {/* Celebration Trophy */}
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-amber-500/20 text-amber-400 ring-4 ring-amber-400/30">
          <Trophy className="h-10 w-10" />
        </div>

        <span className="mt-6 inline-block rounded-full bg-amber-400/20 px-4 py-1 text-xs font-black uppercase tracking-widest text-amber-300">
          Cohort Session Complete
        </span>
        <h1 className="mt-3 text-3xl font-black text-white sm:text-4xl">
          Certificate of Completion
        </h1>
        <p className="mt-2 text-xs text-navy-200 sm:text-sm">
          Project SHIELD · Facilitated Crime & Scam Prevention Workshop
        </p>

        {/* Certificate Card */}
        <div className="mt-6 overflow-hidden rounded-3xl border border-white/20 bg-white/10 p-6 text-left shadow-2xl backdrop-blur-md sm:p-8">
          <div className="flex items-center justify-between border-b border-white/15 pb-4">
            <div className="flex items-center gap-3">
              <Shield className="h-8 w-8 text-amber-400" />
              <div>
                <h2 className="text-lg font-black text-white">Shield Defender</h2>
                <p className="text-[11px] font-bold text-amber-300 uppercase tracking-wider">
                  Level 1 Certified
                </p>
              </div>
            </div>
            <span className="rounded-md bg-emerald-500/20 px-2.5 py-1 text-xs font-black text-emerald-400">
              Verified Pilot
            </span>
          </div>

          <div className="mt-5 space-y-3 text-xs leading-relaxed text-slate-200">
            <p>
              This certifies active participation in youth-led, scenario-based deliberation
              covering cyber-hygiene, anti-money mule defense, and peer bystander intervention.
            </p>
          </div>

          {/* Outcome Stats */}
          <div className="mt-6 grid grid-cols-3 gap-2 border-t border-white/15 pt-5 text-center">
            <div className="rounded-xl bg-white/5 p-2.5">
              <span className="block text-xl font-black text-amber-400 tabular-nums">
                {shieldTokens}
              </span>
              <span className="text-[10px] font-bold text-white/70 uppercase">
                Shield Tokens
              </span>
            </div>
            <div className="rounded-xl bg-white/5 p-2.5">
              <span className="block text-xl font-black text-emerald-400 tabular-nums">
                {districtBadges.length || 4}
              </span>
              <span className="text-[10px] font-bold text-white/70 uppercase">
                Districts Cleared
              </span>
            </div>
            <div className="rounded-xl bg-white/5 p-2.5">
              <span className="block text-xl font-black text-cyan-400 tabular-nums">
                6 / 6
              </span>
              <span className="text-[10px] font-bold text-white/70 uppercase">
                Skills Practised
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            to="/shield-central"
            className="flex min-h-[48px] flex-1 items-center justify-center gap-2 rounded-xl bg-amber-500 text-sm font-extrabold text-navy-950 transition hover:bg-amber-400"
          >
            <Shield className="h-4 w-4" />
            Shield Central
          </Link>
          <Link
            to="/board"
            className="flex min-h-[48px] flex-1 items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 text-sm font-bold text-white transition hover:bg-white/20"
          >
            <MapPin className="h-4 w-4" />
            Return to Board
          </Link>
        </div>
      </div>
    </div>
  );
}
