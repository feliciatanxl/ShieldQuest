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
    <div ref={wrap} className="relative rounded-2xl bg-gradient-to-br from-shield-cyan/70 via-shield-blue/30 to-shield-violet/70 p-px shadow-[0_20px_60px_-15px_rgba(22,135,247,0.36)]">
      <div className="relative aspect-[16/10] w-full overflow-hidden rounded-[15px] bg-[#0b1324]">
        {/* Static fallback: crop of the same Tiled map around the void deck and minimart */}
        <div className={`absolute inset-0 transition-opacity duration-700 ${live ? 'opacity-0' : 'opacity-100'}`} aria-hidden={live}>
          <img src="/game/tilesets/neighbourhood-map-fallback.png" alt="Pixel-art Singapore HDB neighbourhood with a void deck, minimart, sheltered walkway and trees"
            className="absolute max-w-none" style={{ ...pixel, width: '266.67%', left: '-106.67%', top: '-133.3%' }} />
          {/* frames from the 8-direction idle sheets: 2 = east, 0 = south */}
          <div className="absolute -translate-x-1/2 -translate-y-full aspect-square" style={{ ...pixel, left: '36.7%', top: '66%', width: '7%', backgroundImage: "url('/game/characters/Indian Singaporean male student approximately 18–23 years old/Create_an_original_highl-Idle.png')", backgroundSize: '800% 100%', backgroundPosition: '28.57% 0' }} />
          <div className="absolute -translate-x-1/2 -translate-y-full aspect-square" style={{ ...pixel, left: '43.3%', top: '66%', width: '7%', backgroundImage: "url('/game/characters/Chinese Singaporean female young working adult approximately 22–28 years old/Create_an_original_highl-Idle.png')", backgroundSize: '800% 100%', backgroundPosition: '0.00% 0' }} />
        </div>
        <div ref={host} className={`absolute inset-0 transition-opacity duration-700 ${live ? 'opacity-100' : 'opacity-0'}`} aria-hidden="true" />
        <span className="pointer-events-none absolute left-3 top-3 rounded-full border border-white/15 bg-black/40 px-3 py-1 font-mono text-[11px] uppercase tracking-wider text-white/85 backdrop-blur">
          Blk 128 · Neighbourhood preview
        </span>
      </div>
    </div>
  );
};
