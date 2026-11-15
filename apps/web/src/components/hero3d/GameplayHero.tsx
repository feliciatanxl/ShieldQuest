import React, { Suspense, lazy, useEffect, useState } from 'react';
import { HeroIllustration } from '../HeroIllustration';

// Three.js ships in its own chunk, fetched only when the 3D preview is actually used.
const GameplayHeroScene = lazy(() => import('./GameplayHeroScene'));

function canRender3D(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
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

/** If WebGL context creation or the scene chunk fails, fall back to the static illustration. */
class SceneBoundary extends React.Component<{ fallback: React.ReactNode; children: React.ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

/** Homepage hero media: animated 3D concept preview, or the static illustration as fallback. */
export const GameplayHero: React.FC = () => {
  const [use3D, setUse3D] = useState(false);
  useEffect(() => setUse3D(canRender3D()), []);

  if (!use3D) return <HeroIllustration />;

  return (
    <SceneBoundary fallback={<HeroIllustration />}>
      {/* Gradient hairline frame + soft glow ties the preview to the site's cyan/blue/violet accents. */}
    <div className="relative rounded-2xl p-px bg-gradient-to-br from-shield-cyan/70 via-shield-blue/30 to-shield-violet/70 shadow-[0_20px_60px_-15px_rgba(22,135,247,0.45),0_0_40px_-10px_rgba(119,85,223,0.35)]">
      <div className="relative w-full aspect-[4/3] sm:aspect-[16/10] lg:aspect-[16/11] rounded-[15px] overflow-hidden bg-shield-void">
        <Suspense fallback={<Placeholder />}>
          <GameplayHeroScene />
        </Suspense>
        {/* cinematic vignette */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_55%,rgba(5,8,22,0.55)_100%)]" />
        <div className="hud-corner hud-corner-tl" />
        <div className="hud-corner hud-corner-tr" />
        <div className="hud-corner hud-corner-bl" />
        <div className="hud-corner hud-corner-br" />
      </div>
    </div>
    </SceneBoundary>
  );
};
