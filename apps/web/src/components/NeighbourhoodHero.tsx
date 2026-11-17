import React, { useEffect, useRef, useState } from 'react';
import type Phaser from 'phaser';
import { useReducedMotion } from '../world/kit/motion';

const pixel: React.CSSProperties = { imageRendering: 'pixelated' };

/**
 * Homepage preview of the playable Singapore neighbourhood. A static crop of the same map shows first
 * (and stays for reduced motion or if Phaser fails); the live scene fades in once ready and sleeps off-screen.
 */
export const NeighbourhoodHero: React.FC = () => {
  const reduced = useReducedMotion();
  const wrap = useRef<HTMLDivElement>(null);
  const host = useRef<HTMLDivElement>(null);
  const [live, setLive] = useState(false);

  useEffect(() => {
    if (reduced) return;
    let game: Phaser.Game | null = null, observer: IntersectionObserver | null = null, cancelled = false;
    import('../game/games').then(({ createHero }) => {
      if (cancelled || !host.current) return;
      game = createHero(host.current);
      game.events.on('scene-ready', () => setLive(true));
      if (import.meta.env.DEV) (window as unknown as { __heroGame?: Phaser.Game }).__heroGame = game;
      observer = new IntersectionObserver(([e]) => (e.isIntersecting ? game?.loop.wake() : game?.loop.sleep()));
      observer.observe(wrap.current!);
    }).catch((e: unknown) => console.warn('[hero] live preview unavailable, showing still image', e));
    return () => { cancelled = true; observer?.disconnect(); game?.destroy(true); setLive(false); };
  }, [reduced]);

  return (
    <div ref={wrap} className="relative">
      {/* Soft offset "shadow tile" behind the frame for depth */}
      <div aria-hidden="true" className="absolute inset-0 translate-x-3 translate-y-3 rounded-[18px] bg-shield-gold/25" />
      <div className="relative rounded-[18px] border-[3px] border-shield-cream/90 bg-shield-card p-2 shadow-cozy">
        <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl bg-[#2b3a2c]">
          {/* Static fallback: crop of the same Tiled map around the void deck and minimart */}
          <div className={`absolute inset-0 transition-opacity duration-700 ${live ? 'opacity-0' : 'opacity-100'}`} aria-hidden={live}>
            <img src="/game/tilesets/neighbourhood-map-fallback.png" alt="Pixel-art Singapore HDB neighbourhood with a void deck, minimart, sheltered walkway and trees"
              className="absolute max-w-none" style={{ ...pixel, width: '266.67%', left: '-106.67%', top: '-133.3%' }} />
            {/* frames from the 8-direction idle sheets: 2 = east, 0 = south */}
            <div className="absolute -translate-x-1/2 -translate-y-full aspect-square" style={{ ...pixel, left: '36.7%', top: '66%', width: '7%', backgroundImage: "url('/game/characters/Indian Singaporean male student approximately 18–23 years old/Create_an_original_highl-Idle.png')", backgroundSize: '800% 100%', backgroundPosition: '28.57% 0' }} />
            <div className="absolute -translate-x-1/2 -translate-y-full aspect-square" style={{ ...pixel, left: '43.3%', top: '66%', width: '7%', backgroundImage: "url('/game/characters/Chinese Singaporean female young working adult approximately 22–28 years old/Create_an_original_highl-Idle.png')", backgroundSize: '800% 100%', backgroundPosition: '0.00% 0' }} />
          </div>
          <div ref={host} className={`absolute inset-0 transition-opacity duration-700 ${live ? 'opacity-100' : 'opacity-0'}`} aria-hidden="true" />
          {/* Gentle vignette so the canvas sits inside the frame rather than on top of it */}
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 shadow-[inset_0_0_40px_rgb(0_0_0/0.35)]" />
        </div>

        {/* Street-sign style location label */}
        <div className="pointer-events-none absolute -top-4 left-6 flex items-center gap-2 rounded-md border-2 border-white bg-[#1f6b4a] px-3 py-1 font-pixel text-xs uppercase tracking-wider text-white shadow-[0_3px_0_0_rgb(0_0_0/0.3)]">
          <span className="h-2 w-2 bg-shield-gold motion-safe:animate-pulse" aria-hidden="true" />
          Blk 128 · Neighbourhood preview
        </div>
        {/* Status chip bottom-right */}
        <div className="pointer-events-none absolute -bottom-3 right-6 rounded-md border border-shield-cardBorder bg-shield-card px-2.5 py-0.5 font-pixel text-[11px] uppercase tracking-wider text-shield-muted shadow-[0_2px_0_0_rgb(var(--shield-cardBorder))]">
          {live ? '● Live 2D preview' : 'Still preview'}
        </div>
      </div>
    </div>
  );
};
