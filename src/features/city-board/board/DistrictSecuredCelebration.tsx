import { useEffect, useState } from 'react';
import { ArrowRight, Award, CheckCircle2, Sparkles, Trophy } from 'lucide-react';
import type { CityDistrictId } from '../../../../types/city-board';
import { DISTRICT_CHAPTER } from '../data/world-data';

interface DistrictSecuredCelebrationProps {
  districtId: CityDistrictId;
  districtName: string;
  nextDistrictId?: CityDistrictId;
  nextDistrictName?: string;
  onContinue: () => void;
}

export function DistrictSecuredCelebration({
  districtId,
  districtName,
  nextDistrictId: _nextDistrictId,
  nextDistrictName,
  onContinue,
}: DistrictSecuredCelebrationProps) {
  const [stage, setStage] = useState<'burst' | 'card' | 'transition'>('burst');

  useEffect(() => {
    const timer = setTimeout(() => {
      setStage('card');
    }, 900);
    return () => clearTimeout(timer);
  }, []);

  const handleAdvance = () => {
    setStage('transition');
    setTimeout(() => {
      onContinue();
    }, 700);
  };

  const chapter = DISTRICT_CHAPTER[districtId];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="district-secured-title"
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-xl transition-all duration-700 ${
        stage === 'transition' ? 'opacity-0 scale-105' : 'opacity-100 scale-100'
      }`}
      style={{
        background: 'radial-gradient(circle at center, rgba(15, 23, 42, 0.94) 0%, rgba(6, 13, 27, 0.98) 100%)',
      }}
    >
      {/* Golden Confetti Particles Background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="animate-float-up absolute -top-10 left-1/4 h-32 w-32 rounded-full bg-amber-400/20 blur-2xl" />
        <div className="animate-float-up absolute top-1/3 right-1/4 h-48 w-48 rounded-full bg-amber-500/25 blur-3xl" />
        <div className="animate-float-up absolute -bottom-10 left-1/2 h-40 w-40 rounded-full bg-amber-300/20 blur-2xl" />
      </div>

      <div className="relative mx-auto flex w-full max-w-md flex-col items-center text-center">
        {/* Animated Badge Crest */}
        <div className="animate-pop relative mb-4 flex h-24 w-24 items-center justify-center rounded-3xl border-2 border-amber-400/80 bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 shadow-[0_0_50px_rgba(245,158,11,0.5)]">
          <Trophy className="h-12 w-12 text-navy-950 drop-shadow-md" />
          <span className="animate-spin absolute -top-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full bg-amber-300 shadow">
            <Sparkles className="h-4 w-4 text-navy-950" />
          </span>
        </div>

        <p className="text-[11px] font-black uppercase tracking-[0.24em] text-amber-400">
          District Milestone Cleared
        </p>

        <h1
          id="district-secured-title"
          className="mt-1 text-3xl font-black uppercase tracking-tight text-white drop-shadow"
        >
          {districtName} Secured!
        </h1>

        <p className="mt-2 text-[14px] leading-relaxed text-white/80">
          You made safe choices, spotted scam risks, and defended your peers across {chapter?.title ?? districtName}.
        </p>

        {/* Rewards Box */}
        <div className="mt-5 flex w-full items-center justify-around rounded-2xl border border-white/15 bg-white/10 p-3.5 backdrop-blur-md shadow-inner">
          <div className="flex flex-col items-center">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-300">
              Shield Tokens
            </span>
            <span className="mt-0.5 text-2xl font-black text-white">+100</span>
          </div>
          <div className="h-8 w-px bg-white/15" />
          <div className="flex flex-col items-center">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-300">
              District Badge
            </span>
            <span className="mt-0.5 flex items-center gap-1 text-sm font-extrabold text-white">
              <CheckCircle2 className="h-4 w-4 text-leaf-400" />
              Unlocked
            </span>
          </div>
        </div>

        {/* Action Button */}
        <button
          type="button"
          onClick={handleAdvance}
          className="mt-6 flex w-full items-center justify-center gap-2.5 rounded-2xl border-b-4 border-amber-700 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400 p-4 text-[16px] font-black uppercase tracking-wider text-navy-950 shadow-xl shadow-amber-500/30 transition hover:brightness-105 active:translate-y-1 active:border-b-0"
        >
          {nextDistrictName ? (
            <>
              <span>Fly To {nextDistrictName}</span>
              <ArrowRight className="h-5 w-5" />
            </>
          ) : (
            <>
              <span>Complete City Tour</span>
              <Award className="h-5 w-5" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
