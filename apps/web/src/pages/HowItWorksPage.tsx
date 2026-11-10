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
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface GameLoopStep {
  step: number;
  title: string;
  tagline: string;
  description: string;
  icon: React.ReactNode;
  previewCue: string;
}

const gameLoopSteps: GameLoopStep[] = [
  {
    step: 1,
    title: 'Enter the City Board',
    tagline: 'Navigate the Urban Hotspots',
    description:
      'Players explore a stylised district map representing familiar youth environments: School Street, Retail District, Digi-District, and Community Hub. Each zone pulses with active dilemma hotspots.',
    icon: <Compass className="w-6 h-6 text-shield-cyan" />,
    previewCue: 'Interactive district selection with visual atmospheric indicators.',
  },
  {
    step: 2,
    title: 'Choose a Mission',
    tagline: 'Encounter a Realistic Dilemma',
    description:
      'Select a scenario based on an emerging threat—such as a fast-cash courier gig, a hijacked social media verification link, or peer pressure to share an exam screenshot.',
    icon: <GitBranch className="w-6 h-6 text-shield-gold" />,
    previewCue: 'Curated narrative dilemmas inspired by real-world social pressure.',
  },
  {
    step: 3,
    title: 'Examine Evidence',
    tagline: 'Deconstruct Suspicious Signals',
    description:
      'Inspect simulated artefacts: message threads, fake receipt snapshots, shortened URLs, domain certificates, and permission prompts. Players look for anomalies before committing.',
    icon: <FileSearch className="w-6 h-6 text-shield-blue" />,
    previewCue: 'Simulated evidence inspection with Guardian clue overlays.',
  },
  {
    step: 4,
    title: 'Make a Decision',
    tagline: 'Act Under Simulated Pressure',
    description:
      'Choose an action from branching paths under time constraints. In squad mode, teammates cast secret individual ballots before deliberating differences openly without peer intimidation.',
    icon: <Users className="w-6 h-6 text-shield-violet" />,
    previewCue: 'Think–Vote–Explain squad consensus mechanic with secret voting.',
  },
  {
    step: 5,
    title: 'Immediate & Delayed Consequences',
    tagline: 'Experience the Ripple Effect',
    description:
      'Witness instant feedback followed by second-order consequences: short-term relief might hide a locked account, a compromised friend, or a police investigation that surfaces later.',
    icon: <Clock className="w-6 h-6 text-shield-cyan" />,
    previewCue: 'Delayed Consequence Engine tracks multi-turn fallout over time.',
  },
  {
    step: 6,
    title: 'Reflect & Strengthen Skills',
    tagline: 'Earn Guardian Competencies',
    description:
      'Review the decision through the S.H.I.E.L.D. framework, unlock Guardian protective habits, and practise bystander intervention scripts to protect squad peers.',
    icon: <ShieldCheck className="w-6 h-6 text-shield-gold" />,
    previewCue: 'Skill-based Guardian achievement without random loot mechanics.',
  },
];

