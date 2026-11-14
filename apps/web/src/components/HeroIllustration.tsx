import React, { useState } from 'react';
import { MapPin, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface CityWaypoint {
  id: string;
  name: string;
  district: string;
  districtId: string;
  x: number; // percentage
  y: number; // percentage
  threat: string;
  guardian: string;
  color: string;
  accentColor: string;
  atmosphere: string;
}

const cityWaypoints: CityWaypoint[] = [
  {
    id: 'wp-school',
    name: 'Campus Quad & Clocktower',
    district: 'School Street',
    districtId: 'school-street',
    x: 22,
    y: 38,
    threat: 'Coercive Chat Dares & Account Borrowing',
    guardian: 'Shieldfin & Echo',
    color: '#2563EB',
    accentColor: '#60A5FA',
    atmosphere: 'Red-brick arched corridors, student lockers & buzzing bus terminals',
  },
  {
    id: 'wp-retail',
    name: 'Neon Promenade & Atrium',
    district: 'Retail District',
    districtId: 'retail-district',
    x: 76,
    y: 32,
    threat: 'A friend’s shop-theft dare at the kiosk',
    guardian: 'VeriFox',
    color: '#F59E0B',
    accentColor: '#FDE047',
    atmosphere: 'Covered arcades, busy kiosks and a choice your squad has to make',
  },
  {
    id: 'wp-cyber',
    name: 'Hyper-Grid Server Plaza',
    district: 'Digi-District',
    districtId: 'digi-district',
    x: 68,
    y: 70,
    threat: 'Tournament Link Phishing & OTP Harvests',
    guardian: 'ByteBuddy & Cluepaw',
    color: '#06B6D4',
    accentColor: '#38D9E6',
    atmosphere: 'Holographic data billboards, esports lounges & luminous fiber bridges',
  },
  {
    id: 'wp-hub',
    name: 'Civic Amphitheatre & Gardens',
    district: 'Community Hub',
    districtId: 'community-hub',
    x: 28,
    y: 72,
    threat: 'Bystander Hesitation & Impersonation',
    guardian: 'Beacon & Echo',
    color: '#8B5CF6',
    accentColor: '#C084FC',
    atmosphere: 'Warm terraced pavilion, corkboard notices & open community courtyard',
  },
];

export const HeroIllustration: React.FC = () => {
  // Open on the Retail District: it is the initial pilot focus.
  const [activeWp, setActiveWp] = useState<CityWaypoint | null>(cityWaypoints[1]);

  return (
    <div className="relative w-full aspect-[4/3] sm:aspect-[16/10] lg:aspect-[16/11] rounded-2xl overflow-hidden border border-shield-cardBorder/90 bg-gradient-to-b from-shield-card via-shield-dark to-shield-void shadow-2xl shadow-shield-blue/20 backdrop-blur-md">
      {/* Decorative Game HUD Border Frame */}
      <div className="hud-corner hud-corner-tl" />
      <div className="hud-corner hud-corner-tr" />
      <div className="hud-corner hud-corner-bl" />
      <div className="hud-corner hud-corner-br" />

      {/* Game HUD overlays: squad slots, concept label, ripple timeline */}
      <div className="absolute top-3 left-3 sm:top-4 sm:left-4 z-10 flex items-center gap-2 rounded-full bg-[#0B132B]/80 border border-white/10 px-2.5 py-1.5 backdrop-blur" aria-hidden="true">
        <div className="flex -space-x-1.5">
          {['#06B6D4', '#F59E0B', '#8B5CF6', '#10B981'].map((c) => (
            <span key={c} className="h-5 w-5 rounded-full border-2 border-[#0B132B]" style={{ backgroundColor: c }} />
          ))}
          <span className="h-5 w-5 rounded-full border-2 border-dashed border-white/40 bg-[#0B132B]" />
        </div>
        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-white/90">Squad 4/5</span>
      </div>
      <span className="absolute top-3 right-3 sm:top-4 sm:right-4 z-10 rounded-full bg-[#0B132B]/80 border border-white/10 px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider text-white/70 backdrop-blur">
        Concept preview
      </span>
      <div className="hidden sm:flex absolute top-14 left-4 z-10 items-center gap-1.5 rounded-xl bg-[#0B132B]/80 border border-white/10 px-3 py-2 backdrop-blur" aria-hidden="true">
        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#FDE047]">Choice</span>
        <span className="h-px w-4 bg-white/40" />
        <span className="text-[10px] font-mono uppercase tracking-wider text-white/80">Now</span>
        <span className="h-px w-4 bg-white/40" />
        <span className="text-[10px] font-mono uppercase tracking-wider text-[#38D9E6]">Later</span>
      </div>

      {/* Atmospheric Environment Vector Artwork */}
      <svg
        className="w-full h-full object-cover select-none"
        viewBox="0 0 1000 680"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <defs>
          {/* Gradients */}
          <linearGradient id="nightSky" x1="500" y1="0" x2="500" y2="680" gradientUnits="userSpaceOnUse">
            <stop stopColor="#0B132B" />
            <stop offset="0.4" stopColor="#101C3D" />
            <stop offset="0.75" stopColor="#12234D" />
            <stop offset="1" stopColor="#091124" />
          </linearGradient>

          {/* District Glow Filters */}
          <filter id="cityGlowFilter" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="12" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>

          <filter id="laserBeamFilter" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>

          {/* Neon quest path gradient */}
          <linearGradient id="questFlowGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#2563EB" />
            <stop offset="35%" stopColor="#38D9E6" />
            <stop offset="70%" stopColor="#F59E0B" />
            <stop offset="100%" stopColor="#8B5CF6" />
          </linearGradient>

          {/* Pattern for Digi-District Cyber Grid */}
          <pattern id="cyberGridPattern" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#38D9E6" strokeWidth="0.5" strokeOpacity="0.15" />
          </pattern>
        </defs>

        {/* 1. Deep Sky Backdrop */}
        <rect width="1000" height="680" fill="url(#nightSky)" />

        {/* 2. Atmospheric Moon & Celestial Twilight */}
        <circle cx="840" cy="110" r="70" fill="#38D9E6" fillOpacity="0.05" filter="url(#cityGlowFilter)" />
        <circle cx="840" cy="110" r="32" fill="#F7F5EF" fillOpacity="0.15" />
        <circle cx="830" cy="100" r="28" fill="#101C3D" />

        {/* Stars / Floating data particles */}
        <g opacity="0.6">
          <circle cx="120" cy="70" r="1.5" fill="#38D9E6" />
          <circle cx="210" cy="110" r="1.2" fill="#FDE047" />
          <circle cx="340" cy="50" r="1.8" fill="#F7F5EF" />
          <circle cx="480" cy="90" r="1.5" fill="#60A5FA" />
          <circle cx="620" cy="60" r="1.2" fill="#C084FC" />
          <circle cx="720" cy="130" r="1.5" fill="#38D9E6" />
          <circle cx="920" cy="80" r="2" fill="#FDE047" />
        </g>

        {/* 3. Distant Mountainous Skyline (Silhouette Layer 1) */}
        <path
          d="M0 320 L60 300 L110 325 L180 280 L260 315 L320 270 L390 310 L470 260 L540 305 L630 250 L710 295 L800 240 L880 290 L950 260 L1000 285 L1000 680 L0 680 Z"
          fill="#0A1021"
          opacity="0.8"
        />

        {/* 4. Layer 2: Distinct Neighbourhood Architectures */}

        {/* --- SECTOR A: SCHOOL STREET (Left Architecture) --- */}
        {/* Academic arched buildings, student library & clocktower */}
        <g id="sector-school">
          {/* Main campus hall */}
          <rect x="70" y="270" width="130" height="260" rx="4" fill="#14203B" stroke="#2563EB" strokeWidth="1.5" strokeOpacity="0.5" />
          {/* Campus clock tower */}
          <rect x="180" y="190" width="60" height="340" rx="4" fill="#101B3A" stroke="#2563EB" strokeWidth="2" strokeOpacity="0.7" />
          <polygon points="180,190 210,140 240,190" fill="#1E3A8A" stroke="#60A5FA" strokeWidth="1.5" />
          {/* Clock face */}
          <circle cx="210" cy="220" r="16" fill="#FDE047" fillOpacity="0.9" filter="url(#laserBeamFilter)" />
          <circle cx="210" cy="220" r="14" fill="#1E293B" />
          <circle cx="210" cy="220" r="2.5" fill="#FDE047" />
          <line x1="210" y1="220" x2="210" y2="211" stroke="#FDE047" strokeWidth="2" strokeLinecap="round" />
          <line x1="210" y1="220" x2="218" y2="220" stroke="#FDE047" strokeWidth="2" strokeLinecap="round" />

          {/* School archway & warm lit classroom windows */}
          <g fill="#FDE047" fillOpacity="0.35">
            <rect x="85" y="300" width="18" height="14" rx="2" />
            <rect x="115" y="300" width="18" height="14" rx="2" />
            <rect x="145" y="300" width="18" height="14" rx="2" />
            <rect x="85" y="340" width="18" height="14" rx="2" />
            <rect x="115" y="340" width="18" height="14" rx="2" />
            <rect x="145" y="340" width="18" height="14" rx="2" />
            <rect x="85" y="380" width="78" height="40" rx="20" fillOpacity="0.15" stroke="#2563EB" strokeWidth="1.5" />
          </g>
          {/* Warm street lamps */}
          <line x1="60" y1="460" x2="60" y2="420" stroke="#60A5FA" strokeWidth="2" />
          <circle cx="60" cy="418" r="4" fill="#FDE047" filter="url(#laserBeamFilter)" />
        </g>

        {/* --- SECTOR B: RETAIL DISTRICT (Right High-Rise Shopping Atrium) --- */}
        <g id="sector-retail">
          {/* Grand retail towers */}
          <rect x="730" y="220" width="140" height="340" rx="6" fill="#16223F" stroke="#F59E0B" strokeWidth="2" strokeOpacity="0.6" />
          {/* Slanted glass roof atrium */}
          <polygon points="710,340 850,260 880,340 710,380" fill="#F59E0B" fillOpacity="0.15" stroke="#FBBF24" strokeWidth="1.5" />
          <rect x="850" y="180" width="85" height="380" rx="4" fill="#121D36" stroke="#F59E0B" strokeWidth="1.5" strokeOpacity="0.4" />

          {/* Neon Billboard ribbons & store lights */}
          <rect x="745" y="240" width="110" height="14" rx="2" fill="#F59E0B" fillOpacity="0.8" filter="url(#laserBeamFilter)" />
          <rect x="745" y="240" width="110" height="14" rx="2" fill="#FDE047" />
          <rect x="750" y="270" width="45" height="8" rx="2" fill="#EC4899" fillOpacity="0.7" />
          <rect x="805" y="270" width="45" height="8" rx="2" fill="#38D9E6" fillOpacity="0.7" />

          <g fill="#FBBF24" fillOpacity="0.4">
            <rect x="750" y="390" width="22" height="16" rx="2" />
            <rect x="785" y="390" width="22" height="16" rx="2" />
            <rect x="820" y="390" width="22" height="16" rx="2" />
            <rect x="865" y="230" width="20" height="24" rx="2" />
            <rect x="895" y="230" width="20" height="24" rx="2" />
          </g>
        </g>

        {/* --- SECTOR C: DIGI-DISTRICT (Center-Right High-Tech Spire) --- */}
        <g id="sector-digi">
          {/* Skyscraper with cyber grid */}
          <rect x="580" y="170" width="130" height="420" rx="6" fill="#0D1A33" stroke="#06B6D4" strokeWidth="2" strokeOpacity="0.7" />
          <rect x="585" y="175" width="120" height="240" fill="url(#cyberGridPattern)" />

          {/* Antenna Spire & Optical Laser Beacon */}
          <line x1="645" y1="170" x2="645" y2="80" stroke="#38D9E6" strokeWidth="3" />
          <circle cx="645" cy="78" r="7" fill="#38D9E6" filter="url(#laserBeamFilter)" />
          <circle cx="645" cy="78" r="3" fill="#FFFFFF" />

          {/* Floating holographic rings */}
          <ellipse cx="645" cy="115" rx="35" ry="8" stroke="#06B6D4" strokeWidth="1.5" strokeDasharray="6 4" strokeOpacity="0.7" />
          <ellipse cx="645" cy="140" rx="25" ry="6" stroke="#38D9E6" strokeWidth="1.5" strokeOpacity="0.8" />

          {/* Vertical Data Bus lines */}
          <line x1="610" y1="200" x2="610" y2="400" stroke="#38D9E6" strokeWidth="1.5" strokeOpacity="0.6" strokeDasharray="8 6" />
          <line x1="680" y1="220" x2="680" y2="420" stroke="#06B6D4" strokeWidth="1.5" strokeOpacity="0.6" strokeDasharray="12 4" />
        </g>

        {/* --- SECTOR D: COMMUNITY HUB (Center-Left Amphitheatre & Pavilion) --- */}
        <g id="sector-hub">
          {/* Civic amphitheatre curved tiers */}
          <ellipse cx="360" cy="470" rx="130" ry="50" fill="#17223D" stroke="#8B5CF6" strokeWidth="2" strokeOpacity="0.6" />
          <ellipse cx="360" cy="460" rx="95" ry="34" fill="#131B33" stroke="#A78BFA" strokeWidth="1.5" strokeOpacity="0.7" />
          <ellipse cx="360" cy="450" rx="60" ry="20" fill="#0F172E" stroke="#C084FC" strokeWidth="1.5" />

          {/* Central Civic Pavilion arch */}
          <path d="M300 440 Q360 380 420 440" stroke="#A78BFA" strokeWidth="2.5" fill="none" />
          <line x1="300" y1="440" x2="300" y2="480" stroke="#8B5CF6" strokeWidth="2" />
          <line x1="420" y1="440" x2="420" y2="480" stroke="#8B5CF6" strokeWidth="2" />

          {/* Warm festoon lights strung across the plaza */}
          <path d="M260 410 Q310 435 360 415 Q410 440 460 415" stroke="#FDE047" strokeWidth="1" strokeDasharray="2 6" strokeOpacity="0.8" />
          <circle cx="285" cy="422" r="2.5" fill="#FDE047" filter="url(#laserBeamFilter)" />
          <circle cx="335" cy="420" r="2.5" fill="#FDE047" filter="url(#laserBeamFilter)" />
          <circle cx="385" cy="425" r="2.5" fill="#FDE047" filter="url(#laserBeamFilter)" />
          <circle cx="435" cy="422" r="2.5" fill="#FDE047" filter="url(#laserBeamFilter)" />
        </g>

        {/* 5. Isometric City Board Ground Plane with Neon Transit Grid */}
        <polygon points="0,520 1000,520 1000,680 0,680" fill="url(#nightSky)" opacity="0.95" />
        <line x1="0" y1="520" x2="1000" y2="520" stroke="#233863" strokeWidth="2" />

        {/* 6. The Glowing Quest Route Connecting the Districts */}
        <path
          d="M 220 380 Q 260 520 290 480 T 460 490 T 670 470 T 760 330"
          stroke="url(#questFlowGrad)"
          strokeWidth="4"
          fill="none"
          strokeLinecap="round"
          filter="url(#laserBeamFilter)"
          className="quest-trail-animated"
        />
        <path
          d="M 220 380 Q 260 520 290 480 T 460 490 T 670 470 T 760 330"
          stroke="#FFFFFF"
          strokeWidth="1.5"
          fill="none"
          strokeDasharray="4 8"
          strokeOpacity="0.8"
        />

        {/* Secondary connecting path into Digi-District */}
        <path
          d="M 290 480 Q 480 610 670 470"
          stroke="#38D9E6"
          strokeWidth="2.5"
          fill="none"
          strokeDasharray="6 6"
          strokeOpacity="0.5"
        />
      </svg>

      {/* Interactive Waypoint Discovery Markers (Overlaid HTML Nodes) */}
      <div className="absolute inset-0 pointer-events-none">
        {cityWaypoints.map((wp) => {
          const isSelected = activeWp?.id === wp.id;
          return (
            <div
              key={wp.id}
              className="absolute pointer-events-auto transform -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${wp.x}%`, top: `${wp.y}%` }}
            >
              <button
                type="button"
                onClick={() => setActiveWp(isSelected ? null : wp)}
                onMouseEnter={() => setActiveWp(wp)}
                className="relative group p-2 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-shield-cyan cursor-pointer transition-transform duration-300 hover:scale-125"
                aria-label={`Waypoint: ${wp.name} in ${wp.district}`}
              >
                {/* Radar pulse ping */}
                <span
                  className="absolute inset-0 rounded-full animate-ping opacity-40"
                  style={{ backgroundColor: wp.color }}
                />
                {/* Tactical waypoint circle */}
                <span
                  className={`relative flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all duration-300 shadow-lg text-white ${
                    isSelected ? 'ring-4 ring-white/50 scale-110' : ''
                  }`}
                  style={{
                    backgroundColor: wp.color,
                    borderColor: wp.accentColor,
                  }}
                >
                  <MapPin className="w-4 h-4" />
                </span>
              </button>
            </div>
          );
        })}
      </div>

      {/* Interactive Waypoint Radar Card (Bottom Overlay) */}
      {activeWp && (
        <div
          className="absolute bottom-3 left-3 right-3 sm:left-auto sm:right-4 sm:bottom-4 sm:max-w-xs p-4 rounded-xl bg-shield-void/95 border border-shield-cyan/50 shadow-2xl backdrop-blur-xl z-20 animate-fadeIn"
          role="status"
        >
          <div className="flex items-center justify-between gap-2 mb-2">
            <span
              className="text-[11px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded border"
              style={{
                color: activeWp.accentColor,
                backgroundColor: `${activeWp.color}20`,
                borderColor: `${activeWp.color}50`,
              }}
            >
              {activeWp.district}
            </span>
            <span className="text-[10px] text-shield-gold bg-shield-navy px-1.5 py-0.5 rounded border border-shield-cardBorder">
              {activeWp.districtId === 'retail-district' ? 'Pilot mission' : 'Future district'}
            </span>
          </div>

          <h4 className="text-sm font-heading font-bold text-shield-cream mb-1">{activeWp.name}</h4>
          {activeWp.districtId === 'retail-district' && (
            <p className="text-[11px] font-semibold text-shield-gold mb-1">Mission: {activeWp.threat}</p>
          )}

          <p className="text-[11px] text-shield-cream/90 leading-relaxed mb-2.5">
            {activeWp.atmosphere}
          </p>

          <div className="pt-2 border-t border-shield-cardBorder/60 flex items-center justify-between text-[11px]">
            <Link
              to={`/world`}
              className="inline-flex items-center gap-1 font-semibold text-shield-cyan hover:text-shield-cream transition-colors"
            >
              <span>Explore District</span>
              <ArrowRight className="w-3 h-3" />
            </Link>

            <button
              onClick={() => setActiveWp(null)}
              className="text-shield-muted hover:text-shield-cream text-[10px] p-0.5"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
