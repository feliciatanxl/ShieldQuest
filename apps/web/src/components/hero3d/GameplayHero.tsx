import React, { Suspense, lazy, useEffect, useState } from 'react';
import { HeroIllustration } from '../HeroIllustration';

// Three.js ships in its own chunk, fetched only when the 3D preview is actually used.
const GameplayHeroScene = lazy(() => import('./GameplayHeroScene'));

function canRender3D(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
  // Small screens get the lightweight illustrated fallback.
  if (!window.matchMedia('(min-width: 768px)').matches) return false;
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl2') || c.getContext('webgl'));
  } catch {
    return false;
  }
}

const Placeholder: React.FC = () => (
  <div className="absolute inset-0 grid place-items-center bg-gradient-to-b from-shield-card via-shield-dark to-shield-void">
    <div className="flex flex-col items-center gap-3 text-shield-muted">
      <span className="h-8 w-8 rounded-full border-2 border-shield-cyan/30 border-t-shield-cyan animate-spin" />
      <span className="text-[10px] font-mono uppercase tracking-wider">Loading 3D gameplay preview…</span>
    </div>
  </div>
);

/** Homepage hero media: animated 3D concept preview, or the static illustration as fallback. */
export const GameplayHero: React.FC = () => {
  const [use3D, setUse3D] = useState(false);
  useEffect(() => setUse3D(canRender3D()), []);

  if (!use3D) return <HeroIllustration />;

  return (
    <div className="relative w-full aspect-[16/10] lg:aspect-[16/11] rounded-2xl overflow-hidden border border-shield-cardBorder/90 bg-shield-void shadow-2xl shadow-shield-blue/20">
      <Suspense fallback={<Placeholder />}>
        <GameplayHeroScene />
      </Suspense>
    </div>
  );
};
