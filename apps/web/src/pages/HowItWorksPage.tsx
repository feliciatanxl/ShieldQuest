import React, { useState } from 'react';
import {
  Compass,
  FileSearch,
  Users,
  GitBranch,
  Clock,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Info,
  CheckCircle2,
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface GameLoopStep {
  step: number;
  title: string;
  tagline: string;
  description: string;
  icon: React.ReactNode;
  previewCue: string;
  color: string;
}

const gameLoopSteps: GameLoopStep[] = [
  {
    step: 1,
    title: 'Enter the City Board',
    tagline: 'Navigate the Urban Hotspots',
    description:
      'Players explore a stylised district map representing familiar youth environments: School Street, Retail District, Digi-District, and Community Hub. Each zone pulses with active dilemma hotspots.',
    icon: <Compass className="w-6 h-6 text-cyan-400" />,
    previewCue: 'Interactive district selection with visual atmospheric indicators.',
    color: '#06B6D4',
  },
  {
    step: 2,
    title: 'Choose a Mission',
    tagline: 'Encounter a Realistic Dilemma',
    description:
      'Select a scenario based on an emerging threat—such as a fast-cash courier gig, a hijacked social media verification link, or peer pressure to share an exam screenshot.',
    icon: <GitBranch className="w-6 h-6 text-amber-400" />,
    previewCue: 'Curated narrative dilemmas inspired by real-world social pressure.',
    color: '#F59E0B',
  },
  {
    step: 3,
    title: 'Examine Evidence',
    tagline: 'Deconstruct Suspicious Signals',
    description:
      'Inspect simulated artefacts: message threads, fake receipt snapshots, shortened URLs, domain certificates, and permission prompts. Players look for anomalies before committing.',
    icon: <FileSearch className="w-6 h-6 text-blue-400" />,
    previewCue: 'Simulated evidence inspection with Guardian clue overlays.',
    color: '#3B82F6',
  },
  {
    step: 4,
    title: 'Make a Decision',
    tagline: 'Act Under Simulated Pressure',
    description:
      'Choose an action from branching paths under time constraints. In squad mode, teammates cast secret individual ballots before deliberating differences openly without peer intimidation.',
    icon: <Users className="w-6 h-6 text-purple-400" />,
    previewCue: 'Think–Vote–Explain squad consensus mechanic with secret voting.',
    color: '#8B5CF6',
  },
  {
    step: 5,
    title: 'Immediate & Delayed Consequences',
    tagline: 'Experience the Ripple Effect',
    description:
      'Witness instant feedback followed by second-order consequences: short-term relief might hide a locked account, a compromised friend, or a police investigation that surfaces later.',
    icon: <Clock className="w-6 h-6 text-rose-400" />,
    previewCue: 'Delayed Consequence Engine tracks multi-turn fallout over time.',
    color: '#F43F5E',
  },
  {
    step: 6,
    title: 'Reflect & Strengthen Skills',
    tagline: 'Earn Guardian Competencies',
    description:
      'Review the decision through the S.H.I.E.L.D. framework, unlock Guardian protective habits, and practise bystander intervention scripts to protect squad peers.',
    icon: <ShieldCheck className="w-6 h-6 text-emerald-400" />,
    previewCue: 'Skill-based Guardian achievement without random loot mechanics.',
    color: '#10B981',
  },
];

export const HowItWorksPage: React.FC = () => {
  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);
  const activeStep = gameLoopSteps[activeStepIndex];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-20">
      {/* Header */}
      <div className="max-w-3xl space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-shield-navy/90 border border-shield-cardBorder text-xs font-mono font-semibold text-shield-cyan shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-shield-cyan" />
          <span>GAME ARCHITECTURE // MISSION LIFECYCLE</span>
        </div>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-heading font-black text-white tracking-tight leading-tight">
          How ShieldQuest Works
        </h1>
        <p className="text-base sm:text-lg text-shield-cream/90 leading-relaxed">
          ShieldQuest transforms crime prevention from passive memorisation into an active, multi-stage adventure
          experience where players examine evidence, debate choices, and experience realistic delayed outcomes.
        </p>
      </div>

      {/* Planned Experience Notice */}
      <div className="p-4 sm:p-5 rounded-2xl bg-shield-void/80 border border-shield-cardBorder/80 flex items-center gap-3.5 text-xs sm:text-sm text-shield-muted shadow-sm">
        <Info className="w-5 h-5 text-shield-cyan flex-shrink-0" />
        <span>
          <strong className="text-white">Planned Gameplay Experience:</strong> The walkthrough below illustrates the
          core game loop currently under active development by Team SecurePi.
        </span>
      </div>

      {/* Stepper / Adventure Journey Walkthrough */}
      <section className="space-y-8" aria-labelledby="loop-heading">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-shield-cardBorder/70">
          <div>
            <h2 id="loop-heading" className="text-2xl sm:text-3xl font-heading font-black text-white">
              The 6-Step Player Journey
            </h2>
            <p className="text-xs text-shield-muted mt-1">
              Select any stage below to inspect the interactive investigative flow
            </p>
          </div>
          <span className="text-xs text-shield-gold font-mono px-3 py-1 rounded bg-shield-void border border-shield-cardBorder">
            Phase 0{activeStep.step} of 06
          </span>
        </div>

        {/* Stepper Navigation Milestones */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3" role="tablist">
          {gameLoopSteps.map((s, idx) => {
            const isCurrent = idx === activeStepIndex;
            return (
              <button
                key={s.step}
                type="button"
                role="tab"
                aria-selected={isCurrent}
                onClick={() => setActiveStepIndex(idx)}
                className={`p-4 rounded-2xl border text-left transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-shield-cyan relative overflow-hidden ${
                  isCurrent
                    ? 'bg-shield-surface border-shield-cyan shadow-glow-cyan text-white ring-1 ring-shield-cyan scale-[1.02]'
                    : 'bg-shield-void/80 border-shield-cardBorder/80 text-shield-muted hover:text-white hover:bg-shield-navy'
                }`}
              >
                <div className="text-[10px] font-mono font-bold uppercase tracking-wider mb-1.5" style={{ color: s.color }}>
                  Stage 0{s.step}
                </div>
                <div className="text-xs font-heading font-bold truncate leading-tight">{s.title}</div>
              </button>
            );
          })}
        </div>

        {/* Active Stage Feature Showcase */}
        <div className="game-panel p-8 sm:p-12 border border-shield-cyan/30 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center shadow-2xl">
          <div className="lg:col-span-7 space-y-5">
            <div className="flex items-center gap-3.5">
              <div
                className="p-3.5 rounded-2xl bg-shield-void border shadow-md"
                style={{ borderColor: `${activeStep.color}60` }}
              >
                {activeStep.icon}
              </div>
              <div>
                <span className="text-xs font-mono font-bold uppercase tracking-wider" style={{ color: activeStep.color }}>
                  Phase 0{activeStep.step} // Active Stage
                </span>
                <h3 className="text-2xl sm:text-3xl font-heading font-black text-white">
                  {activeStep.title}
                </h3>
              </div>
            </div>

            <p className="text-sm font-semibold text-shield-gold">{activeStep.tagline}</p>

            <p className="text-base text-shield-cream/90 leading-relaxed">
              {activeStep.description}
            </p>

            <div className="p-4 rounded-xl bg-shield-void/80 border border-shield-cardBorder text-xs text-shield-cream">
              <span className="font-mono font-bold text-shield-cyan block mb-1">
                IN-GAME MECHANISM:
              </span>
              <span>{activeStep.previewCue}</span>
            </div>
          </div>

          <div className="lg:col-span-5 bg-shield-void/90 p-6 sm:p-7 rounded-2xl border border-shield-cardBorder space-y-5 shadow-inner">
            <div className="flex items-center justify-between border-b border-shield-cardBorder/60 pb-3">
              <span className="text-xs font-mono font-bold uppercase tracking-widest text-shield-cyan">
                CORE LEARNING OUTCOME
              </span>
              <span className="text-[10px] font-mono text-shield-gold bg-shield-navy px-2 py-0.5 rounded">
                BEHAVIOURAL SHIFT
              </span>
            </div>

            <div className="space-y-3 text-xs sm:text-sm text-shield-cream/90 leading-relaxed">
              <p>
                Replaces impulsive, unverified reflex clicks with intentional pauses, evidence validation habits, and
                supportive bystander intervention scripts.
              </p>
              <div className="flex items-center gap-2 text-xs text-emerald-400 font-medium pt-1">
                <CheckCircle2 className="w-4 h-4" />
                <span>Instills lifelong transferable crime-prevention intuition</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-shield-cardBorder/60 text-xs font-mono">
              <button
                type="button"
                onClick={() =>
                  setActiveStepIndex((prev) => (prev > 0 ? prev - 1 : gameLoopSteps.length - 1))
                }
                className="text-shield-muted hover:text-white p-1"
              >
                ← PREV STAGE
              </button>
              <button
                type="button"
                onClick={() =>
                  setActiveStepIndex((prev) => (prev < gameLoopSteps.length - 1 ? prev + 1 : 0))
                }
                className="text-shield-cyan font-bold hover:underline p-1"
              >
                NEXT STAGE →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Think-Vote-Explain Deep Dive */}
      <section className="game-panel p-8 sm:p-12 border border-shield-cardBorder/80 space-y-8 shadow-2xl" aria-labelledby="tve-heading">
        <div className="max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-shield-void border border-shield-cardBorder text-xs font-mono font-semibold text-shield-gold">
            <Users className="w-3.5 h-3.5" />
            <span>SQUAD PLAY PROTOCOL</span>
          </div>
          <h2 id="tve-heading" className="text-3xl sm:text-4xl font-heading font-black text-white tracking-tight">
            The Think–Vote–Explain Ritual
          </h2>
          <p className="text-sm sm:text-base text-shield-muted">
            Group pressure is often the trigger for risky choices. ShieldQuest turns group dynamics into a protective
            shield through structured deliberation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-shield-void/80 border border-shield-cardBorder space-y-3 shadow-md">
            <div className="w-9 h-9 rounded-xl bg-shield-surface border border-shield-cardBorder flex items-center justify-center font-mono font-bold text-shield-cyan text-sm">
              01
            </div>
            <h3 className="text-lg font-heading font-black text-white">Think</h3>
            <p className="text-xs sm:text-sm text-shield-muted leading-relaxed">
              Squad members independently review the evidence without discussing it first. No leader can influence
              teammates before they form their own assessment.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-shield-void/80 border border-shield-cardBorder space-y-3 shadow-md">
            <div className="w-9 h-9 rounded-xl bg-shield-surface border border-shield-cardBorder flex items-center justify-center font-mono font-bold text-shield-gold text-sm">
              02
            </div>
            <h3 className="text-lg font-heading font-black text-white">Vote</h3>
            <p className="text-xs sm:text-sm text-shield-muted leading-relaxed">
              Everyone submits a private choice via their own device. The system aggregates results anonymously,
              ensuring zero social penalty for differing opinions.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-shield-void/80 border border-shield-cardBorder space-y-3 shadow-md">
            <div className="w-9 h-9 rounded-xl bg-shield-surface border border-shield-cardBorder flex items-center justify-center font-mono font-bold text-shield-violet text-sm">
              03
            </div>
            <h3 className="text-lg font-heading font-black text-white">Explain</h3>
            <p className="text-xs sm:text-sm text-shield-muted leading-relaxed">
              Squads unpack why votes differed. Students share the red flags they noticed, discuss manipulation tricks,
              and agree on a unified defensive course.
            </p>
          </div>
        </div>
      </section>

      {/* Navigation Footer */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-shield-cardBorder/60">
        <Link
          to="/world"
          className="inline-flex items-center gap-2 text-sm font-semibold text-shield-cyan hover:text-white transition-colors"
        >
          <span>Explore the City Board</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
        <Link
          to="/guardians"
          className="inline-flex items-center gap-2 text-sm font-semibold text-shield-cyan hover:text-white transition-colors"
        >
          <span>Learn About the Guardians</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
};
