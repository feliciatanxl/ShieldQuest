import React, { Suspense, lazy, useRef, useState } from 'react';
import { Shield, ArrowRight, RotateCcw, Play, Layers, Hand } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SHIELD_FRAMEWORK, type ShieldStep } from '@shieldquest/shared';
import { GuardianIcon } from '../world/flat/GuardianIcon';
import { GUARDIANS as GUARDIAN_ART, type GuardianId } from '../world/v2Shared';
import type { ViewerHandle } from '../world/guardians/GuardianViewer';

// Three.js + the origami kit load only when this page is opened.
const GuardianViewer = lazy(() => import('../world/guardians/GuardianViewer').then((m) => ({ default: m.GuardianViewer })));

/** Current S.H.I.E.L.D. assignment for each original V2 Guardian. */
const GUARDIAN_SKILL: Record<GuardianId, ShieldStep['letter']> = {
  cluepaw: 'S',
  echo: 'H',
  verifox: 'I',
  bytebuddy: 'E',
  beacon: 'L',
  shieldfin: 'D',
};

const BOND_LABELS = ['I', 'II', 'III'];

const stepFor = (id: GuardianId) => SHIELD_FRAMEWORK.find((s) => s.letter === GUARDIAN_SKILL[id])!;

export const GuardiansPage: React.FC = () => {
  const [selected, setSelected] = useState<GuardianId>('cluepaw');
  const [bond, setBond] = useState(1);
  const [folded, setFolded] = useState(false);
  const [playKey, setPlayKey] = useState(0);
  const view = useRef<ViewerHandle>({ yaw: 0, pitch: 0, wake: () => {} });

  const art = GUARDIAN_ART.find((g) => g.id === selected)!;
  const step = stepFor(selected);

  const replayUnfold = () => {
    setFolded(false);
    setPlayKey((k) => k + 1);
  };
  const toggleFold = () => {
    // Unfolding again remounts V2's rig so its original Unfold plays from the sheet.
    if (folded) setPlayKey((k) => k + 1);
    setFolded((f) => !f);
  };
  const resetView = () => {
    view.current.yaw = 0;
    view.current.pitch = 0;
    view.current.wake();
  };
  const select = (id: GuardianId) => {
    setSelected(id);
    setFolded(false);
    resetView();
  };

  const controlBtn =
    'inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-shield-navy/80 hover:bg-shield-slate border border-shield-cardBorder text-xs font-heading font-bold text-shield-cream transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-shield-cyan';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-10">
      {/* Header */}
      <div className="max-w-3xl space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-shield-navy border border-shield-cardBorder text-xs font-mono font-semibold text-shield-gold">
          <Shield className="w-3.5 h-3.5" />
          <span>GUARDIAN COMPANIONS</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-heading font-black text-shield-cream tracking-tight leading-tight">
          Meet the Six Guardians
        </h1>
        <p className="text-base sm:text-lg text-shield-cream/90 leading-relaxed">
          Six origami companions, one for each S.H.I.E.L.D. skill. Pick one, then drag to turn it and watch it unfold.
        </p>
      </div>

      {/* Selection cards */}
      <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3" aria-label="Guardian companions">
        {GUARDIAN_ART.map((g) => {
          const s = stepFor(g.id);
          const active = g.id === selected;
          return (
            <li key={g.id}>
              <button
                type="button"
                onClick={() => select(g.id)}
                aria-pressed={active}
                className={`w-full h-full flex flex-col items-center gap-1 rounded-2xl border-2 p-3 text-center transition-all bg-gradient-to-b from-shield-surface to-shield-void focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-shield-cyan ${
                  active ? 'shadow-xl' : 'border-shield-cardBorder hover:border-shield-cyan/50'
                }`}
                style={active ? { borderColor: g.color, boxShadow: `0 0 24px -8px ${g.color}` } : undefined}
              >
                <GuardianIcon guardian={g.id} level={1} size={56} />
                <h3 className="text-sm font-heading font-black text-shield-cream">{g.name}</h3>
                <span className="text-[10px] font-mono uppercase tracking-wider text-shield-muted">
                  {s.letter} · {s.title}
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* 3D viewer */}
        <div className="lg:col-span-7 flex flex-col rounded-2xl border border-shield-cardBorder bg-gradient-to-b from-shield-card via-shield-dark to-shield-void overflow-hidden">
          <div className="relative aspect-square sm:aspect-[4/3]">
            <Suspense
              fallback={
                <div className="absolute inset-0 grid place-items-center text-[10px] font-mono uppercase tracking-wider text-shield-muted">
                  Loading 3D Guardian…
                </div>
              }
            >
              <GuardianViewer guardian={selected} level={folded ? 0 : bond} playKey={playKey} view={view} />
            </Suspense>
            <span className="pointer-events-none absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-shield-void/70 border border-shield-cardBorder px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider text-shield-muted">
              <Hand className="w-3 h-3" /> Drag to rotate
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2 p-3 border-t border-shield-cardBorder/60">
            <button type="button" onClick={replayUnfold} className={controlBtn}>
              <Play className="w-3.5 h-3.5 text-shield-cyan" /> Replay unfold
            </button>
            <button type="button" onClick={toggleFold} className={controlBtn} aria-pressed={folded}>
              <Layers className="w-3.5 h-3.5 text-shield-gold" /> {folded ? 'Unfold' : 'Fold up'}
            </button>
            <button type="button" onClick={resetView} className={controlBtn}>
              <RotateCcw className="w-3.5 h-3.5" /> Reset view
            </button>
            <div className="ml-auto flex items-center gap-1" role="group" aria-label="Bond level preview">
              <span className="text-[10px] font-mono uppercase tracking-wider text-shield-muted mr-1">Bond</span>
              {BOND_LABELS.map((label, i) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => {
                    setFolded(false);
                    setBond(i + 1);
                  }}
                  aria-pressed={!folded && bond === i + 1}
                  className={`h-8 w-8 rounded-lg border text-xs font-heading font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-shield-cyan ${
                    !folded && bond === i + 1
                      ? 'bg-shield-cyan text-shield-void border-shield-cyan'
                      : 'bg-shield-navy/80 border-shield-cardBorder text-shield-cream hover:bg-shield-slate'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Details */}
        <section className="lg:col-span-5 game-panel p-6 sm:p-8 space-y-6" aria-labelledby="guardian-detail-title">
          <div>
            <p className="text-[10px] font-mono uppercase tracking-wider" style={{ color: art.color }}>
              {art.creature}
            </p>
            <h2 id="guardian-detail-title" className="text-3xl font-heading font-black text-shield-cream mt-1">
              {art.name}
            </h2>
          </div>

          <div className="rounded-xl border border-shield-cardBorder bg-shield-void/60 p-4 space-y-2">
            <div className="flex items-center gap-3">
              <span
                className="grid place-items-center h-10 w-10 rounded-xl font-heading font-black text-lg text-shield-void"
                style={{ backgroundColor: art.color }}
              >
                {step.letter}
              </span>
              <div>
                <p className="text-[10px] font-mono uppercase tracking-wider text-shield-muted">S.H.I.E.L.D. competency</p>
                <p className="font-heading font-bold text-shield-cream">{step.title}</p>
              </div>
            </div>
            <p className="text-sm font-semibold text-shield-gold">{step.headline}</p>
            <p className="text-sm text-shield-cream/85 leading-relaxed">{step.description}</p>
          </div>

          <div className="space-y-2">
            <p className="text-[10px] font-mono uppercase tracking-wider text-shield-muted">Example</p>
            <p className="text-sm text-shield-cream/85 italic">“{step.example}”</p>
          </div>

          <div className="rounded-xl border border-dashed border-shield-cardBorder p-4 space-y-1">
            <p className="text-[10px] font-mono uppercase tracking-wider text-shield-gold">Progression · Concept</p>
            <p className="text-sm text-shield-cream/85 leading-relaxed">
              Guardians are planned to begin as a folded paper square and unfold as you practise their skill, growing through bond
              levels I–III. Bonds are cosmetic only and never change how a S.H.I.E.L.D. choice is assessed. Unlocking is still in
              development, so the bond buttons here only preview each look.
            </p>
          </div>
        </section>
      </div>

      {/* Bottom Link */}
      <div className="p-6 rounded-2xl bg-shield-void/80 border border-shield-cardBorder flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-sm text-shield-cream/90 text-center sm:text-left">
          Guardian unlocks are a planned progression feature and are still in development.
        </p>
        <Link
          to="/world"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-shield-navy hover:bg-shield-slate border border-shield-cardBorder text-shield-cyan text-xs font-heading font-bold transition-all hover:scale-105 flex-shrink-0"
        >
          <span>Explore the City Board</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
};
