import React, { useState } from 'react';
import {
  Clock,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Smartphone,
  ShieldCheck,
} from 'lucide-react';
import { TEASER_SCENARIOS, TeaserChoice } from '@shieldquest/shared';

export const ConsequenceTeaser: React.FC = () => {
  const scenario = TEASER_SCENARIOS[0];
  const [selectedChoiceId, setSelectedChoiceId] = useState<string | null>(null);

  const selectedChoice: TeaserChoice | undefined = scenario.choices.find(
    (c) => c.id === selectedChoiceId
  );

  const handleSelect = (id: string) => {
    setSelectedChoiceId(id);
  };

  const handleReset = () => {
    setSelectedChoiceId(null);
  };

  return (
    <section className="py-12 md:py-20 relative overflow-hidden" aria-labelledby="consequence-heading">
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-r from-shield-blue/15 via-shield-cyan/10 to-transparent rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-shield-navy border border-shield-cardBorder text-xs font-semibold text-shield-cyan mb-3">
            <Clock className="w-3.5 h-3.5" />
            <span>The Ripple Effect · Story Preview</span>
          </div>
          <h2 id="consequence-heading" className="text-3xl sm:text-4xl font-heading font-black text-shield-cream tracking-tight mb-3">
            Every Choice Has a Ripple Effect.
          </h2>
          <p className="text-base sm:text-lg text-shield-cream/90">
            Your choices can affect what happens later.
          </p>
          {/* Story-path motif: one choice, two branches */}
          <svg viewBox="0 0 160 28" className="mx-auto mt-4 h-7 w-40" aria-hidden="true">
            <circle cx="10" cy="14" r="5" fill="#F2B94B" />
            <path d="M15 14 H60 C80 14 80 5 100 5 H145" stroke="#38D9E6" strokeWidth="2" fill="none" strokeDasharray="4 3" />
            <path d="M60 14 C80 14 80 23 100 23 H145" stroke="#7755DF" strokeWidth="2" fill="none" strokeDasharray="4 3" />
            <circle cx="150" cy="5" r="4" fill="#38D9E6" />
            <circle cx="150" cy="23" r="4" fill="#7755DF" />
          </svg>
        </div>

        {/* Visual Dilemma Frame */}
        <div className="game-panel p-6 sm:p-8 lg:p-9 border border-shield-cyan/30 shadow-2xl space-y-8">
          {/* Incoming Message Card */}
          <div className="rounded-2xl bg-gradient-to-b from-shield-card to-shield-dark border border-shield-cardBorder/90 p-5 sm:p-6 shadow-lg">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-shield-cardBorder/60 text-xs text-shield-muted">
              <div className="flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-shield-cyan" />
                <span className="font-mono text-xs text-shield-cream font-medium">
                  Incoming Message from <strong className="text-shield-cream">{scenario.sender}</strong>
                </span>
              </div>
              <span className="text-[11px] font-mono text-rose-400 bg-rose-950/40 px-2 py-0.5 rounded border border-rose-500/30">
                {scenario.urgencyWarning}
              </span>
            </div>

            <p className="font-mono text-sm sm:text-base leading-relaxed text-shield-cream p-3.5 rounded-xl bg-shield-void/80 border border-shield-cardBorder/70">
              "{scenario.incomingMessage}"
            </p>
          </div>

          {/* Interactive Choices */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-shield-cyan">
                What would you choose?
              </span>
              <span className="text-xs text-shield-muted">Select an option to simulate what happens</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4" role="radiogroup" aria-label="Decision choices">
              {scenario.choices.map((choice, index) => {
                const isSelected = selectedChoiceId === choice.id;
                const isOptionA = index === 0;

                return (
                  <button
                    key={choice.id}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    onClick={() => handleSelect(choice.id)}
                    className={`text-left p-5 rounded-2xl border transition-all duration-200 flex flex-col justify-between group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-shield-cyan ${
                      isSelected
                        ? isOptionA
                          ? 'bg-rose-950/25 border-rose-500/60 ring-1 ring-rose-400'
                          : 'bg-emerald-950/25 border-emerald-500/60 ring-1 ring-emerald-400'
                        : 'bg-shield-navy/60 border-shield-cardBorder hover:border-shield-cyan/50 hover:bg-shield-navy/90'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span
                        className={`text-xs font-mono font-bold uppercase px-2 py-0.5 rounded border ${
                          isSelected
                            ? isOptionA
                              ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                              : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                            : 'bg-shield-void text-shield-muted border-shield-cardBorder'
                        }`}
                      >
                        Option {isOptionA ? 'A' : 'B'}
                      </span>
                      <span className={`text-xs font-bold ${isSelected ? 'text-shield-cream' : 'text-transparent'}`}>
                        ✓
                      </span>
                    </div>

                    <p className="text-sm sm:text-base font-semibold text-shield-cream leading-snug">
                      {choice.text}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Outcome Timeline Progression */}
          {selectedChoice ? (
            <div className="space-y-6 pt-6 border-t border-shield-cardBorder/70" role="region" aria-live="polite">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-shield-gold" />
                  <h3 className="text-base sm:text-lg font-heading font-black text-shield-cream">
                    Timeline Simulation Result
                  </h3>
                </div>

                <button
                  type="button"
                  onClick={handleReset}
                  className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-shield-navy hover:bg-shield-slate border border-shield-cardBorder text-xs font-semibold text-shield-cream hover:text-shield-cream transition-colors focus-visible:ring-2 focus-visible:ring-shield-cyan"
                  aria-label="Reset Decision"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-shield-cyan" />
                  <span>Reset Decision</span>
                </button>
              </div>

              {/* Immediate & Delayed Outcome Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Immediate */}
                <div className="game-panel p-5 border-shield-blue/30 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-shield-cyan">
                    <Clock className="w-4 h-4 text-shield-blue" />
                    <span>Immediate Outcome (0 – 5 mins)</span>
                  </div>
                  <p className="text-sm text-shield-cream/90 leading-relaxed">
                    {selectedChoice.immediateConsequence}
                  </p>
                </div>

                {/* Delayed */}
                <div
                  className={`game-panel p-5 space-y-2 ${
                    selectedChoice.delayedType === 'danger'
                      ? 'border-rose-500/50 bg-rose-950/20'
                      : 'border-emerald-500/50 bg-emerald-950/20'
                  }`}
                >
                  <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider">
                    {selectedChoice.delayedType === 'danger' ? (
                      <>
                        <AlertTriangle className="w-4 h-4 text-rose-400" />
                        <span className="text-rose-400">Delayed Fallout (2 hours – 24 hours later)</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span className="text-emerald-400">Delayed Fallout (2 hours – 24 hours later)</span>
                      </>
                    )}
                  </div>
                  <p className="text-sm text-shield-cream leading-relaxed">
                    {selectedChoice.delayedConsequence}
                  </p>
                </div>
              </div>

              {/* Takeaway */}
              <div className="p-4 sm:p-5 rounded-2xl bg-shield-surface/80 border border-shield-cardBorder/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs sm:text-sm">
                <div className="text-shield-cream/90 leading-relaxed">
                  <strong className="text-shield-cream block sm:inline mr-1">Key Takeaway:</strong>
                  {selectedChoice.learningTakeaway}
                </div>
                <div className="flex items-center gap-1.5 text-xs text-shield-gold bg-shield-navy px-3 py-1.5 rounded-xl border border-shield-cardBorder flex-shrink-0">
                  <ShieldCheck className="w-3.5 h-3.5 text-shield-gold" />
                  <span>{selectedChoice.guardianInsight.guardian}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-6 rounded-2xl bg-shield-void/60 border border-dashed border-shield-cardBorder text-center text-xs sm:text-sm text-shield-muted">
              Select Option A or Option B above to observe how immediate outcomes differ from delayed consequences.
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
