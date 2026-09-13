import { Suspense, lazy, useEffect, useState } from 'react';

import { DISTRICTS, TRACK } from '../game/board.ts';
import { useGame } from '../state/store.ts';
import CityWorks from './CityWorks.tsx';
import FlatBoard from './FlatBoard.tsx';
import HowToPlay from './HowToPlay.tsx';
import ShieldCentral from './ShieldCentral.tsx';
import {
  BuildNudge,
  Confetti,
  FlashLayer,
  GuardianStrip,
  Purse,
  RollButton,
  StatBar,
} from './Hud.tsx';
import { InspectSheet, Overlays, SkillsSheet } from './Overlays.tsx';
import { Announcer, Button } from './primitives.tsx';

/**
 * Shown once per device, the first time a run reaches the board.
 *
 * A manual that reappears every session is one people learn to dismiss without
 * reading, so this is a one-time nudge towards a button that is always there.
 */
const SEEN_MANUAL_KEY = 'shieldquest.manual-seen.v2';

// Three.js is a third of the bundle. The shell, the HUD and the flat board all
// paint without it, so it is fetched only when the 3D renderer is actually the
// one being used.
const Board3D = lazy(() => import('./Board3D.tsx'));

/**
 * The play surface: board, HUD, and whatever sheet is currently in front.
 *
 * Layout is board-fills-the-space with the controls pinned top and bottom,
 * because the game is played standing up on a phone. The board never scrolls;
 * only sheets do.
 *
 * The header is ordered by how often a player looks at it: what they have, then
 * how the city is doing, then who they are becoming. The purse comes first
 * because it is also a button — it is the way into the build loop, and a build
 * loop nobody can find is a coin sink nobody uses.
 */