export const HowItWorksPage: React.FC = () => {
  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);
  const activeStep = gameLoopSteps[activeStepIndex];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-20">
      {/* Header */}
      <div className="max-w-3xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-shield-navy border border-shield-cardBorder text-xs font-semibold text-shield-cyan mb-4">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Gameplay Architecture</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-heading font-black text-white tracking-tight mb-6">
          How ShieldQuest Works
        </h1>
        <p className="text-lg text-shield-cream/90 leading-relaxed">
          ShieldQuest transforms crime prevention from passive memorisation into an active, multi-stage investigative
          experience where players examine evidence, debate choices, and experience realistic delayed outcomes.
        </p>
      </div>

      {/* Planned Experience Notice */}
      <div className="p-4 rounded-xl bg-shield-navy/60 border border-shield-cardBorder flex items-center gap-3 text-xs sm:text-sm text-shield-muted">
        <Info className="w-4 h-4 text-shield-cyan flex-shrink-0" />
        <span>
          <strong className="text-white">Note:</strong> The walkthrough below illustrates the planned core game loop
          under active development by Team SecurePi.
        </span>
      </div>

      {/* Stepper / Interactive Walkthrough */}
      <section className="space-y-8" aria-labelledby="loop-heading">
        <div className="flex items-center justify-between pb-4 border-b border-shield-cardBorder/60">
          <h2 id="loop-heading" className="text-2xl font-heading font-extrabold text-white">
            The 6-Step Player Journey
          </h2>
          <span className="text-xs text-shield-muted font-mono">
            Phase 0{activeStep.step} of 06
          </span>
        </div>

        {/* Stepper Navigation Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2" role="tablist">
          {gameLoopSteps.map((s, idx) => {
            const isCurrent = idx === activeStepIndex;
            return (
              <button
                key={s.step}
                type="button"
                role="tab"
                aria-selected={isCurrent}
                onClick={() => setActiveStepIndex(idx)}
                className={`p-3 rounded-xl border text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-shield-cyan ${
                  isCurrent
                    ? 'bg-shield-slate border-shield-cyan shadow-glow-cyan text-white'
                    : 'bg-shield-navy/60 border-shield-cardBorder text-shield-muted hover:text-white hover:bg-shield-navy'
                }`}
              >
                <div className="text-[10px] font-mono uppercase tracking-wider mb-1 opacity-70">
                  Step 0{s.step}
                </div>
                <div className="text-xs font-heading font-bold truncate">{s.title}</div>
              </button>
            );
          })}
        </div>

        {/* Active Step Feature Showcase */}
        <div className="game-panel p-8 sm:p-12 border border-shield-cyan/30 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-shield-navy border border-shield-cardBorder">
                {activeStep.icon}
              </div>
              <div>
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-shield-cyan">
                  Phase 0{activeStep.step}
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

            <div className="p-4 rounded-xl bg-shield-navy/80 border border-shield-cardBorder text-xs text-shield-cream/90">
              <span className="font-semibold text-shield-cyan block mb-1">In-Game Mechanism:</span>
              <span>{activeStep.previewCue}</span>
            </div>
          </div>

          <div className="lg:col-span-5 bg-shield-navy/70 p-6 rounded-2xl border border-shield-cardBorder space-y-4">
            <span className="text-xs font-mono uppercase tracking-widest text-shield-muted block">
              Core Learning Outcome
            </span>
            <div className="p-4 rounded-xl bg-shield-dark/80 border border-shield-cardBorder/60 space-y-2">
              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-shield-gold" />
                <span>Behavioural Shift</span>
              </div>
              <p className="text-xs text-shield-muted leading-relaxed">
                Replaces instinctual, impulsive clicking with intentional pauses, evidence validation, and supportive
                peer interventions.
              </p>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() =>
                  setActiveStepIndex((prev) => (prev > 0 ? prev - 1 : gameLoopSteps.length - 1))
                }
                className="text-xs text-shield-muted hover:text-white p-2"
              >
                ← Previous Step
              </button>
              <button
                type="button"
                onClick={() =>
                  setActiveStepIndex((prev) => (prev < gameLoopSteps.length - 1 ? prev + 1 : 0))
                }
                className="text-xs font-bold text-shield-cyan hover:underline p-2"
              >
                Next Step →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Think-Vote-Explain Deep Dive */}
      <section className="game-panel p-8 sm:p-12 border border-shield-cardBorder/80 space-y-8" aria-labelledby="tve-heading">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-shield-navy border border-shield-cardBorder text-xs font-semibold text-shield-gold mb-3">
            <Users className="w-3.5 h-3.5" />
            <span>Squad Play Mechanic</span>
          </div>
          <h2 id="tve-heading" className="text-3xl font-heading font-extrabold text-white tracking-tight mb-2">
            The Think–Vote–Explain Ritual
          </h2>
          <p className="text-sm sm:text-base text-shield-muted">
            Group pressure is often the trigger for risky choices. ShieldQuest turns group dynamics into a protective
            shield through structured deliberation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-shield-navy/60 border border-shield-cardBorder space-y-3">
            <div className="w-8 h-8 rounded-lg bg-shield-slate flex items-center justify-center font-bold text-shield-cyan text-sm">
              1
            </div>
            <h3 className="text-lg font-heading font-bold text-white">Think</h3>
            <p className="text-xs sm:text-sm text-shield-muted leading-relaxed">
              Squad members independently review the evidence without discussing it first. No leader can influence
              teammates before they form their own assessment.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-shield-navy/60 border border-shield-cardBorder space-y-3">
            <div className="w-8 h-8 rounded-lg bg-shield-slate flex items-center justify-center font-bold text-shield-gold text-sm">
              2
            </div>
            <h3 className="text-lg font-heading font-bold text-white">Vote</h3>
            <p className="text-xs sm:text-sm text-shield-muted leading-relaxed">
              Everyone submits a private choice via their own device. The system aggregates results anonymously,
              ensuring zero social penalty for differing opinions.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-shield-navy/60 border border-shield-cardBorder space-y-3">
            <div className="w-8 h-8 rounded-lg bg-shield-slate flex items-center justify-center font-bold text-shield-violet text-sm">
              3
            </div>
            <h3 className="text-lg font-heading font-bold text-white">Explain</h3>
            <p className="text-xs sm:text-sm text-shield-muted leading-relaxed">
              Squads unpack why votes differed. Students share the red flags they noticed, discuss manipulation tricks,
              and agree on a unified defensive course.
            </p>
          </div>
        </div>
      </section>

      {/* Navigation Footer */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-shield-cardBorder/50">
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
