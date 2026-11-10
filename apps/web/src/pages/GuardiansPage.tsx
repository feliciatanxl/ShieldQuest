import React, { useEffect, useState } from 'react';
import { Shield, ArrowRight } from 'lucide-react';
import { GuardianCard } from '../components/GuardianCard';
import { fetchGuardians } from '../services/api';
import { Guardian } from '@shieldquest/shared';
import { Link } from 'react-router-dom';

export const GuardiansPage: React.FC = () => {
  const [guardians, setGuardians] = useState<Guardian[]>([]);
  const [selectedDiscipline, setSelectedDiscipline] = useState<string>('all');

  useEffect(() => {
    fetchGuardians().then(setGuardians);
  }, []);

  const disciplines = [
    { id: 'all', label: 'All Guardians' },
    { id: 'verification', label: 'Verification' },
    { id: 'consultation', label: 'Consultation' },
    { id: 'reporting', label: 'Reporting' },
    { id: 'peer protection', label: 'Peer Protection' },
    { id: 'situational awareness', label: 'Situational Awareness' },
    { id: 'digital hygiene', label: 'Digital Hygiene' },
  ];

  const filteredGuardians =
    selectedDiscipline === 'all'
      ? guardians
      : guardians.filter(
          (g) => g.discipline.toLowerCase() === selectedDiscipline.toLowerCase()
        );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-12">
      {/* Header */}
      <div className="max-w-3xl space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-shield-navy border border-shield-cardBorder text-xs font-mono font-semibold text-shield-gold">
          <Shield className="w-3.5 h-3.5" />
          <span>GUARDIAN ROSTER</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-heading font-black text-white tracking-tight leading-tight">
          Meet the Six Guardians
        </h1>
        <p className="text-base sm:text-lg text-shield-cream/90 leading-relaxed">
          Six companions who embody practical protective skills to help you spot manipulation, resist pressure, and protect your squad.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none" role="tablist" aria-label="Filter Guardians by discipline">
        {disciplines.map((d) => (
          <button
            key={d.id}
            type="button"
            role="tab"
            aria-selected={selectedDiscipline === d.id}
            onClick={() => setSelectedDiscipline(d.id)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-shield-cyan ${
              selectedDiscipline === d.id
                ? 'bg-shield-blue text-white shadow-glow-blue font-bold border border-shield-cyan/50'
                : 'bg-shield-void/80 text-shield-muted hover:text-white hover:bg-shield-surface border border-shield-cardBorder'
            }`}
          >
            {d.label}
          </button>
        ))}
      </div>

      {/* Guardian Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredGuardians.map((guardian) => (
          <GuardianCard key={guardian.id} guardian={guardian} />
        ))}
      </div>

      {/* Bottom Link */}
      <div className="p-6 rounded-2xl bg-shield-void/80 border border-shield-cardBorder flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-sm text-shield-cream/90 text-center sm:text-left">
          Guardians are unlocked purely through demonstrated reasoning in City Board missions.
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