export default function GameShell() {
  const game = useGame((s) => s.game);
  const renderer = useGame((s) => s.renderer);
  const setRenderer = useGame((s) => s.setRenderer);
  const celebrate = useGame((s) => s.celebrate);
  const openReport = useGame((s) => s.openReport);
  const overlayKind = useGame((s) => s.overlay.kind);
  const log = useGame((s) => s.game?.log ?? []);

  const [inspecting, setInspecting] = useState<number | null>(null);
  const [skillsOpen, setSkillsOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [manualOpen, setManualOpen] = useState(false);
  const [hubOpen, setHubOpen] = useState(false);
  const [worksOpen, setWorksOpen] = useState(false);

  useEffect(() => {
    try {
      if (localStorage.getItem(SEEN_MANUAL_KEY)) return;
      localStorage.setItem(SEEN_MANUAL_KEY, '1');
      setManualOpen(true);
    } catch {
      /* Storage disabled. The button in the header is the real route in. */
    }
  }, []);

  if (!game) return null;
  const space = TRACK[game.position]!;
  const district = DISTRICTS[space.districtId];
  const latest = log[0];

  return (
    <div
      data-skin="game"
      className="flex h-dvh flex-col bg-[var(--sq-canvas)] text-[var(--sq-ink)]"
    >
      {/* ---------- top ---------- */}
      <header className="shrink-0 border-b border-[var(--sq-line)] bg-[var(--sq-surface)] px-3 pb-2 pt-[max(0.5rem,env(safe-area-inset-top))]">
        <div className="mb-2 flex items-center justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate text-sm font-extrabold">{game.handle}</p>
            <p className="text-[10px] text-[var(--sq-ink-muted)]">
              {game.sessionCode} · turn {game.turn}
            </p>
          </div>
          {/*
            "How to play" is deliberately NOT buried in the menu: a player who
            has forgotten the rules mid-turn should be able to see the way back
            to them without opening anything first.
          */}
          <div className="flex shrink-0 items-center gap-1">
            <Button
              variant="ghost"
              className="px-2.5 py-2"
              aria-label="How to play"
              title="How to play"
              onClick={() => setManualOpen(true)}
            >
              <span aria-hidden="true" className="text-base font-bold leading-none">
                ?
              </span>
            </Button>
            <Button variant="ghost" className="px-2.5 py-2" onClick={() => setSkillsOpen(true)}>
              Skills
            </Button>
            <Button variant="ghost" className="px-2.5 py-2" onClick={() => setMenuOpen((v) => !v)}>
              Menu
            </Button>
          </div>
        </div>

        <div className="mb-2.5">
          <Purse
            game={game}
            onOpenWorks={() => setWorksOpen(true)}
            onOpenHub={() => setHubOpen(true)}
          />
        </div>

        <StatBar game={game} />

        <div className="mt-2">
          <GuardianStrip game={game} onOpen={() => setSkillsOpen(true)} />
        </div>

        {menuOpen ? (
          <div className="mt-3 space-y-2 rounded-[var(--radius-card)] border border-[var(--sq-line)] p-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--sq-ink-muted)]">
              Board
            </p>
            <div className="flex gap-2">
              <Button
                variant={renderer === '3d' ? 'primary' : 'quiet'}
                className="flex-1"
                onClick={() => setRenderer('3d')}
              >
                3D board
              </Button>
              <Button
                variant={renderer === 'flat' ? 'primary' : 'quiet'}
                className="flex-1"
                onClick={() => setRenderer('flat')}
              >
                Flat board
              </Button>
            </div>
            <p className="text-[11px] leading-relaxed text-[var(--sq-ink-muted)]">
              Both boards have the same 28 spaces and the same rules. The flat board uses less
              battery and data, and works without 3D support.
            </p>
            <Button variant="quiet" full onClick={openReport}>
              See the session report
            </Button>
          </div>
        ) : null}
      </header>

      {/* ---------- board ---------- */}
      <div className="relative min-h-0 flex-1">
        {renderer === '3d' ? (
          <Suspense
            fallback={
              <div className="grid h-full place-content-center gap-2 text-center">
                <p className="text-sm text-[var(--sq-ink-muted)]">Building the city…</p>
              </div>
            }
          >
            <Board3D onInspect={setInspecting} />
          </Suspense>
        ) : (
          <FlatBoard onInspect={setInspecting} />
        )}
        <BuildNudge game={game} onOpen={() => setWorksOpen(true)} />
        <FlashLayer />
      </div>

      {/* ---------- bottom ---------- */}
      <footer className="shrink-0 border-t border-[var(--sq-line)] bg-[var(--sq-surface)] px-3 pb-[max(0.7rem,env(safe-area-inset-bottom))] pt-2.5">
        {/* The space under the piece, in its district's colour. One tap opens
            its sheet — the same route as tapping the tile, which is a 40px
            target on a phone and the one a thumb misses. */}
        <button
          type="button"
          onClick={() => setInspecting(game.position)}
          className="sq-space-chip mb-2"
          style={{ ['--district-colour' as string]: district.colour }}
        >
          <span className="sq-space-dot" aria-hidden="true" />
          <span className="truncate">
            <span className="font-bold">{space.title}</span>
            <span className="text-[var(--sq-ink-muted)]"> — {space.summary}</span>
          </span>
        </button>
        <RollButton />
      </footer>

      {/* ---------- overlays ---------- */}
      <Overlays />
      {inspecting !== null && overlayKind === 'none' ? (
        <InspectSheet index={inspecting} onClose={() => setInspecting(null)} />
      ) : null}
      {skillsOpen && overlayKind === 'none' ? (
        <SkillsSheet game={game} onClose={() => setSkillsOpen(false)} />
      ) : null}
      {worksOpen && overlayKind === 'none' ? (
        <CityWorks game={game} onClose={() => setWorksOpen(false)} />
      ) : null}
      {hubOpen && overlayKind === 'none' ? (
        <ShieldCentral game={game} onClose={() => setHubOpen(false)} />
      ) : null}
      {manualOpen && overlayKind === 'none' ? (
        <HowToPlay onClose={() => setManualOpen(false)} />
      ) : null}

      <Confetti trigger={celebrate} />
      <Announcer message={latest ? latest.text : ''} />
    </div>
  );
}
