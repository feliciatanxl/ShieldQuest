import React, { useState } from 'react';
import {
  Clock,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  ShieldCheck,
  MessageSquare,
  Sparkles,
  Info,
  ArrowRight,
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
    <section className="py-16 md:py-24 relative overflow-hidden" aria-labelledby="consequence-heading">
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-shield-blue/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-shield-navy border border-shield-cardBorder text-xs font-semibold text-shield-cyan mb-4">
            <Clock className="w-3.5 h-3.5" />
            <span>Delayed Consequence Engine</span>
          </div>
          <h2 id="consequence-heading" className="text-3xl sm:text-4xl lg:text-5xl font-heading font-extrabold text-white tracking-tight mb-4">
            Some consequences don't appear immediately.
          </h2>
          <p className="text-base sm:text-lg text-shield-muted leading-relaxed">
            In high-pressure situations, quick choices often bring fast relief or instant validation—while the true
            fallout quietly unfolds hours or days later. Test the difference below.
          </p>
        </div>

        {/* Illustrative Simulation Frame */}
        <div className="game-panel p-6 sm:p-8 lg:p-10 border border-shield-cyan/20">
          {/* Teaser Header Banner */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-6 border-b border-shield-cardBorder/60 mb-6">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-400 animate-pulse" />
              <span className="text-xs font-semibold uppercase tracking-wider text-shield-cream/90">
                Interactive Preview Scenario
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-shield-gold bg-shield-navy/90 px-3 py-1 rounded-md border border-shield-cardBorder">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{scenario.urgencyWarning}</span>
            </div>
          </div>

          {/* Incoming Simulated Message */}
          <div className="mb-8">
            <div className="flex items-center gap-2 text-xs text-shield-muted mb-2">
              <MessageSquare className="w-3.5 h-3.5 text-shield-cyan" />
              <span>Incoming Direct Message from: <strong className="text-white">{scenario.sender}</strong></span>
            </div>

            <div className="p-4 sm:p-5 rounded-xl bg-shield-navy/90 border border-shield-cardBorder/80 text-sm sm:text-base leading-relaxed text-shield-cream font-mono">
              <p>{scenario.incomingMessage}</p>
            </div>
          </div>

          {/* Interactive Choice Buttons */}
          <div className="mb-8">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-shield-muted mb-4">
              Step 1: What would you choose?
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4" role="radiogroup" aria-label="Decision choices">
              {scenario.choices.map((choice, index) => {
                const isSelected = selectedChoiceId === choice.id;
                return (
                  <button
                    key={choice.id}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    onClick={() => handleSelect(choice.id)}
                    className={`text-left p-5 rounded-xl border transition-all duration-200 flex flex-col justify-between group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-shield-cyan ${
                      isSelected
                        ? 'bg-shield-slate border-shield-cyan shadow-glow-cyan'
                        : 'bg-shield-navy/50 border-shield-cardBorder hover:border-shield-blue/60 hover:bg-shield-navy/80'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-shield-muted group-hover:text-shield-cyan transition-colors">
                          Option {index === 0 ? 'A' : 'B'}
                        </span>
                        <div
                          className={`w-5 h-5 rounded-full border flex items-center justify-center text-xs ${
                            isSelected
                              ? 'border-shield-cyan bg-shield-cyan text-shield-dark font-bold'
                              : 'border-shield-cardBorder'
                          }`}
                        >
                          {isSelected ? '✓' : ''}
                        </div>
                      </div>
                      <p className="text-sm sm:text-base font-medium text-shield-cream leading-snug">
                        {choice.text}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-shield-cardBorder/40 flex items-center text-xs text-shield-muted group-hover:text-shield-cream transition-colors">
                      <span>Click to preview timeline</span>
                      <ArrowRight className="w-3.5 h-3.5 ml-1 transition-transform group-hover:translate-x-1" />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Outcome Timeline Reveal */}
          {selectedChoice ? (
            <div className="space-y-6 pt-6 border-t border-shield-cardBorder/60 animate-fadeIn" role="region" aria-live="polite">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-heading font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-shield-gold" />
                  <span>Timeline Simulation Result</span>
                </h3>

                <button
                  type="button"
                  onClick={handleReset}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-shield-navy hover:bg-shield-slate border border-shield-cardBorder text-xs text-shield-muted hover:text-white transition-colors focus-visible:ring-2 focus-visible:ring-shield-cyan"
                  aria-label="Reset Decision"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Decision</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Immediate Consequence */}
                <div className="p-5 rounded-xl bg-shield-navy/60 border border-shield-cardBorder">
                  <div className="flex items-center gap-2 mb-3">
                    <Clock className="w-4 h-4 text-shield-blue" />
                    <span className="text-xs font-bold uppercase tracking-wider text-shield-muted">
                      Immediate Outcome (0 – 5 mins)
                    </span>
                  </div>
                  <p className="text-sm sm:text-base text-shield-cream leading-relaxed">
                    {selectedChoice.immediateConsequence}
                  </p>
                </div>

                {/* Delayed Consequence */}
                <div
                  className={`p-5 rounded-xl border ${
                    selectedChoice.delayedType === 'danger'
                      ? 'bg-red-950/20 border-red-500/40'
                      : 'bg-emerald-950/20 border-emerald-500/40'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-3">
                    {selectedChoice.delayedType === 'danger' ? (
                      <AlertTriangle className="w-4 h-4 text-red-400" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    )}
                    <span
                      className={`text-xs font-bold uppercase tracking-wider ${
                        selectedChoice.delayedType === 'danger' ? 'text-red-400' : 'text-emerald-400'
                      }`}
                    >
                      Delayed Fallout (2 hours – 24 hours later)
                    </span>
                  </div>
                  <p className="text-sm sm:text-base text-shield-cream leading-relaxed">
                    {selectedChoice.delayedConsequence}
                  </p>
                </div>
              </div>

              {/* Learning Takeaway & Guardian Insight */}
              <div className="p-5 rounded-xl bg-shield-slate/60 border border-shield-cardBorder/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-xs font-semibold uppercase tracking-wider text-shield-cyan">
                    Key Behavioural Insight
                  </span>
                  <p className="text-sm text-shield-cream">{selectedChoice.learningTakeaway}</p>
                </div>
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-shield-navy border border-shield-cardBorder text-xs text-shield-gold flex-shrink-0">
                  <ShieldCheck className="w-4 h-4 text-shield-gold" />
                  <span>
                    Guardian Advice: <strong>{selectedChoice.guardianInsight.guardian}</strong>
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-6 rounded-xl bg-shield-navy/30 border border-dashed border-shield-cardBorder/60 text-center text-sm text-shield-muted">
              <p>Select Option A or Option B above to observe how immediate outcomes differ from delayed consequences.</p>
            </div>
          )}

          {/* Educational notice */}
          <div className="mt-6 pt-4 border-t border-shield-cardBorder/40 flex items-center gap-2 text-xs text-shield-muted">
            <Info className="w-3.5 h-3.5 flex-shrink-0 text-shield-cyan" />
            <span>
              This interactive preview illustrates the core educational mechanic. In the upcoming full game, decisions
              alter district trust meters, branch storylines, and trigger delayed squad alerts.
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
