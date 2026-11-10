import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, Home, AlertTriangle } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32 text-center space-y-8">
      <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-shield-navy border-2 border-shield-cardBorder text-shield-gold shadow-glow-gold">
        <AlertTriangle className="w-12 h-12" />
      </div>

      <div className="space-y-4">
        <span className="text-xs font-mono font-bold uppercase tracking-widest text-shield-cyan bg-shield-void px-3 py-1 rounded-full border border-shield-cardBorder">
          ERROR 404 // SECTOR UNCHARTED
        </span>
        <h1 className="text-4xl sm:text-5xl font-heading font-black text-white tracking-tight">
          Lost on the City Board?
        </h1>
        <p className="text-base sm:text-lg text-shield-muted max-w-lg mx-auto leading-relaxed">
          The coordinate you navigated to doesn't exist within the four known sectors of Project SHIELD.
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-shield-blue hover:bg-shield-blue/90 text-white font-heading font-bold text-sm shadow-glow-blue transition-all hover:scale-105"
        >
          <Home className="w-4 h-4" />
          <span>Return to Headquarters</span>
        </Link>

        <Link
          to="/world"
          className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-shield-navy hover:bg-shield-slate text-shield-cream font-heading font-semibold text-sm border border-shield-cardBorder transition-colors"
        >
          <Compass className="w-4 h-4 text-shield-cyan" />
          <span>Explore Districts</span>
        </Link>
      </div>
    </div>
  );
};
