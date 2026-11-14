import React, { useState } from 'react';
import {
  Compass,
  FileSearch,
  GitBranch,
  Clock,
  Sparkles,
  ShieldCheck,
  TrendingUp,
  EyeOff,
  Shield,
  MessageSquare,
  ArrowRight,
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface GameStage {
  step: number;
  name: string;
  summary: string;
  cue: string;
  color: string;
  icon: React.ReactNode;
}

const gameStages: GameStage[] = [
  {
    step: 1,
    name: 'Enter',
    summary: 'Choose a district and locate an active challenge hotspot on the City Board.',
    cue: 'Interactive sector navigation',
    color: '#06B6D4',
    icon: <Compass className="w-6 h-6 text-cyan-400" />,
  },
  {
    step: 2,
    name: 'Investigate',
    summary: 'Inspect simulated chats, links, and fake receipts for hidden warning signs.',
    cue: 'Evidence & red-flag inspection',
    color: '#F59E0B',
    icon: <FileSearch className="w-6 h-6 text-amber-400" />,
  },
  {
    step: 3,
    name: 'Decide',
    summary: 'Weigh trade-offs and commit to a choice under realistic social pressure.',
    cue: 'Branching dilemma selection',
    color: '#3B82F6',
    icon: <GitBranch className="w-6 h-6 text-blue-400" />,
  },
  {
    step: 4,
    name: 'Experience',
    summary: 'Watch immediate relief or validation unfold into delayed fallout over time.',
    cue: 'Delayed Consequence Engine',
    color: '#F43F5E',
    icon: <Clock className="w-6 h-6 text-rose-400" />,
  },
  {
    step: 5,
    name: 'Reflect',
    summary: 'Review what happened and deconstruct manipulation using the S.H.I.E.L.D. framework.',
    cue: 'Guided learning breakdown',
    color: '#8B5CF6',
    icon: <ShieldCheck className="w-6 h-6 text-purple-400" />,
  },
  {
    step: 6,
    name: 'Grow',
    summary: 'Unlock Guardian protective habits and build confidence to stand up for friends.',
    cue: 'Skill progression without paywalls',
    color: '#10B981',
    icon: <TrendingUp className="w-6 h-6 text-emerald-400" />,
  },
];

export const HowItWorksPage: React.FC = () => {
  const [activeStepIdx, setActiveStepIdx] = useState<number>(0);
  const currentStage = gameStages[activeStepIdx];

  const tveSteps = [
    {
      name: 'Think',
      desc: 'Each player reviews clues privately to prevent bandwagoning and social coercion.',
      icon: <EyeOff className="w-5 h-5 text-shield-cyan" />,
    },
    {
      name: 'Vote',
      desc: 'Choices are cast secretly. The group sees the anonymous tally without personal judgment.',
      icon: <Shield className="w-5 h-5 text-shield-gold" />,
    },
    {
      name: 'Explain',
      desc: 'Teammates discuss red flags they noticed and agree on a safe, unified response.',
      icon: <MessageSquare className="w-5 h-5 text-shield-violet" />,
    },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-16">
      {/* Header */}
      <div className="max-w-3xl space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-shield-navy border border-shield-cardBorder text-xs font-mono font-semibold text-shield-cyan">
          <Sparkles className="w-3.5 h-3.5" />
          <span>GAMEPLAY WALKTHROUGH</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-heading font-black text-shield-cream tracking-tight leading-tight">
          How ShieldQuest Works
        </h1>
        <p className="text-base sm:text-lg text-shield-cream/90 leading-relaxed">
          From first clue to delayed consequence, discover how players explore risks and build safer instincts.
        </p>
      </div>

      {/* 6-Step Player Journey */}
      <section className="space-y-6" aria-labelledby="journey-heading">
        <div className="flex items-center justify-between border-b border-shield-cardBorder/60 pb-3">
          <h2 id="journey-heading" className="text-2xl sm:text-3xl font-heading font-black text-shield-cream tracking-tight">
            The 6-Step Player Journey
          </h2>
          <span className="text-xs font-mono text-shield-gold">
            Stage {activeStepIdx + 1} of 6
          </span>
        </div>

        {/* Stage Pill Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5" role="tablist">
          {gameStages.map((stage, idx) => {
            const isSelected = idx === activeStepIdx;
            return (
              <button
                key={stage.name}
                type="button"
                role="tab"
                aria-selected={isSelected}
                onClick={() => setActiveStepIdx(idx)}
                className={`p-3 rounded-xl border text-left transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-shield-cyan ${
                  isSelected
                    ? 'bg-shield-surface border-shield-cyan text-shield-cream shadow-sm ring-1 ring-shield-cyan'
                    : 'bg-shield-void/70 border-shield-cardBorder text-shield-muted hover:text-shield-cream hover:bg-shield-navy'
                }`}
              >
                <div className="text-[10px] font-mono font-bold uppercase tracking-wider mb-1" style={{ color: stage.color }}>
                  0{stage.step}
                </div>
                <div className="text-xs font-heading font-bold truncate">{stage.name}</div>
              </button>
            );
          })}
        </div>

        {/* Active Stage Display */}
        <div className="game-panel p-6 sm:p-8 border border-shield-cyan/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div
              className="p-3.5 rounded-2xl bg-shield-void border shadow-md flex-shrink-0"
              style={{ borderColor: `${currentStage.color}60` }}
            >
              {currentStage.icon}
            </div>
            <div className="space-y-1">
              <span className="text-xs font-mono font-bold uppercase tracking-wider" style={{ color: currentStage.color }}>
                Step 0{currentStage.step} // {currentStage.cue}
              </span>
              <h3 className="text-2xl font-heading font-black text-shield-cream">{currentStage.name}</h3>
              <p className="text-sm text-shield-cream/90 max-w-xl leading-relaxed">
                {currentStage.summary}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end md:self-center flex-shrink-0">
            <button
              type="button"
              onClick={() => setActiveStepIdx((prev) => (prev > 0 ? prev - 1 : gameStages.length - 1))}
              className="px-3 py-1.5 rounded-lg bg-shield-navy border border-shield-cardBorder text-xs font-mono text-shield-muted hover:text-shield-cream"
              aria-label="Previous Stage"
            >
              ← Prev
            </button>
            <button
              type="button"
              onClick={() => setActiveStepIdx((prev) => (prev < gameStages.length - 1 ? prev + 1 : 0))}
              className="px-3 py-1.5 rounded-lg bg-shield-blue text-xs font-mono text-white font-bold hover:bg-shield-blue/90"
              aria-label="Next Stage"
            >
              Next →
            </button>
          </div>
        </div>
      </section>

      {/* Think-Vote-Explain Compact Section */}
      <section className="game-panel p-6 sm:p-8 border border-shield-cardBorder/80 space-y-6" aria-labelledby="tve-heading">
        <div>
          <h2 id="tve-heading" className="text-2xl sm:text-3xl font-heading font-black text-shield-cream tracking-tight">
            The Think–Vote–Explain Ritual
          </h2>
          <p className="text-sm text-shield-muted mt-1">
            How squad mode turns peer pressure into mutual protection.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {tveSteps.map((item, idx) => (
            <div key={item.name} className="p-4 rounded-xl bg-shield-void/80 border border-shield-cardBorder space-y-2">
              <div className="flex items-center justify-between">
                <div className="p-2 rounded-lg bg-shield-navy border border-shield-cardBorder">
                  {item.icon}
                </div>
                <span className="text-xs font-mono font-bold text-shield-muted">0{idx + 1}</span>
              </div>
              <h3 className="text-base font-heading font-bold text-shield-cream">{item.name}</h3>
              <p className="text-xs text-shield-cream/80 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Navigation Links */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-shield-cardBorder/60">
        <Link
          to="/world"
          className="inline-flex items-center gap-2 text-sm font-semibold text-shield-cyan hover:text-shield-cream transition-colors"
        >
          <span>Explore the City Board</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
        <Link
          to="/guardians"
          className="inline-flex items-center gap-2 text-sm font-semibold text-shield-gold hover:text-shield-cream transition-colors"
        >
          <span>Meet the Six Guardians</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
};
