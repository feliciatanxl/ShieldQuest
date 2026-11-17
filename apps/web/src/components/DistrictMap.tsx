import { DistrictScene, IdleSprite, SPRITES } from './sg/Scenery';
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
  'school-street': <GraduationCap className="w-6 h-6 text-blue-400" />,
  'retail-district': <ShoppingBag className="w-6 h-6 text-amber-400" />,
  'digi-district': <Cpu className="w-6 h-6 text-cyan-400" />,
  'community-hub': <Users className="w-6 h-6 text-purple-400" />,
};

const districtThemes: Record<
  string,
  {
    gradient: string;
    border: string;
    glow: string;
    badge: string;
    accent: string;
    tag: string;
  }
> = {
  'school-street': {
    gradient: 'from-blue-950/40 via-shield-navy to-shield-void',
    border: 'border-blue-500/40',
    glow: 'shadow-glow-blue',
    badge: 'bg-blue-500/15 text-blue-300 border-blue-500/40',
    accent: '#3B82F6',
    tag: 'Academic Perimeter // Sector 01',
  },
  'retail-district': {
    gradient: 'from-amber-950/40 via-shield-navy to-shield-void',
    border: 'border-amber-500/40',
    glow: 'shadow-glow-gold',
    badge: 'bg-amber-500/15 text-amber-300 border-amber-500/40',
    accent: '#F59E0B',
    tag: 'Commercial Galleria // Sector 02',
  },
  'digi-district': {
    gradient: 'from-cyan-950/40 via-shield-navy to-shield-void',
    border: 'border-cyan-500/40',
    glow: 'shadow-glow-cyan',
    badge: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/40',
    accent: '#06B6D4',
    tag: 'Cyber Grid Exchange // Sector 03',
  },
  'community-hub': {
    gradient: 'from-purple-950/40 via-shield-navy to-shield-void',
    border: 'border-purple-500/40',
    glow: 'shadow-glow-violet',
    badge: 'bg-purple-500/15 text-purple-300 border-purple-500/40',
    accent: '#8B5CF6',
    tag: 'Civic Amphitheatre // Sector 04',
  },
};

/** The initial educational pilot runs in this district; the others are long-term previews. */
const PILOT_DISTRICT_ID = 'retail-district';

