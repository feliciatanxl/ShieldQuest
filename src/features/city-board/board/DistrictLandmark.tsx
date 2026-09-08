import { CheckCircle2, Shield, Sparkles } from 'lucide-react';
import type { CityDistrictId } from '../../../../types/city-board';

interface DistrictLandmarkProps {
  districtId: CityDistrictId;
  districtName: string;
  completed: number;
  total: number;
  cleared: boolean;
  onSecuredClick?: () => void;
}

/**
 * One tint per district, each drawn from the semantic roles so the landmark
 * agrees with the rest of the board: school reads as "earned" amber, retail as
 * risk, digital as the civic action blue, community as peer teal.
 */
const DISTRICT_TINT: Record<CityDistrictId, string> = {
  school:
    'linear-gradient(135deg, color-mix(in srgb, var(--sq-earned) 30%, transparent) 0%, var(--color-navy-950) 100%)',
  retail:
    'linear-gradient(135deg, color-mix(in srgb, var(--sq-risk) 30%, transparent) 0%, var(--color-navy-950) 100%)',
  digital:
    'linear-gradient(135deg, color-mix(in srgb, var(--sq-action) 34%, transparent) 0%, var(--color-navy-950) 100%)',
  community:
    'linear-gradient(135deg, color-mix(in srgb, var(--sq-peer) 34%, transparent) 0%, var(--color-navy-950) 100%)',
};

export function DistrictLandmark({
  districtId,
  districtName,
  completed,
  total,
  cleared,
  onSecuredClick,
}: DistrictLandmarkProps) {

  return (
    <div
      className="district-landmark-centerpiece pointer-events-auto flex h-full w-full flex-col items-center justify-end select-none"
      style={{
        /*
          Counter-rotated so the landmark stands upright on the plaza.

          No vertical lift here any more. `rotateX(-60deg)` undoes the board's
          foreshortening, so a cell that occupies ~138px on screen renders a
          276px-tall upright panel — and a -20px lift on top of that pushed the
          landmark far enough up to cover the top row of tiles. Sizing the panel
          to its visual footprint (below) keeps it clear of the track, so the
          spaces behind it stay visible and clickable.
        */
        transform: 'rotateZ(45deg) rotateX(-60deg)',
        transformStyle: 'preserve-3d',
      }}
    >
      {/* 3D Elevated Base Platform */}
      <div
        className="relative flex h-[72%] w-[86%] flex-col items-center justify-start gap-1 rounded-[16px] border-2 border-white/25 p-2.5 shadow-[0_20px_40px_rgba(0,0,0,0.85),inset_0_2px_4px_rgba(255,255,255,0.2)] backdrop-blur-md transition-all duration-500"
        /*
          District tint over the canonical navy.
          
          These were raw Tailwind defaults — amber-500, red-500, blue-500,
          teal-500 over slate-900 — none of which exist in this palette. Mixed
          at 28% over #0f172a, the school tint in particular resolved to a
          muddy brown that looked like a foreign asset dropped onto the board.
          Each district now tints with its own role colour over navy-950.
        */
        style={{
          background: DISTRICT_TINT[districtId],
          /*
            Stands the panel on the plaza floor.

            Centred in its cell, an upright panel hangs half its height BELOW
            the board — which put the building behind the Roll Dice bar and the
            district chips, so only its roofline was ever visible. Shifting it
            up by half its own height puts its base on the plaza and lets it
            rise, which is how a landmark should sit.
          */
          transform: 'translateY(-50%)',
        }}
      >
        {/*
          The district name, or the secured action once the district is cleared.

          Both live at the TOP of the panel because the bottom of the landmark
          sits behind the Roll Dice bar — the progress block that used to be
          down there was measured at y 350-370 against a dice bar at y 339-407,
          so it was permanently invisible, and the "District Secured" button
          with it. Anything actionable has to be above the fold of the plaza.
        */}
        {cleared ? (
          <button
            type="button"
            onClick={onSecuredClick}
            className="group flex items-center gap-1.5 rounded-full border border-[var(--sq-earned)] bg-gradient-to-r from-[var(--color-amber-500)] to-[var(--color-amber-400)] px-3 py-1 text-[10px] font-black uppercase tracking-widest text-[var(--color-navy-950)] shadow-lg transition hover:brightness-110 active:scale-95"
          >
            <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
            <span>{districtName} secured</span>
            <Sparkles className="h-3.5 w-3.5 transition group-hover:rotate-12" aria-hidden="true" />
          </button>
        ) : (
          <div className="flex items-center gap-1.5 rounded-full border border-white/20 bg-[var(--color-navy-950)]/90 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-widest text-[var(--sq-earned)] shadow-md">
            <Shield className="h-3.5 w-3.5" aria-hidden="true" />
            <span>{districtName}</span>
            <span className="tabular-nums text-white/70">
              {completed}/{total}
            </span>
          </div>
        )}

        {/* 2.5D Illustrated Centerpiece Icon / Building Representation */}
        <div
          /* Fills the space under the title and scales the artwork to fit,
           * rather than sitting at a fixed 120x100 that overflowed the panel
           * and clipped the building to its roofline. */
          className="landmark-illustration relative flex min-h-0 flex-1 items-center justify-center [&_svg]:h-full [&_svg]:w-auto [&_svg]:max-h-full transition-transform duration-700 hover:scale-105"
          style={{ transform: 'translateZ(18px)' }}
        >
          {districtId === 'school' && (
            <div className="relative flex flex-col items-center">
              {/* School Tower SVG */}
              <svg width="104" height="86" viewBox="0 0 120 100" fill="none" className="drop-shadow-2xl">
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
              <svg width="104" height="86" viewBox="0 0 120 100" fill="none" className="drop-shadow-2xl">
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
              <svg width="104" height="86" viewBox="0 0 120 100" fill="none" className="drop-shadow-2xl">
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
              <svg width="104" height="86" viewBox="0 0 120 100" fill="none" className="drop-shadow-2xl">
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

      </div>
    </div>
  );
}
