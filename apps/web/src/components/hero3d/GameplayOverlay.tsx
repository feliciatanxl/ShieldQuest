import React, { useEffect, useState } from 'react';
import { Pause, Play, RotateCcw, Sparkles, Target, Waves } from 'lucide-react';
import type { Phase } from './timeline';

interface GameplayOverlayProps {
  phase: Phase;
  playing: boolean;
  onTogglePlay: () => void;
  onReplay: () => void;
}

const OBJECTIVES: Record<Phase, string> = {
  explore: 'Explore the Retail District',
  discover: 'Investigate the Mini Mart',
  npc: 'Talk to Jun',
  decide: 'Think · Vote · Explain',
  ripple: 'See what happens next',
  reset: 'Explore the Retail District',
};

const CHOICES = ['Help as a lookout', 'Refuse and keep a safe distance', 'Confront the friend publicly'];

const glass = 'bg-[#0B132B]/75 border border-white/10 backdrop-blur-md';
const hudText = 'text-[10px] font-mono uppercase tracking-wider';

/** Cycles a "weighing it up" cursor across all options so none reads as the right answer. */
function useThinkingCursor(active: boolean, playing: boolean) {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (!active) return setI(0);
    if (!playing) return;
    const id = window.setInterval(() => setI((v) => (v + 1) % CHOICES.length), 1100);
    return () => window.clearInterval(id);
  }, [active, playing]);
  return i;
}

/** Narrative-game HUD: corner status, lower-third dialogue and discreet choices. */
export const GameplayOverlay: React.FC<GameplayOverlayProps> = ({ phase, playing, onTogglePlay, onReplay }) => {
  const talking = phase === 'npc' || phase === 'decide';
  const cursor = useThinkingCursor(phase === 'decide', playing);

  return (
    <div className="absolute inset-0 pointer-events-none select-none text-white">
      {/* Top-left: location + objective */}
      <div className="absolute top-3 left-3 sm:top-4 sm:left-4 flex flex-col items-start gap-1.5">
        <span className={`rounded-lg px-2.5 py-1 ${glass} ${hudText} font-bold text-[#F2B94B]`}>Retail District</span>
        <div key={phase} className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 animate-fadeIn ${glass}`}>
          <Target className="w-3 h-3 text-[#38D9E6]" />
          <span className="text-[11px] font-medium text-white/90">{OBJECTIVES[phase]}</span>
        </div>
      </div>

      {/* Top-right: squad + honesty label */}
      <div className="absolute top-3 right-3 sm:top-4 sm:right-4 flex flex-col items-end gap-1.5">
        <div className={`flex items-center gap-2 rounded-lg px-2.5 py-1 ${glass}`}>
          <div className="flex -space-x-1" aria-hidden="true">
            {['#2563EB', '#F97316', '#8B5CF6', '#10B981'].map((c) => (
              <span key={c} className="h-3 w-3 rounded-full border border-[#0B132B]" style={{ backgroundColor: c }} />
            ))}
            <span className="h-3 w-3 rounded-full border border-dashed border-white/40" />
          </div>
          <span className={`${hudText} text-white/85`}>Squad 4/5 · Concept</span>
        </div>
        <span className={`rounded-md px-2 py-0.5 ${glass} ${hudText} text-white/65`}>3D Gameplay Concept Preview</span>
      </div>

      {/* Discovery toast */}
      {phase === 'discover' && (
        <div className={`absolute top-[4.5rem] inset-x-0 mx-auto w-fit flex items-center gap-2 rounded-full px-3 py-1.5 animate-fadeIn ${glass} border-[#38D9E6]/40`}>
          <Sparkles className="w-3.5 h-3.5 text-[#38D9E6]" />
          <span className="text-[11px] font-semibold whitespace-nowrap">New observation discovered</span>
        </div>
      )}

      {/* Discreet choices sit just above the dialogue bar, leaving the scene visible */}
      {phase === 'decide' && (
        <ol className="absolute left-3 sm:left-4 bottom-[4.6rem] flex flex-col items-start gap-1 animate-fadeIn">
          {CHOICES.map((c, i) => (
            <li
              key={c}
              className={`flex items-center gap-2 rounded-md px-2 py-1 text-[11px] transition-all duration-300 ${glass} ${
                i === cursor ? 'border-[#38D9E6]/60 text-white translate-x-1' : 'text-white/70'
              }`}
            >
              <span className={`grid place-items-center h-4 w-4 rounded text-[9px] font-bold ${i === cursor ? 'bg-[#38D9E6] text-[#0B132B]' : 'bg-white/10'}`}>
                {i + 1}
              </span>
              {c}
            </li>
          ))}
        </ol>
      )}

      {/* Lower-third dialogue */}
      {talking && (
        <div className={`absolute left-3 right-14 sm:left-4 sm:right-16 bottom-3 sm:bottom-4 rounded-xl px-3.5 py-2 animate-fadeIn ${glass}`}>
          <p className={`${hudText} font-bold text-[#F97316]`}>
            Jun <span className="text-white/50">— Friend</span>
          </p>
          <p className="text-[13px] font-medium leading-snug">“Can you watch the door for me?”</p>
        </div>
      )}

      {/* Ripple cue */}
      {phase === 'ripple' && (
        <div className={`absolute bottom-3 sm:bottom-4 inset-x-0 mx-auto w-fit flex items-center gap-2 rounded-full px-3.5 py-1.5 animate-fadeIn ${glass} border-[#A78BFA]/40`}>
          <Waves className="w-3.5 h-3.5 text-[#A78BFA]" />
          <span className={`${hudText} text-white/90`}>Ripple Effect · your choice echoes later</span>
        </div>
      )}

      {/* Controls */}
      <div className={`pointer-events-auto absolute bottom-3 right-3 sm:bottom-4 sm:right-4 flex flex-col rounded-xl ${glass}`}>
        <button
          type="button"
          onClick={onTogglePlay}
          className="p-2 rounded-t-xl hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-shield-cyan"
          aria-label={playing ? 'Pause gameplay preview' : 'Play gameplay preview'}
        >
          {playing ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
        </button>
        <button
          type="button"
          onClick={onReplay}
          className="p-2 rounded-b-xl border-t border-white/10 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-shield-cyan"
          aria-label="Replay gameplay preview"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
