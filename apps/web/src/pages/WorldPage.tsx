import React from 'react';
import { Compass, ArrowRight, Store } from 'lucide-react';
import { DistrictMap } from '../components/DistrictMap';
import { Link } from 'react-router-dom';

export const WorldPage: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-10">
      {/* Header */}
      <div className="page-intro flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div className="max-w-3xl space-y-3">
          <div className="quest-tag">
            <Compass className="w-3.5 h-3.5 text-shield-cyan" />
            <span>CITY BOARD</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-heading font-black text-shield-cream tracking-tight leading-tight">
            Explore the Fictional City Board
          </h1>
          <p className="text-base sm:text-lg text-shield-cream/90 leading-relaxed">
            A Singapore-inspired city of four districts. Each one is a preview of the long-term world.
          </p>
        </div>

        <div className="flex items-center gap-4 rounded-2xl border border-shield-gold/40 bg-shield-gold/10 px-5 py-4 lg:w-80 lg:flex-shrink-0">
          <span className="pixel-frame p-2 ml-1 bg-[#E8B75D] text-[#17233D] flex-shrink-0">
            <Store className="w-5 h-5" aria-hidden="true" />
          </span>
          <p className="flex-1 text-sm text-shield-cream/90 leading-snug">
            <strong className="block font-heading text-sm text-shield-cream">Pilot: Retail District</strong>
            The first cases focus on shop-theft prevention.
          </p>
        </div>
      </div>

      {/* Main Interactive District Map */}
      <DistrictMap />

      {/* Bottom Link */}
      <div className="dialogue-panel p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-sm text-shield-cream/90 text-center sm:text-left">
          Curious how squad decisions and delayed outcomes work?
        </p>
        <Link
          to="/how-it-works"
          className="btn-quest text-sm flex-shrink-0"
        >
          <span>See How Missions Work</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
};
