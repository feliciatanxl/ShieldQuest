import React from 'react';
import { Shield, Sparkles, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ShieldSkill {
  letter: string;
  name: string;
  summary: string;
  color: string;
}

const shieldSkills: ShieldSkill[] = [
  {
    letter: 'S',
    name: 'Spot the Risk',
    summary: 'Recognise red flags, spoofed accounts, and manipulation cues early.',
    color: '#06B6D4',
  },
  {
    letter: 'H',
    name: 'Hold Before Acting',
    summary: 'Pause under pressure to resist artificial countdowns and false urgency.',
    color: '#F59E0B',
  },
  {
    letter: 'I',
    name: 'Investigate the Signal',
    summary: 'Verify website domains, payment requests, and suspicious sender identities.',
    color: '#3B82F6',
  },
  {
    letter: 'E',
    name: 'Evaluate Consequences',
    summary: 'Weigh both immediate outcomes and delayed ripple effects before deciding.',
    color: '#8B5CF6',
  },
  {
    letter: 'L',
    name: 'Lock Your Boundaries',
    summary: 'Say no confidently when friends or strangers pressure you into risky dares.',
    color: '#10B981',
  },
  {
    letter: 'D',
    name: 'Defend Your Peers',
    summary: 'Step in with supportive exit strategies to shield friends from harm.',
    color: '#EC4899',
  },
];

export const AboutPage: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-16">
      {/* 1. Short Introduction */}
      <div className="max-w-3xl space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-shield-navy border border-shield-cardBorder text-xs font-mono font-semibold text-shield-cyan">
          <Shield className="w-3.5 h-3.5" />
          <span>ABOUT SHIELDQUEST</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-heading font-black text-white tracking-tight leading-tight">
          Empowering Youths to Make Safer Choices Together
        </h1>
        <p className="text-base sm:text-lg text-shield-cream/90 leading-relaxed">
          ShieldQuest is an interactive, scenario-based adventure game developed by Team SecurePi.
          We replace passive lectures with a safe digital sandbox where young people explore real-world pressures,
          discover hidden risks, and practise protective instincts.
        </p>
      </div>

      {/* 2. Why the Game Exists */}
      <section className="game-panel p-8 sm:p-10 border border-shield-cardBorder/80 space-y-6" aria-labelledby="why-heading">
        <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-shield-gold">
          <Sparkles className="w-4 h-4" />
          <span>THE CHALLENGE</span>
        </div>
        <h2 id="why-heading" className="text-2xl sm:text-3xl font-heading font-black text-white tracking-tight">
          Why Experience Matters
        </h2>
        <p className="text-sm text-shield-cream/90 leading-relaxed">
          Most youths know scams are bad. But risky lapses rarely happen in quiet classrooms—they strike during
          urgent social moments where saying no feels awkward or offers seem too good to pass up.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <div className="p-4 rounded-xl bg-shield-void/80 border border-shield-cardBorder space-y-1.5">
            <h3 className="text-sm font-heading font-bold text-shield-cyan">Urgency & Pressure</h3>
            <p className="text-xs text-shield-muted leading-relaxed">
              Countdowns and panic force quick reflex choices before critical evaluation can kick in.
            </p>
          </div>
          <div className="p-4 rounded-xl bg-shield-void/80 border border-shield-cardBorder space-y-1.5">
            <h3 className="text-sm font-heading font-bold text-shield-gold">Delayed Fallout</h3>
            <p className="text-xs text-shield-muted leading-relaxed">
              Fast money or quick approval feel harmless now, while legal or financial fallout emerges later.
            </p>
          </div>
          <div className="p-4 rounded-xl bg-shield-void/80 border border-shield-cardBorder space-y-1.5">
            <h3 className="text-sm font-heading font-bold text-shield-violet">Peer Support</h3>
            <p className="text-xs text-shield-muted leading-relaxed">
              Equipping friends with mutual bystander protection scripts creates a supportive circle of trust.
            </p>
          </div>
        </div>
      </section>

      {/* 3. Six S.H.I.E.L.D. Learning Skills */}
      <section className="space-y-6" aria-labelledby="framework-heading">
        <div>
          <h2 id="framework-heading" className="text-2xl sm:text-3xl font-heading font-black text-white tracking-tight">
            The S.H.I.E.L.D. Framework
          </h2>
          <p className="text-sm text-shield-muted mt-1">
            Six transferable protective competencies players develop through in-game dilemmas.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {shieldSkills.map((skill) => (
            <div
              key={skill.letter}
              className="game-panel p-5 border border-shield-cardBorder space-y-2 hover:border-shield-cyan/50 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <span
                  className="w-8 h-8 rounded-lg bg-shield-void border border-shield-cardBorder flex items-center justify-center font-heading font-black text-base"
                  style={{ color: skill.color }}
                >
                  {skill.letter}
                </span>
                <h3 className="text-base font-heading font-bold text-white">{skill.name}</h3>
              </div>
              <p className="text-xs text-shield-cream/80 leading-relaxed">{skill.summary}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 4. One CTA & Brief Disclaimer */}
      <div className="p-8 rounded-2xl bg-gradient-to-r from-shield-navy to-shield-surface border border-shield-blue/40 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-1 text-center sm:text-left">
          <h3 className="text-xl font-heading font-black text-white">
            See the framework in action
          </h3>
          <p className="text-xs text-shield-muted">
            Explore the 6-step player journey from investigation to delayed feedback.
          </p>
        </div>

        <Link
          to="/how-it-works"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-shield-blue hover:bg-shield-blue/90 text-white font-heading font-bold text-sm shadow-glow-blue transition-all hover:scale-105 flex-shrink-0"
        >
          <span>How It Works</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      <p className="text-[11px] text-shield-muted/70 text-center leading-relaxed max-w-2xl mx-auto">
        ShieldQuest is an independent student educational project developed by Team SecurePi from Nanyang Polytechnic.
        All scenarios and organisations featured are strictly fictional for educational simulation.
      </p>
    </div>
  );
};
