import React, { useState } from 'react';
import {
  Clock,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Info,
  ArrowRight,
  Smartphone,
  AlertCircle,
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
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[450px] bg-gradient-to-r from-shield-blue/15 via-shield-cyan/10 to-shield-violet/15 rounded-full blur-[160px] pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-shield-navy/90 border border-shield-cardBorder text-xs font-semibold text-shield-cyan shadow-sm mb-4">
            <Clock className="w-3.5 h-3.5 text-shield-cyan animate-pulse" />
            <span>Delayed Consequence Engine</span>
          </div>
          <h2 id="consequence-heading" className="text-3xl sm:text-4xl lg:text-5xl font-heading font-black text-white tracking-tight mb-4">
            Some consequences don't appear immediately.
          </h2>
          <p className="text-base sm:text-lg text-shield-cream/90 leading-relaxed">
            In high-pressure situations, quick choices often bring fast relief or instant validation—while the true
            fallout quietly unfolds hours or days later. Test the difference below.
          </p>
        </div>

        {/* Visual Story Sequence Container */}
        <div className="game-panel p-6 sm:p-8 lg:p-10 border border-shield-cyan/30 shadow-2xl">
          {/* Header Banner */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-6 border-b border-shield-cardBorder/70 mb-8">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-shield-cream">
                Interactive Preview Scenario // Case #042
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-shield-gold bg-shield-void px-3 py-1 rounded-md border border-shield-cardBorder">
              <Sparkles className="w-3.5 h-3.5 text-shield-gold" />
              <span>{scenario.urgencyWarning}</span>
            </div>
          </div>

          {/* Simulated Communicator Device (The Incoming Dilemma) */}
          <div className="max-w-3xl mx-auto mb-10">
            <div className="rounded-2xl bg-gradient-to-b from-[#131E38] to-[#0A1021] border border-shield-cardBorder/90 p-5 sm:p-6 shadow-xl relative overflow-hidden">
              {/* Tactical Top Bar */}
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-shield-cardBorder/60 text-xs text-shield-muted">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-shield-cyan" />
                  <span className="font-mono text-[11px] text-shield-cream">
                    INCOMING MESSAGE // <strong className="text-white">{scenario.sender}</strong>
                  </span>
                </div>
                <span className="text-[10px] font-mono text-rose-400 bg-rose-950/40 px-2 py-0.5 rounded border border-rose-500/30">
                  URGENT NOTIFICATION
                </span>
              </div>

              {/* Message Transcript */}
              <div className="p-4 sm:p-5 rounded-xl bg-shield-void/85 border border-shield-cardBorder/80 font-mono text-sm sm:text-base leading-relaxed text-shield-cream">
                <p>{scenario.incomingMessage}</p>
              </div>
            </div>
          </div>

          {/* Interactive Choice Selector */}
          <div className="mb-10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-shield-cyan flex items-center gap-2">
                <span>Step 1: What would you choose?</span>
              </h3>
              <span className="text-xs text-shield-muted hidden sm:inline">
                Click an option to simulate the timeline
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6" role="radiogroup" aria-label="Decision choices">
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
                    className={`text-left p-6 rounded-2xl border transition-all duration-300 flex flex-col justify-between group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-shield-cyan relative overflow-hidden ${
                      isSelected
                        ? isOptionA
                          ? 'bg-rose-950/20 border-rose-500/60 shadow-lg shadow-rose-900/20 ring-1 ring-rose-400'
                          : 'bg-emerald-950/20 border-emerald-500/60 shadow-lg shadow-emerald-900/20 ring-1 ring-emerald-400'
                        : 'bg-shield-navy/60 border-shield-cardBorder hover:border-shield-cyan/50 hover:bg-shield-navy/90'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span
                          className={`text-xs font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded border ${
                            isSelected
                              ? isOptionA
                                ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                                : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                              : 'bg-shield-void text-shield-muted border-shield-cardBorder'
                          }`}
                        >
                          Option {isOptionA ? 'A' : 'B'}
                        </span>

                        <div
                          className={`w-6 h-6 rounded-full border flex items-center justify-center text-xs font-bold transition-all ${
                            isSelected
                              ? isOptionA
                                ? 'border-rose-400 bg-rose-500 text-white'
                                : 'border-emerald-400 bg-emerald-500 text-white'
                              : 'border-shield-cardBorder text-transparent group-hover:border-shield-cyan'
                          }`}
                        >
                          ✓
                        </div>
                      </div>

                      <p className="text-sm sm:text-base font-semibold text-white leading-snug">
                        {choice.text}
                      </p>
                    </div>

                    <div className="mt-5 pt-3 border-t border-shield-cardBorder/40 flex items-center justify-between text-xs text-shield-muted group-hover:text-shield-cyan transition-colors">
                      <span className="font-mono text-[11px]">
                        {isOptionA ? 'Rushed Decision Path' : 'Defensive Verification Path'}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Outcome Timeline Progression (Horizontal on Desktop, Vertical on Mobile) */}
          {selectedChoice ? (
            <div className="space-y-6 pt-6 border-t border-shield-cardBorder/70 animate-fadeIn" role="region" aria-live="polite">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-shield-navy border border-shield-cardBorder text-shield-gold">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-lg font-heading font-black text-white">
                      Timeline Simulation Result
                    </h3>
                    <p className="text-xs text-shield-muted font-mono">
                      Observe how immediate sensation diverges from delayed reality
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleReset}
                  className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-shield-navy hover:bg-shield-slate border border-shield-cardBorder text-xs font-semibold text-shield-cream hover:text-white transition-colors focus-visible:ring-2 focus-visible:ring-shield-cyan shadow-sm"
                  aria-label="Reset Decision"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-shield-cyan" />
                  <span>Reset Decision</span>
                </button>
              </div>

              {/* The Timeline Cards (Horizontal flow on desktop) */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 relative">
                {/* Immediate Outcome Card */}
                <div className="game-panel p-6 border-shield-blue/30 relative overflow-hidden">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-shield-blue" />
                      <span className="text-xs font-mono font-bold uppercase tracking-wider text-shield-cyan">
                        Immediate Outcome (0 – 5 mins)
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-shield-muted bg-shield-void px-2 py-0.5 rounded border border-shield-cardBorder">
                      Instant Feedback
                    </span>
                  </div>
                  <p className="text-sm sm:text-base text-shield-cream/90 leading-relaxed">
                    {selectedChoice.immediateConsequence}
                  </p>
                </div>

                {/* Delayed Outcome Card */}
                <div
                  className={`game-panel p-6 relative overflow-hidden ${
                    selectedChoice.delayedType === 'danger'
                      ? 'bg-gradient-to-br from-rose-950/30 to-shield-navy border-rose-500/50'
                      : 'bg-gradient-to-br from-emerald-950/30 to-shield-navy border-emerald-500/50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      {selectedChoice.delayedType === 'danger' ? (
                        <AlertTriangle className="w-4 h-4 text-rose-400" />
                      ) : (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      )}
                      <span
                        className={`text-xs font-mono font-bold uppercase tracking-wider ${
                          selectedChoice.delayedType === 'danger' ? 'text-rose-400' : 'text-emerald-400'
                        }`}
                      >
                        Delayed Fallout (2 hours – 24 hours later)
                      </span>
                    </div>
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                        selectedChoice.delayedType === 'danger'
                          ? 'bg-rose-950 text-rose-400 border-rose-500/40'
                          : 'bg-emerald-950 text-emerald-400 border-emerald-500/40'
                      }`}
                    >
                      Second-Order State
                    </span>
                  </div>
                  <p className="text-sm sm:text-base text-shield-cream leading-relaxed">
                    {selectedChoice.delayedConsequence}
                  </p>
                </div>
              </div>

              {/* Learning Insight & Guardian Advice Bar */}
              <div className="p-5 sm:p-6 rounded-2xl bg-shield-surface/80 border border-shield-cardBorder/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-shield-cyan flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>Key Behavioural Insight</span>
                  </span>
                  <p className="text-xs sm:text-sm text-shield-cream/90 leading-relaxed">
                    {selectedChoice.learningTakeaway}
                  </p>
                </div>

                <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-shield-navy border border-shield-cardBorder text-xs text-shield-gold flex-shrink-0 shadow-sm">
                  <ShieldCheck className="w-4 h-4 text-shield-gold" />
                  <span>
                    Guardian Insight: <strong>{selectedChoice.guardianInsight.guardian}</strong>
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 rounded-2xl bg-shield-void/60 border border-dashed border-shield-cardBorder text-center text-sm text-shield-muted">
              <Sparkles className="w-5 h-5 text-shield-cyan/50 mx-auto mb-2" />
              <p>Select Option A or Option B above to observe how immediate outcomes differ from delayed consequences.</p>
            </div>
          )}

          {/* Educational Scope Notice */}
          <div className="mt-8 pt-4 border-t border-shield-cardBorder/50 flex items-center gap-2 text-xs text-shield-muted">
            <Info className="w-3.5 h-3.5 flex-shrink-0 text-shield-cyan" />
            <span>
              Illustrative preview of the Delayed Consequence Engine. In the upcoming full game, decisions
              alter district trust meters, branch storylines, and trigger delayed squad alerts.
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
