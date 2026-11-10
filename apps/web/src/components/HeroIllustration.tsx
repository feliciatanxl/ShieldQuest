import React, { useState } from 'react';
import { Sparkles, Navigation, MapPin } from 'lucide-react';

interface Waypoint {
  id: string;
  name: string;
  district: string;
  x: number;
  y: number;
  threat: string;
  guardian: string;
  color: string;
}

const waypoints: Waypoint[] = [
  {
    id: 'wp-school',
    name: 'North Campus Alley',
    district: 'School Street',
    x: 24,
    y: 38,
    threat: 'Group Chat Coercion',
    guardian: 'Shieldfin',
    color: '#1687F7',
  },
  {
    id: 'wp-retail',
    name: 'Atrium Courier Lockers',
    district: 'Retail District',
    x: 74,
    y: 32,
    threat: 'Fast-Cash Package Drop',
    guardian: 'VeriFox',
    color: '#F2B94B',
  },
  {
    id: 'wp-cyber',
    name: 'Neon Cyber Exchange',
    district: 'Digi-District',
    x: 68,
    y: 68,
    threat: 'MFA Code Hijack Link',
    guardian: 'ByteBuddy',
    color: '#38D9E6',
  },
  {
    id: 'wp-hub',
    name: 'Civic Amphitheatre',
    district: 'Community Hub',
    x: 32,
    y: 72,
    threat: 'Bystander Hesitation',
    guardian: 'Echo & Beacon',
    color: '#7755DF',
  },
];

