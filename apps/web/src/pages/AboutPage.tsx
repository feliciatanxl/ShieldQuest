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
      <div className="max-w-3xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-shield-navy border border-shield-cardBorder text-xs font-semibold text-shield-cyan mb-4">
          <Shield className="w-3.5 h-3.5" />
          <span>About the Initiative</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-heading font-black text-white tracking-tight mb-6">
          Empowering Youths to Make Safer Choices Together
        </h1>
        <p className="text-lg text-shield-cream/90 leading-relaxed">
          ShieldQuest is an interactive, scenario-driven crime-prevention adventure game created by{' '}
          <strong className="text-white">Team SecurePi</strong> at{' '}
          <strong className="text-white">Nanyang Polytechnic, Singapore</strong>.
        </p>
      </div>

      {/* 2. The Core Problem */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center" aria-labelledby="problem-heading">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-shield-navy border border-shield-cardBorder text-xs font-semibold text-shield-gold">
            <Target className="w-3.5 h-3.5" />
            <span>The Education Gap</span>
          </div>
          <h2 id="problem-heading" className="text-3xl font-heading font-extrabold text-white tracking-tight">
            Why Passive Awareness Isn't Enough
          </h2>
          <p className="text-sm sm:text-base text-shield-cream/90 leading-relaxed">
            Young people are digitally fluent, yet modern scams and criminal exploitation rarely rely on lack of
            technical know-how alone. Instead, perpetrators weaponise psychological levers:
          </p>

          <ul className="space-y-3 text-sm text-shield-muted">
            <li className="flex items-start gap-3">
              <span className="w-5 h-5 rounded-full bg-shield-slate border border-shield-cardBorder flex items-center justify-center font-bold text-shield-cyan text-xs flex-shrink-0 mt-0.5">
                1
              </span>
              <span>
                <strong className="text-white">Manufactured Urgency:</strong> Countdown timers, fake deadlines, and panic
                coerce instant reflex reactions before critical evaluation can take place.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-5 h-5 rounded-full bg-shield-slate border border-shield-cardBorder flex items-center justify-center font-bold text-shield-cyan text-xs flex-shrink-0 mt-0.5">
                2
              </span>
              <span>
                <strong className="text-white">Peer Dynamics & Dares:</strong> Risky dilemmas frequently arrive through
                classmates, gaming groups, or friends, where saying "no" feels socially awkward or disloyal.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-5 h-5 rounded-full bg-shield-slate border border-shield-cardBorder flex items-center justify-center font-bold text-shield-cyan text-xs flex-shrink-0 mt-0.5">
                3
              </span>
              <span>
                <strong className="text-white">Delayed Visibility:</strong> Harmful decisions often yield immediate perks
                (fast pocket money or group praise), while the severe fallout surfaces days later.
              </span>
            </li>
          </ul>
        </div>

        <div className="game-panel p-8 sm:p-10 border border-shield-blue/30 space-y-6">
          <h3 className="text-xl font-heading font-bold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-shield-cyan" />
            <span>Our Pedagogical Approach</span>
          </h3>
          <p className="text-sm text-shield-cream leading-relaxed">
            Rather than teaching rigid rules that quickly become outdated as tactics evolve, ShieldQuest provides a
            safe simulation sandbox where players experience the consequences of their choices first-hand.
          </p>
          <div className="p-4 rounded-xl bg-shield-navy border-l-4 border-shield-gold text-sm text-shield-cream italic">
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
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-shield-navy border border-shield-cardBorder text-xs font-semibold text-shield-cyan mb-3">
            <Award className="w-3.5 h-3.5" />
            <span>Core Competency Model</span>
          </div>
          <h2 id="framework-heading" className="text-3xl font-heading font-extrabold text-white tracking-tight mb-2">
            The S.H.I.E.L.D. Framework
          </h2>
          <p className="text-sm sm:text-base text-shield-muted">
            The heart of our educational design: a structured six-step mental model that youths can apply whenever
            encountering high-pressure dilemmas online or offline.
          </p>
        </div>

        {/* Framework Interactive Accordion/Tabs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {SHIELD_FRAMEWORK.map((step) => {
            const isSelected = activeFrameworkStep === step.letter;
            return (
              <div
                key={step.letter}
                onClick={() => setActiveFrameworkStep(step.letter)}
                className={`game-panel p-6 border transition-all duration-300 cursor-pointer ${
                  isSelected
                    ? 'border-shield-cyan bg-shield-slate/90 shadow-glow-cyan'
                    : 'border-shield-cardBorder hover:border-shield-cardBorder/90'
                }`}
                tabIndex={0}
                role="button"
                aria-pressed={isSelected}
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="w-10 h-10 rounded-xl bg-shield-navy border border-shield-cardBorder flex items-center justify-center font-heading font-black text-xl text-shield-cyan">
                    {step.letter}
                  </span>
                  <span className="text-xs text-shield-muted font-mono">
                    Step 0{SHIELD_FRAMEWORK.indexOf(step) + 1}
                  </span>
                </div>

                <h3 className="text-xl font-heading font-bold text-white mb-1">{step.title}</h3>
                <p className="text-xs font-semibold text-shield-gold mb-3">{step.headline}</p>

                <p className="text-xs sm:text-sm text-shield-cream/90 leading-relaxed mb-4">
                  {step.description}
                </p>

                <div className="pt-3 border-t border-shield-cardBorder/50 space-y-2">
                  <div className="text-[11px] text-shield-muted">
                    <strong className="text-shield-cream">Real-world scenario:</strong> {step.example}
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

      {/* 4. Independent Project Notice */}
      <section className="p-6 sm:p-8 rounded-2xl bg-shield-navy/60 border border-shield-cardBorder/70 flex flex-col sm:flex-row items-start gap-4">
        <AlertCircle className="w-6 h-6 text-shield-gold flex-shrink-0 mt-1" />
        <div className="space-y-2 text-sm text-shield-muted leading-relaxed">
          <h3 className="text-base font-heading font-bold text-white">Project Scope & Disclaimer</h3>
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
      <div className="flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-shield-cardBorder/50">
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
