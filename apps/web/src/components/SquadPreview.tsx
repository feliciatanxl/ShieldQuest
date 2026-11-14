import React, { useState } from 'react';
import { Users2, Shield, EyeOff, MessageSquare, Sparkles, UserCheck } from 'lucide-react';

export const SquadPreview: React.FC = () => {
  const [activeStep, setActiveStep] = useState<number>(1);

  const steps = [
    {
      step: 1,
      title: 'Think (Private Evidence Review)',
      icon: <EyeOff className="w-5 h-5 text-shield-cyan" />,
      desc: 'Each squad member examines ambiguous clues individually. Votes are cast secretly on personal screens to prevent bandwagoning and social coercion.',
    },
    {
      step: 2,
      title: 'Vote (Anonymous Aggregate Tally)',
      icon: <Shield className="w-5 h-5 text-shield-gold" />,
      desc: 'The room displays the aggregated squad distribution without exposing individual identities, protecting members from peer embarrassment.',
    },
    {
      step: 3,
      title: 'Explain (Squad Deliberation)',
      icon: <MessageSquare className="w-5 h-5 text-shield-violet" />,
      desc: 'Teammates deliberate why red flags were noticed, break down manipulation tricks, and agree on a unified, safe response to protect peers.',
    },
  ];

  return (
    <div className="game-panel p-8 sm:p-12 border border-shield-cyan/30 relative overflow-hidden shadow-2xl">
      {/* Decorative Background Glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-purple-500/10 via-blue-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center relative z-10">
        {/* Left Column: Conceptual Narrative */}
        <div className="lg:col-span-6 space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-shield-navy/90 border border-shield-cardBorder text-xs font-semibold text-shield-gold shadow-sm">
            <Users2 className="w-3.5 h-3.5 text-shield-gold animate-pulse" />
            <span>Squad Mode // Peer Shield Protocol</span>
          </div>

          <h3 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-black text-shield-cream tracking-tight leading-tight">
            Better choices. <span className="bg-gradient-to-r from-shield-gold via-shield-cyan to-shield-blue bg-clip-text text-transparent">Stronger together.</span>
          </h3>

          <p className="text-base text-shield-cream/90 leading-relaxed">
            Real peer pressure doesn’t strike in a vacuum—and self-defence shouldn't either. ShieldQuest introduces
            collaborative squad mechanics where friends practise protecting one another before lines are crossed.
          </p>

          <p className="text-sm text-shield-muted leading-relaxed">
            Through the <strong className="text-shield-cyan font-semibold">Think–Vote–Explain</strong> ritual, squads
            break through the silence and fear of looking uncool, normalising pauses when something feels suspicious and
            equipping youths with graceful refusal scripts.
          </p>

          {/* Peer Shield Action Badge */}
          <div className="p-4 rounded-xl bg-shield-void/80 border border-shield-cardBorder/80 flex items-center gap-3">
            <UserCheck className="w-5 h-5 text-shield-cyan flex-shrink-0" />
            <p className="text-xs text-shield-cream/90">
              <strong className="text-shield-cream">Peer Shield Bystander Principle:</strong> Standing up for a friend means
              providing a supportive exit when social pressure starts building.
            </p>
          </div>
        </div>

        {/* Right Column: Interactive 3-Stage Deliberation Display */}
        <div className="lg:col-span-6 space-y-4">
          {/* Simulated Squad Deliberation Scene HUD */}
          <div className="p-4 rounded-2xl bg-shield-void/90 border border-shield-cardBorder/90 mb-2">
            <div className="flex items-center justify-between text-xs text-shield-muted pb-2 mb-3 border-b border-shield-cardBorder/60">
              <span className="font-mono text-[11px] text-shield-cyan">SIMULATED SQUAD SESSION // 4 PLAYERS</span>
              <span className="text-[10px] font-mono text-shield-gold bg-shield-navy px-2 py-0.5 rounded border border-shield-cardBorder">
                ANONYMOUS BALLOT
              </span>
            </div>

            {/* Simulated Vote Distribution Bar */}
            <div className="space-y-1.5 mb-3">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-shield-cyan">Pause & Verify (Option B)</span>
                <span className="text-shield-gold">75% (3 votes)</span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-shield-navy overflow-hidden flex">
                <div className="h-full bg-shield-cyan w-3/4 rounded-full" />
                <div className="h-full bg-rose-500 w-1/4" />
              </div>
            </div>

            <p className="text-[11px] text-shield-cream/80 italic">
              "Wait, did you see the domain name? It ended in .test! That's not the real tournament server."
            </p>
          </div>

          {/* Stepper Tabs */}
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
                className={`p-5 rounded-2xl border transition-all duration-300 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-shield-cyan ${
                  isActive
                    ? 'bg-gradient-to-r from-shield-surface to-shield-navy border-shield-cyan shadow-glow-cyan'
                    : 'bg-shield-navy/60 border-shield-cardBorder hover:bg-shield-navy'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-2xl bg-shield-void border border-shield-cardBorder flex-shrink-0 shadow-sm">
                    {s.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-mono font-bold text-shield-cyan uppercase">
                        Phase 0{s.step}
                      </span>
                      <h4 className="text-base font-heading font-bold text-shield-cream">{s.title}</h4>
                    </div>
                    <p className="text-xs sm:text-sm text-shield-muted leading-relaxed">{s.desc}</p>
                  </div>
                </div>
              </div>
            );
          })}

          <div className="pt-2 text-center">
            <span className="inline-flex items-center gap-1.5 text-xs text-shield-gold bg-shield-void px-3.5 py-1.5 rounded-full border border-shield-cardBorder shadow-sm">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Designed for classrooms, student groups, and youth mentorship</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
