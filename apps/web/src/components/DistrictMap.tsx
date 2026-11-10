import React, { useState } from 'react';
import {
  GraduationCap,
  ShoppingBag,
  Cpu,
  Users,
  Compass,
  Shield,
  RotateCcw,
  Sparkles,
  MapPin,
  List,
  Layers,
} from 'lucide-react';
import { DISTRICTS, District } from '@shieldquest/shared';

const districtIcons: Record<string, React.ReactNode> = {
  'school-street': <GraduationCap className="w-5 h-5 text-shield-blue" />,
  'retail-district': <ShoppingBag className="w-5 h-5 text-shield-gold" />,
  'digi-district': <Cpu className="w-5 h-5 text-shield-cyan" />,
  'community-hub': <Users className="w-5 h-5 text-shield-violet" />,
};

const districtColors: Record<string, { bg: string; border: string; glow: string; badge: string }> = {
  'school-street': {
    bg: 'from-blue-900/30 to-indigo-950/40',
    border: 'border-shield-blue/40',
    glow: 'shadow-glow-blue',
    badge: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  },
  'retail-district': {
    bg: 'from-amber-900/30 to-orange-950/40',
    border: 'border-shield-gold/40',
    glow: 'shadow-glow-gold',
    badge: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  },
  'digi-district': {
    bg: 'from-cyan-900/30 to-teal-950/40',
    border: 'border-shield-cyan/40',
    glow: 'shadow-glow-cyan',
    badge: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
  },
  'community-hub': {
    bg: 'from-purple-900/30 to-violet-950/40',
    border: 'border-shield-violet/40',
    glow: 'shadow-glow-violet',
    badge: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
  },
};

