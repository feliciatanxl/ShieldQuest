import React, { useEffect, useState } from 'react';
import { Shield, Sparkles, Filter, CheckCircle2, ArrowRight } from 'lucide-react';
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
    { id: 'all', label: 'All Guardians (6)' },
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-16">
      {/* Header */}
      <div className="max-w-3xl space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-shield-navy/90 border border-shield-cardBorder text-xs font-mono font-semibold text-shield-gold shadow-sm">
          <Shield className="w-3.5 h-3.5 text-shield-gold" />
          <span>ROSTER // CRIME-PREVENTION DISCIPLINES</span>
        </div>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-heading font-black text-white tracking-tight leading-tight">
          Meet the Six Guardians
        </h1>
        <p className="text-base sm:text-lg text-shield-cream/90 leading-relaxed">
          Guardians represent core protective competencies. Each Guardian embodies a specific protective discipline
          and equips players with transferable habits to navigate social coercion, digital deception, and high-pressure
          dilemmas.
        </p>
      </div>

      {/* Educational Notice on Progression */}
      <div className="p-5 sm:p-6 rounded-2xl bg-shield-void/80 border border-shield-cardBorder/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs sm:text-sm text-shield-muted shadow-sm">
        <div className="flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-shield-cyan flex-shrink-0" />
          <span>
            <strong className="text-white">Purely Skill-Based:</strong> In ShieldQuest, Guardians are unlocked
            exclusively through demonstrated reasoning and safe choices—never paywalls, currencies, or random loot boxes.
          </span>
        </div>
        <span className="text-[11px] font-mono text-shield-gold px-3 py-1 rounded-lg bg-shield-surface border border-shield-cardBorder flex-shrink-0">
          6 of 6 Available in Preview
        </span>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none" role="tablist" aria-label="Filter Guardians by discipline">
        <span className="text-xs font-mono uppercase text-shield-muted mr-2 flex items-center gap-1.5">
          <Filter className="w-3.5 h-3.5 text-shield-cyan" /> Filter:
        </span>
        {disciplines.map((d) => (
          <button
            key={d.id}
            type="button"
            role="tab"
            aria-selected={selectedDiscipline === d.id}
            onClick={() => setSelectedDiscipline(d.id)}
            className={`px-4 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-shield-cyan ${
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredGuardians.map((guardian) => (
          <GuardianCard key={guardian.id} guardian={guardian} isDetailed={true} />
        ))}
      </div>

      {/* Educational Framework Alignment */}
      <div className="game-panel p-8 sm:p-10 border border-shield-cardBorder/80 space-y-5 shadow-2xl">
        <div className="flex items-center gap-2 text-xs font-mono font-bold text-shield-cyan uppercase tracking-wider">
          <Sparkles className="w-4 h-4 text-shield-gold" />
          <span>S.H.I.E.L.D. Behavioural Integration</span>
        </div>
        <h3 className="text-2xl sm:text-3xl font-heading font-black text-white">
          How Guardians Reinforce Real-Life Protection
        </h3>
        <p className="text-sm text-shield-cream/90 leading-relaxed max-w-3xl">
          Each Guardian pairs directly with phases of the S.H.I.E.L.D. framework. By testing different responses in
          ShieldQuest, players build the muscle memory to spot red flags, resist peer intimidation, and protect friends
          when real situations arise.
        </p>

        <div className="pt-4 flex flex-wrap gap-4">
          <Link
            to="/about"
            className="inline-flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-shield-gold hover:underline"
          >
            <span>Read about the S.H.I.E.L.D. Framework</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <Link
            to="/world"
            className="inline-flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-shield-cyan hover:underline"
          >
            <span>See Guardians in the City Board</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
};
