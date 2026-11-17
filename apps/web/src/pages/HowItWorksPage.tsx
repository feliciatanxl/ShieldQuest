import React, { useState } from 'react';
import {
  Compass,
  FileSearch,
  GitBranch,
  Clock,
  Sparkles,
  ShieldCheck,
  TrendingUp,
  Brain,
  Vote,
  MessageSquare,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Check,
  LucideIcon,
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface GameStage {
  step: number;
  name: string;
  summary: string;
  cue: string;
  color: string;
  icon: LucideIcon;
}

const gameStages: GameStage[] = [
  { step: 1, name: 'Enter', summary: 'Pick your avatar, join a private squad and step into the Retail District.', cue: 'Explore the world', color: '#06B6D4', icon: Compass },
  { step: 2, name: 'Investigate', summary: 'Search the scene for clues and complete short interactive mini-games.', cue: 'Find the clues', color: '#F59E0B', icon: FileSearch },
  { step: 3, name: 'Decide', summary: 'Make your choice, then decide as a squad.', cue: 'Choose together', color: '#3B82F6', icon: GitBranch },
  { step: 4, name: 'Experience', summary: 'See immediate outcomes, then delayed ones through the Ripple Effect.', cue: 'Ripple Effect', color: '#F43F5E', icon: Clock },
  { step: 5, name: 'Reflect', summary: 'Look back at what happened through the six S.H.I.E.L.D. competencies.', cue: 'Review the case', color: '#8B5CF6', icon: ShieldCheck },
  { step: 6, name: 'Grow', summary: 'Earn progression rewards and unlock Guardian companions.', cue: 'Level up', color: '#10B981', icon: TrendingUp },
];

const tveSteps = [
  { name: 'Think', desc: 'Players independently consider the situation.', icon: Brain, color: '#06B6D4' },
  { name: 'Vote', desc: 'Players submit private responses.', icon: Vote, color: '#F59E0B' },
  { name: 'Explain', desc: 'The squad discusses reasoning before a final team decision.', icon: MessageSquare, color: '#8B5CF6' },
];

export const HowItWorksPage: React.FC = () => {
  const [activeStepIdx, setActiveStepIdx] = useState<number>(0);
  const currentStage = gameStages[activeStepIdx];
  const StageIcon = currentStage.icon;
  const go = (delta: number) => setActiveStepIdx((prev) => (prev + delta + gameStages.length) % gameStages.length);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-14">
      {/* Header */}
      <div className="page-intro max-w-3xl space-y-3">
        <div className="quest-tag">
          <Sparkles className="w-3.5 h-3.5" />
          <span>GAMEPLAY WALKTHROUGH</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-heading font-black text-shield-cream tracking-tight leading-tight">
          How ShieldQuest Works
        </h1>
        <p className="text-base sm:text-lg text-shield-cream/90 leading-relaxed">
          From first clue to delayed consequence: the planned journey through a ShieldQuest case.
        </p>
      </div>

      {/* 6-Step Player Journey */}
      <section className="space-y-6" aria-labelledby="journey-heading">
        <div className="flex items-end justify-between gap-4">
          <h2 id="journey-heading" className="text-2xl sm:text-3xl font-heading font-black text-shield-cream tracking-tight">
            The 6-Step Player Journey
          </h2>
          <span className="quest-tag whitespace-nowrap">Stage {activeStepIdx + 1} of 6</span>
        </div>

        {/* Quest track */}
        <div className="relative">
          <div className="hidden sm:block absolute left-[8.33%] right-[8.33%] top-6 h-1 bg-[repeating-linear-gradient(90deg,rgb(var(--shield-cardBorder))_0_6px,transparent_6px_12px)]" aria-hidden="true" />
          <div
            className="hidden sm:block absolute left-[8.33%] top-6 h-1 bg-[repeating-linear-gradient(90deg,rgb(var(--shield-gold))_0_6px,transparent_6px_12px)] transition-all duration-500"
            style={{ width: `${(activeStepIdx / (gameStages.length - 1)) * 83.33}%` }}
            aria-hidden="true"
          />
          <div className="relative grid grid-cols-3 sm:grid-cols-6 gap-y-5" role="tablist" aria-label="Player journey stages">
            {gameStages.map((stage, idx) => {
              const isSelected = idx === activeStepIdx;
              const isDone = idx < activeStepIdx;
              const Icon = stage.icon;
              return (
                <button
                  key={stage.name}
                  type="button"
                  role="tab"
                  id={`stage-tab-${idx}`}
                  aria-selected={isSelected}
                  aria-controls="stage-panel"
                  onClick={() => setActiveStepIdx(idx)}
                  className="group flex flex-col items-center gap-2 rounded-xl py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-shield-cyan"
                >
                  <span
                    className={`relative flex h-12 w-12 items-center justify-center rounded-full border-2 transition-all duration-300 ${
                      isSelected ? 'scale-110 text-white shadow-lg' : isDone ? 'text-white' : 'bg-shield-card text-shield-muted group-hover:text-shield-cream'
                    }`}
                    style={{
                      borderColor: isSelected || isDone ? stage.color : undefined,
                      backgroundColor: isSelected || isDone ? stage.color : undefined,
                      boxShadow: isSelected ? `0 4px 0 0 ${stage.color}66` : undefined,
                    }}
                  >
                    {isDone ? <Check className="w-5 h-5" aria-hidden="true" /> : <Icon className="w-5 h-5" aria-hidden="true" />}
                  </span>
                  <span className={`text-xs font-heading font-bold ${isSelected ? 'text-shield-cream' : 'text-shield-muted'}`}>
                    {stage.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Active stage panel */}
        <div
          id="stage-panel"
          role="tabpanel"
          aria-labelledby={`stage-tab-${activeStepIdx}`}
          className="dialogue-panel relative overflow-hidden p-6 sm:p-8"
          style={{ borderColor: `${currentStage.color}66` }}
        >
          <div
            className="absolute inset-x-0 top-0 h-2 pointer-events-none transition-colors duration-500"
            style={{ backgroundColor: currentStage.color }}
            aria-hidden="true"
          />
          <div key={activeStepIdx} className="relative flex flex-col md:flex-row md:items-center gap-6 animate-fadeIn">
            <div
              className="pixel-frame flex h-20 w-20 flex-shrink-0 items-center justify-center text-white"
              style={{ backgroundColor: currentStage.color }}
            >
              <StageIcon className="w-10 h-10" aria-hidden="true" />
            </div>
            <div className="flex-1 space-y-1.5">
              <span className="text-xs font-mono font-bold uppercase tracking-wider" style={{ color: currentStage.color }}>
                Step 0{currentStage.step} · {currentStage.cue}
              </span>
              <h3 className="text-2xl sm:text-3xl font-heading font-black text-shield-cream">{currentStage.name}</h3>
              <p className="text-sm sm:text-base text-shield-cream/90 max-w-xl leading-relaxed">{currentStage.summary}</p>
            </div>
            <div className="flex items-center gap-2 self-end md:self-center">
              <button
                type="button"
                onClick={() => go(-1)}
                className="flex h-11 w-11 items-center justify-center rounded-xl bg-shield-navy border border-shield-cardBorder text-shield-muted hover:text-shield-cream focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-shield-cyan"
                aria-label="Previous Stage"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={() => go(1)}
                className="flex h-11 w-11 items-center justify-center rounded-xl bg-shield-blue text-white hover:bg-shield-blue/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-shield-cyan"
                aria-label="Next Stage"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Think–Vote–Explain */}
      <section className="space-y-6" aria-labelledby="tve-heading">
        <div>
          <h2 id="tve-heading" className="text-2xl sm:text-3xl font-heading font-black text-shield-cream tracking-tight">
            The Think–Vote–Explain Ritual
          </h2>
          <p className="text-sm text-shield-muted mt-1">How a squad of up to five reaches a decision together.</p>
        </div>

        <ol className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          {tveSteps.map(({ name, desc, icon: Icon, color }, idx) => (
            <li key={name} className="relative game-panel shopfront p-6 !pt-9 text-center space-y-3" style={{ ["--awning" as string]: color }}>
              <span
                className="pixel-frame mx-auto flex h-14 w-14 items-center justify-center text-white"
                style={{ backgroundColor: color }}
              >
                <Icon className="w-7 h-7" aria-hidden="true" />
              </span>
              <h3 className="text-2xl font-heading font-black tracking-wide text-shield-cream uppercase">{name}</h3>
              <p className="text-sm text-shield-cream/85 leading-relaxed">{desc}</p>
              {idx < tveSteps.length - 1 && (
                <ChevronRight
                  className="hidden md:block absolute -right-5 top-1/2 -translate-y-1/2 w-6 h-6 text-shield-muted z-10"
                  aria-hidden="true"
                />
              )}
            </li>
          ))}
        </ol>

        {/* Anonymous response illustration */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl border border-dashed border-shield-cardBorder p-4 sm:px-6">
          <div className="flex items-center gap-2" aria-hidden="true">
            {Array.from({ length: 5 }).map((_, i) => (
              <span key={i} className="flex h-9 w-9 items-center justify-center rounded-full bg-shield-navy border border-shield-cyan/40 text-shield-cyan">
                <Check className="w-4 h-4" />
              </span>
            ))}
          </div>
          <p className="text-xs text-shield-muted text-center sm:text-right">
            Concept illustration: the squad sees that everyone has responded, never who chose what.
          </p>
        </div>
      </section>

      {/* Navigation Links */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-shield-cardBorder/60">
        <Link to="/world" className="inline-flex items-center gap-2 text-sm font-semibold text-shield-cyan hover:text-shield-cream transition-colors">
          <span>Explore the City Board</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
        <Link to="/guardians" className="inline-flex items-center gap-2 text-sm font-semibold text-shield-gold hover:text-shield-cream transition-colors">
          <span>Meet the Six Guardians</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
};
