import React from 'react';
import { Compass, Sparkles, MapPin, ArrowRight } from 'lucide-react';
import { DistrictMap } from '../components/DistrictMap';
import { Link } from 'react-router-dom';

export const WorldPage: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-16">
      {/* Header */}
      <div className="max-w-3xl space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-shield-navy/90 border border-shield-cardBorder text-xs font-mono font-semibold text-shield-cyan shadow-sm">
          <Compass className="w-3.5 h-3.5 text-shield-cyan" />
          <span>CITY BOARD // URBAN SANDBOX</span>
        </div>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-heading font-black text-white tracking-tight leading-tight">
          Explore the Fictional City Board
        </h1>
        <p className="text-base sm:text-lg text-shield-cream/90 leading-relaxed">
          The City Board is the central interactive arena where players navigate urban districts to uncover high-pressure
          dilemmas. Each district represents a typical environment where youths encounter social or digital risks.
        </p>
      </div>

      {/* Atmospheric Context Card */}
      <div className="p-6 sm:p-7 rounded-2xl bg-shield-void/85 border border-shield-cardBorder/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl">
        <div className="space-y-1.5 max-w-2xl">
          <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-shield-gold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Interactive Exploration Sandbox</span>
          </div>
          <p className="text-sm text-shield-cream/90 leading-relaxed">
            Click any district below to inspect its learning focus, visual atmosphere, and sample dilemma. Use the map or
            accessible list toggle for your preferred viewing mode.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-shield-muted bg-shield-surface/80 px-3.5 py-2 rounded-xl border border-shield-cardBorder/70 flex-shrink-0">
          <MapPin className="w-3.5 h-3.5 text-shield-cyan" />
          <span>4 Districts Active // Sector 01–04</span>
        </div>
      </div>

      {/* Main Interactive District Map & Dossier */}
      <DistrictMap />

      {/* Narrative Journey Banner */}
      <div className="game-panel p-8 sm:p-10 border border-shield-cyan/30 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
        <div className="space-y-2 max-w-xl text-center md:text-left">
          <h3 className="text-2xl font-heading font-black text-white">Curious How Decisions Unfold Here?</h3>
          <p className="text-sm text-shield-muted leading-relaxed">
            Every choice on the City Board triggers immediate feedback and delayed ripples across the district. Test out
            the Delayed Consequence Engine to see it in action.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/how-it-works"
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-shield-blue hover:bg-shield-blue/90 text-white text-sm font-heading font-bold shadow-glow-blue transition-all hover:scale-105"
          >
            <span>How Missions Work</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/guardians"
            className="inline-flex items-center gap-2 px-5 py-3.5 rounded-xl bg-shield-navy hover:bg-shield-slate border border-shield-cardBorder text-shield-muted hover:text-white text-sm font-semibold transition-colors"
          >
            <span>Meet District Guardians</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
