import React from 'react';
import { Compass, ArrowRight } from 'lucide-react';
import { DistrictMap } from '../components/DistrictMap';
import { Link } from 'react-router-dom';

export const WorldPage: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-12">
      {/* Header — 1 to 2 crisp sentences */}
      <div className="max-w-3xl space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-shield-navy border border-shield-cardBorder text-xs font-mono font-semibold text-shield-cyan">
          <Compass className="w-3.5 h-3.5 text-shield-cyan" />
          <span>CITY BOARD</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-heading font-black text-white tracking-tight leading-tight">
          Explore the Fictional City Board
        </h1>
        <p className="text-base sm:text-lg text-shield-cream/90 leading-relaxed">
          Four distinct districts, each reflecting everyday situations where young people navigate social pressure and digital choices.
        </p>
      </div>

      {/* Main Interactive District Map */}
      <DistrictMap />

      {/* Bottom Link */}
      <div className="p-6 rounded-2xl bg-shield-void/80 border border-shield-cardBorder flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-sm text-shield-cream/90 text-center sm:text-left">
          Curious how squad decisions and delayed outcomes work in these districts?
        </p>
        <Link
          to="/how-it-works"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-shield-blue text-white text-xs font-heading font-bold shadow-glow-blue transition-all hover:scale-105 flex-shrink-0"
        >
          <span>See How Missions Work</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
};