export const DistrictMap: React.FC = () => {
  const [selectedDistrict, setSelectedDistrict] = useState<District | null>(
    DISTRICTS.find((d) => d.id === PILOT_DISTRICT_ID) ?? DISTRICTS[0]
  );
  const [viewMode, setViewMode] = useState<'interactive' | 'list'>('interactive');

  return (
    <div className="w-full space-y-8" aria-label="City Board Districts Explorer">
      {/* Control bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-shield-cardBorder/70">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-shield-navy border border-shield-cardBorder text-shield-cyan">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-shield-cream block">
              Four Districts
            </span>
            <span className="text-[11px] text-shield-muted">
              Select a district to preview it
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* View toggle (Graphical vs List) */}
          <div className="flex items-center rounded-xl bg-shield-void p-1 border border-shield-cardBorder shadow-sm">
            <button
              type="button"
              onClick={() => setViewMode('interactive')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                viewMode === 'interactive'
                  ? 'bg-shield-slate text-shield-cyan shadow-sm border border-shield-cardBorder'
                  : 'text-shield-muted hover:text-shield-cream'
              }`}
              aria-label="Interactive Map View"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Map View</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                viewMode === 'list'
                  ? 'bg-shield-slate text-shield-cyan shadow-sm border border-shield-cardBorder'
                  : 'text-shield-muted hover:text-shield-cream'
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
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-shield-navy hover:bg-shield-slate border border-shield-cardBorder text-xs text-shield-muted hover:text-shield-cream transition-colors"
              aria-label="Clear selection"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Main District Grid / Map */}
      {viewMode === 'interactive' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Sector Selection Grid (7 cols) */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 lg:auto-rows-fr gap-5">
            {DISTRICTS.map((district, idx) => {
              const isSelected = selectedDistrict?.id === district.id;
              const styling = districtThemes[district.id] || districtThemes['school-street'];

              return (
                <button
                  key={district.id}
                  type="button"
                  onClick={() => setSelectedDistrict(district)}
                  className={`relative flex h-full flex-col text-left p-6 rounded-2xl border-2 bg-shield-card transition-all duration-300 overflow-hidden group motion-safe:hover:-translate-y-1 ${
                    isSelected ? '-translate-y-1' : 'border-shield-cardBorder hover:border-shield-gold/60'
                  }`}
                  style={isSelected ? { borderColor: styling.accent, boxShadow: `0 6px 0 0 ${styling.accent}88` } : { boxShadow: '0 3px 0 0 rgb(var(--shield-cardBorder))' }}
                  aria-pressed={isSelected}
                  aria-label={`Select district: ${district.name}`}
                >
                  {/* Neighbourhood thumbnail: future districts are drawn desaturated so only the pilot reads as "open" */}
                  <div className="relative -mx-6 -mt-6 mb-5 h-28 border-b-4 overflow-hidden" style={{ borderColor: styling.accent }}>
                    <DistrictScene
                      id={district.id}
                      className={`h-full w-full transition-transform duration-500 motion-safe:group-hover:scale-105 ${district.id === PILOT_DISTRICT_ID ? '' : 'grayscale-[55%] opacity-80'}`}
                    />
                    {district.id === PILOT_DISTRICT_ID && (
                      <>
                        <IdleSprite folder={SPRITES.cafe} frame={0} className="absolute bottom-0 left-[30%] w-12" />
                        <IdleSprite folder={SPRITES.poly} frame={2} className="absolute bottom-0 left-[58%] w-12" />
                      </>
                    )}
                  </div>
                  {/* Sector Header */}
                  <div className="flex items-start justify-between gap-2 mb-4">
                    <div
                      className="p-3 rounded-xl bg-shield-surface border-2 shadow-[0_3px_0_0_rgb(var(--shield-cardBorder))] motion-safe:group-hover:-translate-y-0.5 transition-transform duration-300"
                      style={{ borderColor: `${styling.accent}50` }}
                    >
                      {districtIcons[district.id]}
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-shield-muted px-2 py-0.5 rounded bg-shield-void border border-shield-cardBorder">
                        Sector 0{idx + 1}
                      </span>
                      {district.id === PILOT_DISTRICT_ID ? (
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#E8B75D] text-[#17233D]">
                          Pilot focus
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono uppercase tracking-wider text-shield-muted">Future preview</span>
                      )}
                    </div>
                  </div>

                  <h3 className="text-xl font-heading font-black text-shield-cream mb-1 group-hover:text-shield-cyan transition-colors">
                    {district.name}
                  </h3>

                  <p className="text-xs text-shield-gold font-medium mb-3">
                    {district.theme}
                  </p>

                  <p className="text-xs text-shield-muted mb-4 leading-relaxed">
                    {district.description}
                  </p>

                  <div className="mt-auto flex flex-wrap gap-1.5 pt-3 border-t border-shield-cardBorder/50">
                    {district.skillsExplored.slice(0, 2).map((skill) => (
                      <span
                        key={skill}
                        className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${styling.badge}`}
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
                className="notice-board p-3 sm:p-4 lg:h-full animate-fadeIn"><div className="notice-paper p-5 sm:p-6 lg:h-full lg:flex lg:flex-col lg:justify-between"
                role="region"
                aria-label={`Details for ${selectedDistrict.name}`}
              >
                <div className="flex items-center justify-between pb-4 border-b border-shield-cardBorder/60 mb-6">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-shield-cyan" />
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-shield-cyan">
                      District Dossier
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-shield-gold bg-shield-void px-2.5 py-0.5 rounded border border-shield-cardBorder">
                    {selectedDistrict.id === PILOT_DISTRICT_ID ? 'Pilot focus' : 'Future preview'}
                  </span>
                </div>

                <DistrictScene id={selectedDistrict.id} className={`mb-5 block h-24 w-full rounded-xl border-2 border-shield-cardBorder ${selectedDistrict.id === PILOT_DISTRICT_ID ? "" : "grayscale-[55%]"}`} />
                <div className="flex items-center gap-3.5 mb-5">
                  <div className="p-3.5 rounded-2xl bg-shield-void border border-shield-cardBorder shadow-md">
                    {districtIcons[selectedDistrict.id]}
                  </div>
                  <div>
                    <h4 className="text-2xl font-heading font-black text-shield-cream">
                      {selectedDistrict.name}
                    </h4>
                    <span className="text-xs font-semibold text-shield-gold">
                      {selectedDistrict.theme}
                    </span>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-shield-cream/90 leading-relaxed mb-6">
                  {selectedDistrict.description}
                </p>

                {/* Visual Concept */}
                <div className="mb-5 p-4 rounded-xl bg-shield-void/70 border border-shield-cardBorder/80">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-shield-cyan block mb-1">
                    Visual Atmosphere & Setting
                  </span>
                  <p className="text-xs text-shield-cream/80 leading-relaxed">
                    {selectedDistrict.visualConcept}
                  </p>
                </div>

                {/* Key Skills */}
                <div className="mb-5 space-y-2">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-shield-muted block">
                    Skills Explored
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {selectedDistrict.skillsExplored.map((skill) => (
                      <span
                        key={skill}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-shield-slate text-xs font-medium text-shield-cyan border border-shield-cardBorder"
                      >
                        <Shield className="w-3 h-3 text-shield-cyan" />
                        <span>{skill}</span>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Sample Dilemma Teaser */}
                <div className="dialogue-panel p-4 space-y-1.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-shield-gold">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Sample Dilemma</span>
                  </div>
                  <p className="text-xs text-shield-cream/90 leading-relaxed italic">
                    "{selectedDistrict.sampleScenarioPreview}"
                  </p>
                </div>
              </div></div>
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
              className="game-panel p-6 sm:p-7 border border-shield-cardBorder hover:border-shield-cyan/50 transition-colors"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-shield-void border border-shield-cardBorder">
                    {districtIcons[district.id]}
                  </div>
                  <div>
                    <h3 className="text-xl font-heading font-black text-shield-cream">
                      {district.name}
                      {district.id === PILOT_DISTRICT_ID && (
                        <span className="ml-2 align-middle text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#E8B75D] text-[#17233D]">
                          Pilot focus
                        </span>
                      )}
                    </h3>
                    <p className="text-xs text-shield-gold font-medium">Theme: {district.theme}</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {district.skillsExplored.map((skill) => (
                    <span
                      key={skill}
                      className="text-xs px-2.5 py-1 rounded-md bg-shield-void text-shield-cyan border border-shield-cardBorder font-mono"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <p className="text-sm text-shield-cream/90 leading-relaxed mb-4">
                {district.description}
              </p>

              <div className="p-3.5 rounded-xl bg-shield-void/70 border border-shield-cardBorder/60 text-xs text-shield-muted flex items-start gap-2">
                <span className="font-semibold text-shield-gold flex-shrink-0">Sample Dilemma:</span>
                <span className="italic text-shield-cream/80">{district.sampleScenarioPreview}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