export const DistrictMap: React.FC = () => {
  const [selectedDistrict, setSelectedDistrict] = useState<District | null>(DISTRICTS[0]);
  const [viewMode, setViewMode] = useState<'interactive' | 'list'>('interactive');

  return (
    <div className="w-full space-y-8" aria-label="City Board Districts Explorer">
      {/* Control bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-shield-cardBorder/60">
        <div className="flex items-center gap-2">
          <Compass className="w-5 h-5 text-shield-cyan" />
          <span className="text-sm font-semibold uppercase tracking-wider text-white">
            City Board Districts (4 Core Zones)
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* View toggle (Graphical vs List) */}
          <div className="flex items-center rounded-lg bg-shield-navy p-1 border border-shield-cardBorder">
            <button
              type="button"
              onClick={() => setViewMode('interactive')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-medium transition-colors ${
                viewMode === 'interactive'
                  ? 'bg-shield-slate text-shield-cyan shadow-sm'
                  : 'text-shield-muted hover:text-white'
              }`}
              aria-label="Interactive Map View"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Map View</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-medium transition-colors ${
                viewMode === 'list'
                  ? 'bg-shield-slate text-shield-cyan shadow-sm'
                  : 'text-shield-muted hover:text-white'
              }`}
              aria-label="Accessible List View"
            >
              <List className="w-3.5 h-3.5" />
              <span>List View</span>
            </button>
          </div>

          {selectedDistrict && (
            <button
              type="button"
              onClick={() => setSelectedDistrict(null)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-shield-navy hover:bg-shield-slate border border-shield-cardBorder text-xs text-shield-muted hover:text-white transition-colors"
              aria-label="Clear selection"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Main District Grid / Map */}
      {viewMode === 'interactive' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Interactive Map Board Cards (7 cols) */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {DISTRICTS.map((district) => {
              const isSelected = selectedDistrict?.id === district.id;
              const styling = districtColors[district.id] || districtColors['school-street'];

              return (
                <button
                  key={district.id}
                  type="button"
                  onClick={() => setSelectedDistrict(district)}
                  className={`relative text-left p-6 rounded-2xl border transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-shield-cyan overflow-hidden group ${
                    isSelected
                      ? `bg-gradient-to-br ${styling.bg} ${styling.border} ${styling.glow} ring-1 ring-shield-cyan/50`
                      : 'bg-shield-navy/60 border-shield-cardBorder hover:border-shield-cardBorder/90 hover:bg-shield-navy/90'
                  }`}
                  aria-pressed={isSelected}
                  aria-label={`Select district: ${district.name}`}
                >
                  {/* Subtle corner badge */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-2.5 rounded-xl bg-shield-dark/80 border border-shield-cardBorder/80 group-hover:scale-105 transition-transform">
                      {districtIcons[district.id]}
                    </div>
                    <span className="text-[11px] font-mono uppercase tracking-wider text-shield-muted px-2 py-0.5 rounded bg-shield-dark/60 border border-shield-cardBorder/40">
                      Sector 0{DISTRICTS.indexOf(district) + 1}
                    </span>
                  </div>

                  <h3 className="text-xl font-heading font-bold text-white mb-2 group-hover:text-shield-cyan transition-colors">
                    {district.name}
                  </h3>

                  <p className="text-xs text-shield-muted line-clamp-2 mb-4 leading-relaxed">
                    {district.description}
                  </p>

                  <div className="flex flex-wrap gap-1.5 pt-3 border-t border-shield-cardBorder/50">
                    {district.skillsExplored.slice(0, 2).map((skill) => (
                      <span
                        key={skill}
                        className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${styling.badge}`}
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </button>
              );
            })}
          </div>

          {/* District Detail Dossier (5 cols) */}
          <div className="lg:col-span-5">
            {selectedDistrict ? (
              <div
                className="game-panel p-6 sm:p-8 border border-shield-cyan/30 sticky top-28 animate-fadeIn"
                role="region"
                aria-label={`Details for ${selectedDistrict.name}`}
              >
                <div className="flex items-center justify-between pb-4 border-b border-shield-cardBorder/60 mb-6">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-shield-cyan" />
                    <span className="text-xs font-mono uppercase tracking-wider text-shield-cyan">
                      District Intelligence Dossier
                    </span>
                  </div>
                  <span className="text-xs text-shield-gold bg-shield-navy px-2 py-0.5 rounded border border-shield-cardBorder">
                    Active Hotspot
                  </span>
                </div>

                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 rounded-xl bg-shield-navy border border-shield-cardBorder">
                    {districtIcons[selectedDistrict.id]}
                  </div>
                  <div>
                    <h4 className="text-2xl font-heading font-extrabold text-white">
                      {selectedDistrict.name}
                    </h4>
                    <span className="text-xs text-shield-muted font-medium">
                      Theme: {selectedDistrict.theme}
                    </span>
                  </div>
                </div>

                <p className="text-sm text-shield-cream/90 leading-relaxed mb-6">
                  {selectedDistrict.description}
                </p>

                {/* Visual Concept */}
                <div className="mb-6 p-4 rounded-xl bg-shield-navy/60 border border-shield-cardBorder/70">
                  <span className="text-xs font-semibold uppercase tracking-wider text-shield-muted block mb-1">
                    Visual Atmosphere & Setting
                  </span>
                  <p className="text-xs text-shield-cream/80 leading-relaxed">
                    {selectedDistrict.visualConcept}
                  </p>
                </div>

                {/* Key Skills */}
                <div className="mb-6 space-y-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-shield-muted block">
                    Core Competencies Tested
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {selectedDistrict.skillsExplored.map((skill) => (
                      <span
                        key={skill}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-shield-slate text-xs font-medium text-shield-cyan border border-shield-cardBorder"
                      >
                        <Shield className="w-3 h-3" />
                        <span>{skill}</span>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Sample Dilemma Teaser */}
                <div className="p-4 rounded-xl bg-shield-slate/80 border border-shield-blue/30 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-semibold text-shield-gold">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Scenario Premise (Public Teaser)</span>
                  </div>
                  <p className="text-xs text-shield-cream leading-relaxed italic">
                    "{selectedDistrict.sampleScenarioPreview}"
                  </p>
                </div>
              </div>
            ) : (
              <div className="game-panel p-8 text-center text-shield-muted">
                <Compass className="w-8 h-8 text-shield-cyan/50 mx-auto mb-3" />
                <p className="text-sm font-medium">Select a district from the board to examine its focus and learning themes.</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Accessible List View */
        <div className="space-y-4">
          {DISTRICTS.map((district) => (
            <div
              key={district.id}
              className="game-panel p-6 border border-shield-cardBorder hover:border-shield-cyan/40 transition-colors"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-shield-navy border border-shield-cardBorder">
                    {districtIcons[district.id]}
                  </div>
                  <div>
                    <h3 className="text-xl font-heading font-bold text-white">{district.name}</h3>
                    <p className="text-xs text-shield-muted">Theme: {district.theme}</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {district.skillsExplored.map((skill) => (
                    <span
                      key={skill}
                      className="text-xs px-2.5 py-1 rounded-md bg-shield-navy text-shield-cyan border border-shield-cardBorder"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <p className="text-sm text-shield-cream/90 leading-relaxed mb-4">
                {district.description}
              </p>

              <div className="p-3 rounded-lg bg-shield-navy/60 border border-shield-cardBorder/60 text-xs text-shield-muted flex items-start gap-2">
                <span className="font-semibold text-shield-gold flex-shrink-0">Sample Dilemma:</span>
                <span className="italic">{district.sampleScenarioPreview}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
