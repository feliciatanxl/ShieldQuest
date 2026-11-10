import React, { useState } from 'react';
import {
  Shield,
  Target,
  Sparkles,
  Award,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';
import { SHIELD_FRAMEWORK } from '@shieldquest/shared';
import { Link } from 'react-router-dom';

export const AboutPage: React.FC = () => {
  const [activeFrameworkStep, setActiveFrameworkStep] = useState<string>('S');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-20">
      {/* 1. Header Banner */}
      <div className="max-w-3xl space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-shield-navy/90 border border-shield-cardBorder text-xs font-mono font-semibold text-shield-cyan shadow-sm">
          <Shield className="w-3.5 h-3.5 text-shield-cyan" />
          <span>ABOUT PROJECT SHIELD // EDUCATIONAL PURPOSE</span>
        </div>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-heading font-black text-white tracking-tight leading-tight">
          Empowering Youths to Make Safer Choices Together
        </h1>
        <p className="text-base sm:text-lg text-shield-cream/90 leading-relaxed">
          ShieldQuest is an interactive, scenario-driven crime-prevention adventure game created by{' '}
          <strong className="text-white">Team SecurePi</strong> at{' '}
          <strong className="text-white">Nanyang Polytechnic, Singapore</strong>.
        </p>
      </div>

      {/* 2. The Core Problem & Pedagogical Approach */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center" aria-labelledby="problem-heading">
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-shield-void border border-shield-cardBorder text-xs font-mono font-semibold text-shield-gold">
            <Target className="w-3.5 h-3.5" />
            <span>THE EDUCATION CHALLENGE</span>
          </div>
          <h2 id="problem-heading" className="text-3xl sm:text-4xl font-heading font-black text-white tracking-tight">
            Why Passive Awareness Isn't Enough
          </h2>
          <p className="text-base text-shield-cream/90 leading-relaxed">
            Young people are digitally fluent, yet modern scams and criminal exploitation rarely rely on technical ignorance alone.
            Instead, perpetrators weaponise psychological levers:
          </p>

          <div className="space-y-4 text-sm text-shield-muted">
            <div className="p-4 rounded-xl bg-shield-void/80 border border-shield-cardBorder/70 flex items-start gap-3.5">
              <span className="w-6 h-6 rounded-lg bg-shield-navy border border-shield-cardBorder flex items-center justify-center font-mono font-bold text-shield-cyan text-xs flex-shrink-0 mt-0.5">
                01
              </span>
              <div>
                <strong className="text-white block mb-0.5">Manufactured Urgency:</strong>
                <span>Countdown timers, fake deadlines, and panic coerce reflex reactions before critical evaluation can take place.</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-shield-void/80 border border-shield-cardBorder/70 flex items-start gap-3.5">
              <span className="w-6 h-6 rounded-lg bg-shield-navy border border-shield-cardBorder flex items-center justify-center font-mono font-bold text-shield-gold text-xs flex-shrink-0 mt-0.5">
                02
              </span>
              <div>
                <strong className="text-white block mb-0.5">Peer Dynamics & Social Coercion:</strong>
                <span>Risky dilemmas frequently arrive through classmates, gaming squads, or friends, where saying "no" feels socially awkward or disloyal.</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-shield-void/80 border border-shield-cardBorder/70 flex items-start gap-3.5">
              <span className="w-6 h-6 rounded-lg bg-shield-navy border border-shield-cardBorder flex items-center justify-center font-mono font-bold text-shield-violet text-xs flex-shrink-0 mt-0.5">
                03
              </span>
              <div>
                <strong className="text-white block mb-0.5">Delayed Fallout Visibility:</strong>
                <span>Harmful decisions often yield immediate perks (fast pocket money or group praise), while the severe legal or financial fallout surfaces days later.</span>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 game-panel p-8 sm:p-10 border border-shield-cyan/30 space-y-6 shadow-2xl">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-shield-void border border-shield-cardBorder text-shield-cyan">
              <Sparkles className="w-5 h-5 text-shield-cyan" />
            </div>
            <h3 className="text-xl font-heading font-black text-white">
              Our Pedagogical Approach
            </h3>
          </div>

          <p className="text-sm text-shield-cream/90 leading-relaxed">
            Rather than teaching rigid rules that quickly become outdated as tactics evolve, ShieldQuest provides a
            safe simulation sandbox where players experience the consequences of their choices first-hand.
          </p>

          <div className="p-4 rounded-xl bg-shield-void border-l-4 border-shield-gold text-sm text-shield-cream italic shadow-inner">
            "Experience the consequence. Understand the pressure. Protect someone else."
          </div>

          <p className="text-xs text-shield-muted leading-relaxed">
            By embedding decision-making into simulated chat logs, delivery tasks, and social media interactions,
            students internalise transferable critical instincts that protect them in real life.
          </p>
        </div>
      </section>

      {/* 3. The S.H.I.E.L.D. Behavioural Framework */}
      <section className="space-y-8" aria-labelledby="framework-heading">
        <div className="max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-shield-navy border border-shield-cardBorder text-xs font-mono font-semibold text-shield-cyan">
            <Award className="w-3.5 h-3.5 text-shield-cyan" />
            <span>CORE COMPETENCY MODEL</span>
          </div>
          <h2 id="framework-heading" className="text-3xl sm:text-4xl font-heading font-black text-white tracking-tight">
            The S.H.I.E.L.D. Framework
          </h2>
          <p className="text-sm sm:text-base text-shield-muted">
            The heart of our educational design: a structured six-step mental model that youths can apply whenever
            encountering high-pressure dilemmas online or offline.
          </p>
        </div>

        {/* Framework Interactive Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {SHIELD_FRAMEWORK.map((step, idx) => {
            const isSelected = activeFrameworkStep === step.letter;
            return (
              <div
                key={step.letter}
                onClick={() => setActiveFrameworkStep(step.letter)}
                className={`game-panel p-6 sm:p-7 border transition-all duration-300 cursor-pointer ${
                  isSelected
                    ? 'border-shield-cyan bg-shield-surface/95 shadow-glow-cyan ring-1 ring-shield-cyan scale-[1.02]'
                    : 'border-shield-cardBorder hover:border-shield-cyan/50 hover:bg-shield-navy/80'
                }`}
                tabIndex={0}
                role="button"
                aria-pressed={isSelected}
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="w-11 h-11 rounded-2xl bg-shield-void border border-shield-cardBorder flex items-center justify-center font-heading font-black text-2xl text-shield-cyan shadow-sm">
                    {step.letter}
                  </span>
                  <span className="text-xs text-shield-gold font-mono font-semibold">
                    Step 0{idx + 1}
                  </span>
                </div>

                <h3 className="text-xl font-heading font-black text-white mb-1">{step.title}</h3>
                <p className="text-xs font-semibold text-shield-gold mb-3">{step.headline}</p>

                <p className="text-xs sm:text-sm text-shield-cream/90 leading-relaxed mb-4">
                  {step.description}
                </p>

                <div className="pt-3 border-t border-shield-cardBorder/50 space-y-2">
                  <div className="text-[11px] text-shield-muted">
                    <strong className="text-white">Real-world scenario:</strong> {step.example}
                  </div>
                  <div className="text-[11px] text-shield-cyan font-mono">
                    Guardian Link: {step.guardianPair}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. Independent Project Scope Notice */}
      <section className="p-6 sm:p-8 rounded-2xl bg-shield-void/80 border border-shield-cardBorder/80 flex flex-col sm:flex-row items-start gap-4 shadow-sm">
        <AlertCircle className="w-6 h-6 text-shield-gold flex-shrink-0 mt-1" />
        <div className="space-y-2 text-sm text-shield-muted leading-relaxed">
          <h3 className="text-base font-heading font-black text-white">Project Scope & Disclaimer</h3>
          <p>
            ShieldQuest is an independent student educational innovation developed by Team SecurePi from Nanyang
            Polytechnic. It is not an official product or service of the Singapore Police Force (SPF), the National
            Crime Prevention Council (NCPC), the National Youth Council (NYC), or any Government statutory board.
          </p>
          <p>
            All scenarios, phone numbers, websites, and organisations featured in ShieldQuest are entirely fictional and
            intended solely for academic and educational simulation.
          </p>
        </div>
      </section>

      {/* 5. Next Steps Links */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-shield-cardBorder/60">
        <Link
          to="/how-it-works"
          className="inline-flex items-center gap-2 text-sm font-semibold text-shield-cyan hover:text-white transition-colors"
        >
          <span>See How the Game Works</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
        <Link
          to="/guardians"
          className="inline-flex items-center gap-2 text-sm font-semibold text-shield-cyan hover:text-white transition-colors"
        >
          <span>Meet the Six Guardians</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
};
