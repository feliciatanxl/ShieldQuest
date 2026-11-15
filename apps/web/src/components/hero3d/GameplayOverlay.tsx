import React from 'react';
import { Pause, Play, RotateCcw, Search, Sparkles, Waves } from 'lucide-react';
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
  npc: 'Talk to your friend',
  decide: 'Think · Vote · Explain',
  reset: 'Explore the Retail District',
};

const CHOICES = ['Help as a lookout', 'Refuse and keep a safe distance', 'Confront the friend publicly'];

const panel = 'rounded-xl bg-[#0B132B]/85 border border-white/10 backdrop-blur shadow-lg';
const hudText = 'text-[10px] font-mono uppercase tracking-wider';

/** Minimal game HUD layered over the 3D canvas; content follows the scene timeline. */
export const GameplayOverlay: React.FC<GameplayOverlayProps> = ({ phase, playing, onTogglePlay, onReplay }) => (
  <div className="absolute inset-0 pointer-events-none select-none text-white">
    {/* Top-left: location */}
    <div className={`absolute top-3 left-3 sm:top-4 sm:left-4 px-2.5 py-1.5 ${panel}`}>
      <span className={`${hudText} font-bold text-[#F2B94B]`}>Retail District</span>
    </div>

    {/* Top-right: squad status (concept only) */}
    <div className={`absolute top-3 right-3 sm:top-4 sm:right-4 flex items-center gap-2 px-2.5 py-1.5 ${panel}`}>
      <div className="flex -space-x-1.5" aria-hidden="true">
        {['#2563EB', '#F97316', '#8B5CF6', '#10B981'].map((c) => (
          <span key={c} className="h-3.5 w-3.5 rounded-full border-2 border-[#0B132B]" style={{ backgroundColor: c }} />
        ))}
        <span className="h-3.5 w-3.5 rounded-full border border-dashed border-white/40 bg-[#0B132B]" />
      </div>
      <span className={`${hudText} text-white/85`}>Squad 4/5 · Concept</span>
    </div>

    {/* Centre: discovery toast */}
    {phase === 'discover' && (
      <div key="clue" className={`absolute top-20 inset-x-0 mx-auto w-fit flex items-center gap-2 px-3 py-2 animate-fadeIn ${panel} border-[#38D9E6]/50`}>
        <Sparkles className="w-3.5 h-3.5 text-[#38D9E6]" />
        <span className="text-xs font-semibold whitespace-nowrap">New observation discovered</span>
      </div>
    )}

    {/* NPC dialogue */}
    {phase === 'npc' && (
      <div key="dialogue" className={`absolute inset-x-0 mx-auto bottom-16 w-[min(88%,22rem)] px-4 py-3 animate-fadeIn ${panel}`}>
        <p className={`${hudText} text-[#F97316] font-bold mb-1`}>Jun · Friend</p>
        <p className="text-sm font-medium">“Can you watch the door for me?”</p>
      </div>
    )}

    {/* Decision interface: a highlighted option, not a submitted choice */}
    {phase === 'decide' && (
      <div key="decide" className={`absolute inset-0 m-auto h-fit w-[min(90%,20rem)] p-3 animate-fadeIn ${panel} border-[#7755DF]/50`}>
        <p className={`${hudText} text-[#A78BFA] font-bold mb-2`}>What would you do?</p>
        <ul className="space-y-1.5">
          {CHOICES.map((c, i) => (
            <li
              key={c}
              className={`rounded-lg px-2.5 py-1.5 text-xs border ${
                i === 1 ? 'border-[#38D9E6]/70 bg-[#38D9E6]/10 text-white' : 'border-white/10 text-white/75'
              }`}
            >
              {c}
              {i === 1 && <span className={`${hudText} ml-2 text-[#38D9E6]`}>considering…</span>}
            </li>
          ))}
        </ul>
        <div className="mt-2 flex items-center gap-1.5 text-[#F2B94B]">
          <Waves className="w-3.5 h-3.5" />
          <span className={hudText}>Ripple Effect: consequences unfold later</span>
        </div>
      </div>
    )}

    {/* Bottom-left: objective */}
    <div className={`absolute bottom-3 left-3 sm:bottom-4 sm:left-4 px-3 py-2 max-w-[60%] ${panel}`}>
      <p className={`${hudText} text-[#F2B94B] font-bold`}>Objective</p>
      <p key={phase} className="text-xs font-medium animate-fadeIn">{OBJECTIVES[phase]}</p>
    </div>

    {/* Bottom-right: interaction prompt + controls */}
    <div className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 flex items-end gap-2">
      {(phase === 'discover' || phase === 'npc') && (
        <div className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 animate-fadeIn ${panel}`}>
          <span className="grid place-items-center h-4 w-4 rounded bg-[#38D9E6] text-[#0B132B] text-[10px] font-bold">E</span>
          <Search className="w-3 h-3 text-[#38D9E6]" />
          <span className={`${hudText} text-white/85`}>{phase === 'npc' ? 'Talk' : 'Inspect'}</span>
        </div>
      )}
      <div className={`pointer-events-auto flex ${panel}`}>
        <button
          type="button"
          onClick={onTogglePlay}
          className="p-2 rounded-l-xl hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-shield-cyan"
          aria-label={playing ? 'Pause gameplay preview' : 'Play gameplay preview'}
        >
          {playing ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
        </button>
        <button
          type="button"
          onClick={onReplay}
          className="p-2 rounded-r-xl border-l border-white/10 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-shield-cyan"
          aria-label="Replay gameplay preview"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>

    {/* Honesty label: the game is in development */}
    <span className={`absolute top-12 right-3 sm:top-14 sm:right-4 rounded-md bg-[#0B132B]/70 px-2 py-0.5 ${hudText} text-white/70`}>3D Gameplay Concept Preview</span>
  </div>
);
