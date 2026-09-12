import { useEffect } from 'react';

import { DISTRICTS, TRACK } from '../game/board.ts';
import { fallbackCell } from '../game/geometry.ts';
import { useGame } from '../state/store.ts';
import type { BoardSpace } from '../game/types.ts';

/**
 * The flat board.
 *
 * Not a degraded version of the game — the same 28 spaces, the same order, the
 * same rules, drawn as a grid instead of a scene. It is what plays on a school
 * laptop with no WebGL, on a phone in data-saver mode, and for anyone who has
 * asked their device for reduced motion. The proposal commits to low-bandwidth
 * access and to running on "common phones, tablets and laptops"; this is the
 * part of the codebase that keeps that true rather than aspirational.
 *
 * Because there is no hop to wait for, the turn resolves as soon as the roll
 * lands.
 */

const KIND_GLYPH: Record<BoardSpace['kind'], string> = {
  GATE: '◈',
  MISSION: '▶',
  PEER_SHIELD: '❖',
  SITUATION: '✦',
  CLUE: '?',
  GUARDIAN: '★',
  COMMUNITY: '⌂',
};

export default function FlatBoard({ onInspect }: { onInspect: (index: number) => void }) {
  const game = useGame((s) => s.game);
  const path = useGame((s) => s.path);
  const arrive = useGame((s) => s.arrive);

  // No animation to wait for: land, then open the space.
  useEffect(() => {
    if (path.length === 0) return;
    const timer = window.setTimeout(arrive, 420);
    return () => window.clearTimeout(timer);
  }, [path, arrive]);

  if (!game) return null;

  return (
    <div className="grid h-full place-content-center p-3">
      <div className="sq-flat-board">
        {TRACK.map((space) => {
          const cell = fallbackCell(space.index);
          const district = DISTRICTS[space.districtId];
          const current = game.position === space.index;
          const resolved = game.resolved.includes(space.id);
          return (
            <button
              key={space.id}
              type="button"
              className="sq-flat-tile"
              data-current={current}
              data-resolved={resolved}
              style={{
                gridColumn: cell.col,
                gridRow: cell.row,
                ['--district-colour' as string]: district.colour,
              }}
              onClick={() => onInspect(space.index)}
            >
              <span aria-hidden="true" className="text-[13px] leading-none opacity-70">
                {KIND_GLYPH[space.kind]}
              </span>
              <span aria-hidden="true" className="font-semibold">
                {space.title}
              </span>
              {current ? (
                <span
                  aria-hidden="true"
                  className="absolute right-1 top-2 h-3 w-3 rounded-full bg-[var(--sq-earned)] ring-2 ring-[var(--sq-canvas)]"
                />
              ) : null}
              <span className="sr-only">
                {`Space ${space.index + 1}. ${space.title}. ${district.name}. ${space.summary}`}
                {current ? ' You are here.' : ''}
                {resolved ? ' Already played.' : ''}
              </span>
            </button>
          );
        })}

        <div className="sq-flat-centre">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--sq-ink-muted)]">
            ShieldQuest City
          </p>
          <p className="text-2xl font-bold text-[var(--sq-ink)]">{game.stats.trust}</p>
          <p className="text-xs text-[var(--sq-ink-muted)]">Trust Meter</p>
          <p className="mt-2 max-w-[22ch] text-[11px] leading-snug text-[var(--sq-ink-muted)]">
            Flat board — same spaces, same rules, no 3D.
          </p>
        </div>
      </div>
    </div>
  );
}
