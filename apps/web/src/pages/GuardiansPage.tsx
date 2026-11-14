import React, { useEffect, useState } from 'react';
import { Shield, ArrowRight } from 'lucide-react';
import { GuardianCard } from '../components/GuardianCard';
import { fetchGuardians } from '../services/api';
import { Guardian } from '@shieldquest/shared';
import { Link } from 'react-router-dom';

export const GuardiansPage: React.FC = () => {
  const [guardians, setGuardians] = useState<Guardian[]>([]);

  useEffect(() => {
    fetchGuardians().then(setGuardians);
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-12">
      {/* Header */}
      <div className="max-w-3xl space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-shield-navy border border-shield-cardBorder text-xs font-mono font-semibold text-shield-gold">
          <Shield className="w-3.5 h-3.5" />
          <span>GUARDIAN COMPANIONS</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-heading font-black text-shield-cream tracking-tight leading-tight">
          Meet the Six Guardians
        </h1>
        <p className="text-base sm:text-lg text-shield-cream/90 leading-relaxed">
          Companions you plan to unlock as you build your S.H.I.E.L.D. skills, each with a personality of their own.
        </p>
      </div>

      {/* Guardian Grid */}
      <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" aria-label="Guardian companions">
        {guardians.map((guardian, idx) => (
          <li key={guardian.id} className="animate-fadeIn" style={{ animationDelay: `${idx * 60}ms` }}>
            <GuardianCard guardian={guardian} index={idx + 1} />
          </li>
        ))}
      </ul>

      {/* Bottom Link */}
      <div className="p-6 rounded-2xl bg-shield-void/80 border border-shield-cardBorder flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-sm text-shield-cream/90 text-center sm:text-left">
          Guardian unlocks are a planned progression feature and are still in development.
        </p>
        <Link
          to="/world"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-shield-navy hover:bg-shield-slate border border-shield-cardBorder text-shield-cyan text-xs font-heading font-bold transition-all hover:scale-105 flex-shrink-0"
        >
          <span>Explore the City Board</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
};