export const HeroIllustration: React.FC = () => {
  const [activeWp, setActiveWp] = useState<Waypoint | null>(null);

  return (
    <div className="relative w-full aspect-[16/10] sm:aspect-[16/9] max-w-4xl mx-auto rounded-2xl overflow-hidden border border-shield-cardBorder/80 bg-shield-navy/70 shadow-2xl shadow-shield-blue/10 backdrop-blur-sm">
      {/* City Backdrop SVG */}
      <svg
        className="w-full h-full object-cover select-none"
        viewBox="0 0 1000 600"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <defs>
          {/* Gradients */}
          <linearGradient id="skyGrad" x1="500" y1="0" x2="500" y2="600" gradientUnits="userSpaceOnUse">
            <stop stopColor="#0B132B" />
            <stop offset="0.5" stopColor="#101B3A" />
            <stop offset="1" stopColor="#182A4D" />
          </linearGradient>

          <linearGradient id="gridGrad" x1="500" y1="300" x2="500" y2="600" gradientUnits="userSpaceOnUse">
            <stop stopColor="#1687F7" stopOpacity="0.18" />
            <stop offset="1" stopColor="#38D9E6" stopOpacity="0.02" />
          </linearGradient>

          <linearGradient id="glowPulse" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#1687F7" />
            <stop offset="50%" stopColor="#38D9E6" />
            <stop offset="100%" stopColor="#7755DF" />
          </linearGradient>

          <filter id="cityGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="10" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>

          <filter id="trailGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Sky Background */}
        <rect width="1000" height="600" fill="url(#skyGrad)" />

        {/* Ambient Moon / Energy Node */}
        <circle cx="820" cy="110" r="70" fill="#38D9E6" fillOpacity="0.04" filter="url(#cityGlow)" />
        <circle cx="820" cy="110" r="30" fill="#F7F5EF" fillOpacity="0.12" />

        {/* Distant Atmospheric Grid / Stars */}
        <g opacity="0.4">
          <circle cx="150" cy="80" r="1.5" fill="#38D9E6" />
          <circle cx="280" cy="130" r="1" fill="#F7F5EF" />
          <circle cx="410" cy="70" r="1.5" fill="#F2B94B" />
          <circle cx="630" cy="95" r="1" fill="#38D9E6" />
          <circle cx="750" cy="150" r="1.5" fill="#F7F5EF" />
          <circle cx="910" cy="60" r="1" fill="#7755DF" />
        </g>

        {/* Distant Skyline Silhouette (Layer 1) */}
        <g fill="#0D162B" opacity="0.75">
          <rect x="50" y="240" width="70" height="360" rx="4" />
          <rect x="140" y="210" width="85" height="390" rx="4" />
          <rect x="240" y="270" width="60" height="330" rx="4" />
          <rect x="320" y="190" width="110" height="410" rx="4" />
          <rect x="450" y="250" width="95" height="350" rx="4" />
          <rect x="560" y="170" width="120" height="430" rx="4" />
          <rect x="700" y="230" width="85" height="370" rx="4" />
          <rect x="800" y="200" width="100" height="400" rx="4" />
          <rect x="915" y="260" width="75" height="340" rx="4" />
        </g>

        {/* Mid-ground Architectural Towers with illuminated windows */}
        <g fill="#14203B" stroke="#233863" strokeWidth="1.5">
          {/* Tower Left: School Street Campus */}
          <rect x="90" y="260" width="130" height="340" rx="6" />
          {/* Tower Center-Left: Civic Hub */}
          <rect x="270" y="220" width="140" height="380" rx="6" />
          {/* Spire */}
          <line x1="340" y1="220" x2="340" y2="150" stroke="#38D9E6" strokeWidth="2" strokeDasharray="3 3" />
          <circle cx="340" cy="148" r="4" fill="#38D9E6" filter="url(#trailGlow)" />

          {/* Tower Center-Right: Digi-District Server Towers */}
          <rect x="620" y="200" width="150" height="400" rx="6" />
          <line x1="695" y1="200" x2="695" y2="120" stroke="#1687F7" strokeWidth="2" />
          <circle cx="695" cy="118" r="5" fill="#1687F7" filter="url(#trailGlow)" />

          {/* Tower Right: Retail District Gallery */}
          <rect x="810" y="250" width="130" height="350" rx="6" />
        </g>

        {/* Architectural Window Light Patterns */}
        <g fill="#38D9E6" opacity="0.35">
          {/* Digi-District glowing data arrays */}
          <rect x="645" y="240" width="20" height="8" rx="2" />
          <rect x="680" y="240" width="20" height="8" rx="2" />
          <rect x="715" y="240" width="20" height="8" rx="2" />
          <rect x="645" y="270" width="40" height="8" rx="2" fill="#1687F7" />
          <rect x="700" y="270" width="35" height="8" rx="2" />
          <rect x="645" y="300" width="25" height="8" rx="2" />
          <rect x="685" y="300" width="45" height="8" rx="2" />
          <rect x="650" y="340" width="80" height="4" rx="2" fill="#7755DF" />
        </g>

        <g fill="#F2B94B" opacity="0.3">
          {/* Retail & School warm windows */}
          <rect x="115" y="300" width="16" height="12" rx="2" />
          <rect x="145" y="300" width="16" height="12" rx="2" />
          <rect x="175" y="300" width="16" height="12" rx="2" />
          <rect x="115" y="340" width="30" height="12" rx="2" />
          <rect x="160" y="340" width="30" height="12" rx="2" />

          <rect x="835" y="290" width="25" height="10" rx="2" />
          <rect x="875" y="290" width="35" height="10" rx="2" />
          <rect x="835" y="320" width="40" height="10" rx="2" />
          <rect x="890" y="320" width="20" height="10" rx="2" />
        </g>

        {/* Perspective City Board Ground Plane with Neon Transit Paths */}
        <polygon points="0,480 1000,480 1000,600 0,600" fill="url(#gridGrad)" />
        <line x1="0" y1="480" x2="1000" y2="480" stroke="#233863" strokeWidth="2" />

        {/* The Glowing Quest Route Connecting the Districts */}
        <path
          d="M 240 380 Q 280 460 320 430 T 480 450 T 680 410 T 740 320"
          stroke="url(#glowPulse)"
          strokeWidth="3.5"
          fill="none"
          strokeDasharray="8 6"
          filter="url(#trailGlow)"
        />

        {/* Secondary Quest Branch */}
        <path
          d="M 320 430 Q 420 520 680 410"
          stroke="#38D9E6"
          strokeWidth="2"
          strokeOpacity="0.4"
          fill="none"
          strokeDasharray="4 4"
        />

        {/* Dynamic Light Beam at City Board Core */}
        <line x1="500" y1="180" x2="500" y2="470" stroke="#38D9E6" strokeWidth="1" strokeOpacity="0.25" />
        <ellipse cx="500" cy="470" rx="90" ry="24" fill="#1687F7" fillOpacity="0.1" filter="url(#cityGlow)" />
      </svg>

      {/* Interactive Waypoint Nodes (Overlay) */}
      <div className="absolute inset-0 pointer-events-none">
        {waypoints.map((wp) => {
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
                className="relative group p-2 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-shield-cyan cursor-pointer transition-transform duration-200 hover:scale-110"
                aria-label={`Waypoint: ${wp.name} in ${wp.district}`}
              >
                {/* Ripple ring */}
                <span
                  className="absolute inset-0 rounded-full animate-ping opacity-30"
                  style={{ backgroundColor: wp.color }}
                />
                {/* Core node badge */}
                <span
                  className="relative flex items-center justify-center w-8 h-8 rounded-full border-2 border-white/80 shadow-lg text-white"
                  style={{ backgroundColor: wp.color }}
                >
                  <MapPin className="w-4 h-4" />
                </span>
              </button>
            </div>
          );
        })}
      </div>

      {/* Active Waypoint Tooltip Card */}
      {activeWp && (
        <div
          className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 sm:max-w-sm p-4 rounded-xl bg-shield-dark/95 border border-shield-cyan/50 shadow-2xl backdrop-blur-md z-20 animate-fadeIn"
          role="status"
        >
          <div className="flex items-center justify-between gap-3 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-shield-cyan">
              {activeWp.district}
            </span>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-shield-navy text-shield-gold border border-shield-cardBorder">
              Hotspot Active
            </span>
          </div>
          <h4 className="text-base font-heading font-bold text-white mb-1">{activeWp.name}</h4>
          <p className="text-xs text-shield-muted mb-3">
            Scenario Dilemma: <span className="text-shield-cream font-medium">{activeWp.threat}</span>
          </p>
          <div className="flex items-center justify-between pt-2 border-t border-shield-cardBorder/50 text-[11px]">
            <span className="text-shield-muted">
              Shield Guardian: <strong className="text-white">{activeWp.guardian}</strong>
            </span>
            <button
              onClick={() => setActiveWp(null)}
              className="text-shield-cyan hover:underline text-[11px] p-0.5"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Ambient Visual Caption Overlay */}
      <div className="absolute top-4 left-4 pointer-events-none flex items-center gap-2 px-3 py-1.5 rounded-lg bg-shield-dark/80 border border-shield-cardBorder/60 backdrop-blur-md text-xs text-shield-cream/90">
        <Navigation className="w-3.5 h-3.5 text-shield-cyan" />
        <span className="font-medium tracking-wide">City Board Simulation — Interactive Waypoints</span>
      </div>

      <div className="absolute top-4 right-4 pointer-events-none hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-shield-dark/80 border border-shield-cardBorder/60 backdrop-blur-md text-xs text-shield-gold">
        <Sparkles className="w-3.5 h-3.5" />
        <span>Fictional Urban Sandbox</span>
      </div>
    </div>
  );
};
