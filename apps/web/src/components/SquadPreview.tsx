import React, { useState } from 'react';
import { Users2, Shield, EyeOff, MessageSquare, Sparkles } from 'lucide-react';

export const SquadPreview: React.FC = () => {
  const [activeStep, setActiveStep] = useState<number>(1);

  const steps = [
    {
      step: 1,
      title: 'Think (Private Review)',
      icon: <EyeOff className="w-5 h-5 text-shield-cyan" />,
      desc: 'Each squad member examines ambiguous clues individually. Votes are cast secretly to prevent peer bandwagoning.',
    },
    {
      step: 2,
      title: 'Vote (Anonymous Aggregate)',
      icon: <Shield className="w-5 h-5 text-shield-gold" />,
      desc: 'The game reveals the aggregate distribution without exposing who voted for what, preserving safety and psychological trust.',
    },
    {
      step: 3,
      title: 'Explain (Squad Deliberation)',
      icon: <MessageSquare className="w-5 h-5 text-shield-violet" />,
      desc: 'Squad mates discuss differing viewpoints, spot hidden manipulation levers together, and reach a consensus on a safer path.',
    },
  ];

  return (
    <div className="game-panel p-8 sm:p-10 border border-shield-cardBorder relative overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Column: Core Narrative */}
        <div className="lg:col-span-6 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-shield-navy border border-shield-cardBorder text-xs font-semibold text-shield-gold">
            <Users2 className="w-3.5 h-3.5" />
            <span>Peer Shield Mode Preview</span>
          </div>

          <h3 className="text-3xl sm:text-4xl font-heading font-extrabold text-white tracking-tight">
            Better choices. Stronger together.
          </h3>

          <p className="text-base text-shield-cream/90 leading-relaxed">
            Real peer pressure doesn’t happen in isolation—and neither should safety. ShieldQuest introduces
            collaborative squad mechanics where friends practise protecting one another from risky traps before they happen.
          </p>

          <p className="text-sm text-shield-muted leading-relaxed">
            Through the <strong className="text-shield-cyan font-semibold">Think–Vote–Explain</strong> ritual, squads
            break through the fear of speaking up, normalising hesitation when something feels suspicious and equipping
            youths with calm, non-confrontational refusal scripts.
          </p>
        </div>

        {/* Right Column: Interactive 3-Step Mechanics Walkthrough */}
        <div className="lg:col-span-6 space-y-3">
          {steps.map((s) => {
            const isActive = activeStep === s.step;
            return (
              <div
                key={s.step}
                onClick={() => setActiveStep(s.step)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    setActiveStep(s.step);
                  }
                }}
                tabIndex={0}
                role="button"
                aria-pressed={isActive}
                className={`p-5 rounded-2xl border transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-shield-cyan ${
                  isActive
                    ? 'bg-shield-slate border-shield-cyan shadow-glow-cyan'
                    : 'bg-shield-navy/60 border-shield-cardBorder hover:bg-shield-navy'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-shield-navy border border-shield-cardBorder flex-shrink-0">
                    {s.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-mono font-bold text-shield-cyan uppercase">
                        Phase 0{s.step}
                      </span>
                      <h4 className="text-base font-heading font-bold text-white">{s.title}</h4>
                    </div>
                    <p className="text-xs sm:text-sm text-shield-muted leading-relaxed">{s.desc}</p>
                  </div>
                </div>
              </div>
            );
          })}

          <div className="pt-2 text-center">
            <span className="inline-flex items-center gap-1.5 text-xs text-shield-gold bg-shield-navy/70 px-3 py-1 rounded-md border border-shield-cardBorder">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Designed for classrooms, student clubs, and youth mentoring groups</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
