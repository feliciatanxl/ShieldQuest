import { Award, CheckCircle2, Shield, Sparkles } from 'lucide-react';
import type { CityDistrictId } from '../../../../types/city-board';

interface DistrictLandmarkProps {
  districtId: CityDistrictId;
  districtName: string;
  completed: number;
  total: number;
  cleared: boolean;
  onSecuredClick?: () => void;
}

export function DistrictLandmark({
  districtId,
  districtName,
  completed,
  total,
  cleared,
  onSecuredClick,
}: DistrictLandmarkProps) {
  const progressPercent = total > 0 ? Math.min(100, Math.round((completed / total) * 100)) : 100;

  return (
    <div
      className="district-landmark-centerpiece pointer-events-auto flex h-full w-full flex-col items-center justify-center select-none"
      style={{
        transform: 'rotateZ(45deg) rotateX(-60deg) translateY(-20px)',
        transformStyle: 'preserve-3d',
      }}
    >
      {/* 3D Elevated Base Platform */}
      <div
        className="relative flex h-full w-full flex-col items-center justify-between rounded-3xl border-2 border-white/25 p-3.5 shadow-[0_20px_40px_rgba(0,0,0,0.85),inset_0_2px_4px_rgba(255,255,255,0.2)] backdrop-blur-md transition-all duration-500"
        style={{
          background:
            districtId === 'school'
              ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.28) 0%, rgba(15, 23, 42, 0.95) 100%)'
              : districtId === 'retail'
                ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.28) 0%, rgba(15, 23, 42, 0.95) 100%)'
                : districtId === 'digital'
                  ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.32) 0%, rgba(15, 23, 42, 0.95) 100%)'
                  : 'linear-gradient(135deg, rgba(20, 184, 166, 0.32) 0%, rgba(15, 23, 42, 0.95) 100%)',
        }}
      >
        {/* District Title Pill */}
        <div className="flex items-center gap-1.5 rounded-full border border-white/20 bg-navy-950/90 px-3 py-1 text-[11px] font-extrabold uppercase tracking-widest text-amber-300 shadow-md">
          <Shield className="h-3.5 w-3.5 text-amber-400" />
          <span>{districtName}</span>
        </div>

        {/* 2.5D Illustrated Centerpiece Icon / Building Representation */}
        <div
          className="landmark-illustration relative my-auto flex items-center justify-center transition-transform duration-700 hover:scale-105"
          style={{ transform: 'translateZ(18px)' }}
        >
          {districtId === 'school' && (
            <div className="relative flex flex-col items-center">
              {/* School Tower SVG */}
              <svg width="120" height="100" viewBox="0 0 120 100" fill="none" className="drop-shadow-2xl">
                {/* Building Roof */}
                <polygon points="60,6 10,42 110,42" fill="#F59E0B" stroke="#FDE68A" strokeWidth="2" />
                {/* Bell Tower Dome */}
                <path d="M50 16 C50 8 70 8 70 16 Z" fill="#D97706" />
                <circle cx="60" cy="14" r="3" fill="#FEF3C7" />
                {/* Main Academy Walls */}
                <rect x="22" y="42" width="76" height="52" rx="4" fill="#1E293B" stroke="#FBBF24" strokeWidth="2" />
                {/* Windows */}
                <rect x="30" y="50" width="14" height="18" rx="2" fill="#38BDF8" opacity="0.85" />
                <rect x="53" y="50" width="14" height="18" rx="2" fill="#38BDF8" opacity="0.85" />
                <rect x="76" y="50" width="14" height="18" rx="2" fill="#38BDF8" opacity="0.85" />
                {/* Archway Gate */}
                <path d="M50 94 V76 C50 70 70 70 70 76 V94 Z" fill="#0F172A" stroke="#F59E0B" strokeWidth="1.5" />
                {/* Shield Crest */}
                <circle cx="60" cy="32" r="7" fill="#FEF3C7" />
                <path d="M58 29 H62 V33 C62 35 60 36 60 36 C60 36 58 35 58 33 Z" fill="#B45309" />
              </svg>
            </div>
          )}

          {districtId === 'retail' && (
            <div className="relative flex flex-col items-center">
              {/* Retail Plaza SVG */}
              <svg width="120" height="100" viewBox="0 0 120 100" fill="none" className="drop-shadow-2xl">
                {/* Neon Canopy */}
                <path d="M14 36 L60 14 L106 36 L60 48 Z" fill="#EF4444" stroke="#FECACA" strokeWidth="1.5" />
                {/* Store Front Body */}
                <rect x="24" y="44" width="72" height="50" rx="4" fill="#1E293B" stroke="#F87171" strokeWidth="2" />
                {/* Large Display Glass Windows */}
                <rect x="30" y="54" width="26" height="28" rx="2" fill="#67E8F9" opacity="0.8" />
                <rect x="64" y="54" width="26" height="28" rx="2" fill="#67E8F9" opacity="0.8" />
                {/* Scanner Beam / Security Hologram */}
                <line x1="32" y1="68" x2="54" y2="68" stroke="#EF4444" strokeWidth="2" opacity="0.9" />
                {/* Verification Star */}
                <circle cx="60" cy="24" r="6" fill="#FEF08A" />
              </svg>
            </div>
          )}

          {districtId === 'digital' && (
            <div className="relative flex flex-col items-center">
              {/* Digi Data Tower SVG */}
              <svg width="120" height="100" viewBox="0 0 120 100" fill="none" className="drop-shadow-2xl">
                {/* Hologram Emitter Antenna */}
                <line x1="60" y1="4" x2="60" y2="22" stroke="#38BDF8" strokeWidth="2.5" />
                <circle cx="60" cy="6" r="3.5" fill="#38BDF8" />
                {/* Isometric Server Tower */}
                <polygon points="60,22 96,38 60,54 24,38" fill="#0284C7" stroke="#BAE6FD" strokeWidth="1.5" />
                <polygon points="24,38 60,54 60,94 24,78" fill="#0F172A" stroke="#38BDF8" strokeWidth="1.5" />
                <polygon points="96,38 60,54 60,94 96,78" fill="#1E293B" stroke="#38BDF8" strokeWidth="1.5" />
                {/* Glowing Circuit Lines */}
                <line x1="34" y1="56" x2="50" y2="63" stroke="#38BDF8" strokeWidth="2" opacity="0.9" />
                <line x1="34" y1="68" x2="50" y2="75" stroke="#38BDF8" strokeWidth="2" opacity="0.9" />
                <line x1="86" y1="56" x2="70" y2="63" stroke="#22D3EE" strokeWidth="2" opacity="0.9" />
                <line x1="86" y1="68" x2="70" y2="75" stroke="#22D3EE" strokeWidth="2" opacity="0.9" />
              </svg>
            </div>
          )}

          {districtId === 'community' && (
            <div className="relative flex flex-col items-center">
              {/* Community Beacon Dome SVG */}
              <svg width="120" height="100" viewBox="0 0 120 100" fill="none" className="drop-shadow-2xl">
                {/* Beacon Light Dome */}
                <path d="M26 48 C26 22 94 22 94 48 Z" fill="#14B8A6" stroke="#99F6E4" strokeWidth="2" />
                {/* Core Light Pillar */}
                <line x1="60" y1="8" x2="60" y2="48" stroke="#FDE047" strokeWidth="3" />
                {/* Supporting Pillars */}
                <rect x="28" y="48" width="10" height="46" rx="2" fill="#1E293B" stroke="#2DD4BF" strokeWidth="1.5" />
                <rect x="55" y="48" width="10" height="46" rx="2" fill="#1E293B" stroke="#2DD4BF" strokeWidth="1.5" />
                <rect x="82" y="48" width="10" height="46" rx="2" fill="#1E293B" stroke="#2DD4BF" strokeWidth="1.5" />
                {/* Community Hands / Crest Shield */}
                <circle cx="60" cy="32" r="8" fill="#F0FDFA" />
                <path d="M57 30 L60 35 L63 30" stroke="#0D9488" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
          )}
        </div>

        {/* Progress Tracker / Secured Badge */}
        <div className="w-full">
          {cleared ? (
            <button
              type="button"
              onClick={onSecuredClick}
              className="group flex w-full items-center justify-center gap-1.5 rounded-xl border border-amber-400 bg-gradient-to-r from-amber-500 to-amber-400 px-2.5 py-1.5 text-[11px] font-black uppercase tracking-wider text-navy-950 shadow-lg shadow-amber-500/30 transition hover:brightness-110 active:scale-95"
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>District Secured!</span>
              <Sparkles className="h-3.5 w-3.5 text-amber-900 transition group-hover:rotate-12" />
            </button>
          ) : (
            <div className="rounded-xl border border-white/15 bg-navy-950/85 p-2 shadow-inner">
              <div className="flex items-center justify-between text-[10px] font-extrabold uppercase tracking-wider text-white/80">
                <span className="flex items-center gap-1">
                  <Award className="h-3 w-3 text-amber-400" />
                  Missions
                </span>
                <span className="tabular-nums text-amber-300">
                  {completed} / {total}
                </span>
              </div>
              <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-navy-900">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-amber-400 to-amber-500 transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
