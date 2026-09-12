import { Suspense, lazy } from 'react';

import { isPlayerRoute, usePath } from './router.ts';

/**
 * Two surfaces, two audiences, one codebase.
 *
 * Both are lazy so neither pays for the other: the public site does not ship
 * the game engine or Three.js, and a participant arriving by QR code does not
 * download a landing page they will never see. They share only the design
 * tokens, the S.H.I.E.L.D. framework and the Guardian roster — which is exactly
 * the set of things that must never say two different things in two places.
 */
const PublicSite = lazy(() => import('./site/PublicSite.tsx'));
const PlayerApp = lazy(() => import('./ui/PlayerApp.tsx'));

/** Deliberately plain: it is on screen for a few hundred milliseconds. */
function Booting() {
  return (
    <div className="grid min-h-dvh place-content-center">
      <p className="text-sm text-[var(--sq-ink-muted)]">Loading ShieldQuest…</p>
    </div>
  );
}

export default function App() {
  const path = usePath();
  return (
    <Suspense fallback={<Booting />}>
      {isPlayerRoute(path) ? <PlayerApp /> : <PublicSite />}
    </Suspense>
  );
}
