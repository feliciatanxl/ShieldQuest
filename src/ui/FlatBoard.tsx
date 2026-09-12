import { useEffect, useState } from 'react';

import { DISTRICTS, TRACK } from '../game/board.ts';
import { fallbackCell } from '../game/geometry.ts';
import { useGame } from '../state/store.ts';
import { DiceFace } from './Hud.tsx';
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
 * It gets the same turn *structure* as the 3D board, not just the same rules:
 * the dice tumble in the middle of the board, then the token walks the spaces
 * one at a time. Cutting straight from the button to the scenario — which is
 * what this did first — loses the two things the roll is actually for: seeing
 * what you rolled, and seeing which spaces you passed to get here.
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

/** Dice tumble, then one hop per space. Tuned to match the 3D board's pacing. */
const DICE_MS = 700;
const STEP_MS = 150;

const randomFace = () => 1 + Math.floor(Math.random() * 6);

export default function FlatBoard({ onInspect }: { onInspect: (index: number) => void }) {
  const game = useGame((s) => s.game);
  const path = useGame((s) => s.path);
  const dice = useGame((s) => s.dice);
  const arrive = useGame((s) => s.arrive);

  /**
   * Where the token actually is, which is not the same as `game.position`.
   * The engine moves the player the instant the roll is applied; this follows
   * behind it one space at a time.
   */
  const [tokenIndex, setTokenIndex] = useState(game?.position ?? 0);
  const [rolling, setRolling] = useState(false);
  const [tumble, setTumble] = useState<[number, number]>([1, 1]);

  const position = game?.position ?? 0;
  const moving = path.length > 0;

  // Any time we are not mid-move — a resume, a reload, a renderer switch — the
  // token belongs wherever the engine says the player is.
  useEffect(() => {
    if (!moving) setTokenIndex(position);
  }, [moving, position]);

  useEffect(() => {
    if (path.length === 0) return;

    // Reduced motion still gets the full sequence, just without the theatre:
    // the values still land on the dice and the token still ends up in the
    // right place, it simply happens at once.
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const diceMs = reduced ? 0 : DICE_MS;
    const stepMs = reduced ? 0 : STEP_MS;

    let cancelled = false;
    const timers: number[] = [];
    let shuffle = 0;

    if (!reduced) {
      setRolling(true);
      shuffle = window.setInterval(() => setTumble([randomFace(), randomFace()]), 90);
    }

    timers.push(
      window.setTimeout(() => {
        if (cancelled) return;
        window.clearInterval(shuffle);
        setRolling(false);

        path.forEach((space, step) => {
          timers.push(
            window.setTimeout(() => {
              if (!cancelled) setTokenIndex(space);
            }, step * stepMs),
          );
        });

        // A short beat after the last hop, so the space the player landed on is
        // visible for a moment before its sheet covers the board.
        timers.push(
          window.setTimeout(
            () => {
              if (!cancelled) arrive();
            },
            path.length * stepMs + (reduced ? 0 : 260),
          ),
        );
      }, diceMs),
    );

    return () => {
      cancelled = true;
      window.clearInterval(shuffle);
      timers.forEach(window.clearTimeout);
    };
  }, [path, arrive]);

  if (!game) return null;

  const tokenCell = fallbackCell(tokenIndex);

  return (
    <div className="sq-flat-stage">
      <div className="sq-flat-board">
        {TRACK.map((space) => {
          const cell = fallbackCell(space.index);
          const district = DISTRICTS[space.districtId];
          // Follows the token, not the engine, so the highlight never runs on
          // ahead of the piece while it is still walking.
          const current = tokenIndex === space.index;
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
              <span aria-hidden="true" className="sq-tile-glyph">
                {KIND_GLYPH[space.kind]}
              </span>
              {/* Both are rendered; a container query on the board decides
                  which one there is room for. Neither is the accessible name —
                  that is the full description on the button itself. */}
              <span aria-hidden="true" className="sq-tile-title">
                {space.title}
              </span>
              <span aria-hidden="true" className="sq-tile-short">
                {space.short}
              </span>
              <span className="sr-only">
                {`Space ${space.index + 1}. ${space.title}. ${district.name}. ${space.summary}`}
                {current ? ' You are here.' : ''}
                {resolved ? ' Already played.' : ''}
              </span>
            </button>
          );
        })}

        <span
          aria-hidden="true"
          className="sq-flat-token"
          style={{
            ['--col' as string]: tokenCell.col,
            ['--row' as string]: tokenCell.row,
          }}
        />

        <div className="sq-flat-centre">
          <p className="sq-centre-label">ShieldQuest City</p>

          <div className="sq-flat-dice" data-rolling={rolling}>
            <DiceFace value={rolling ? tumble[0] : (dice?.a ?? 1)} />
            <DiceFace value={rolling ? tumble[1] : (dice?.b ?? 1)} />
          </div>

          <p className="sq-centre-status">
            {rolling
              ? 'Rolling…'
              : dice
                ? `Rolled ${dice.total}${dice.isDouble ? ' · double' : ''}`
                : 'Roll to move'}
          </p>

          <div>
            <p className="sq-centre-trust">{game.stats.trust}</p>
            <p className="sq-centre-note">Trust Meter</p>
          </div>

          <p className="sq-centre-note">Flat board — same spaces, same rules, no 3D.</p>
        </div>
      </div>
    </div>
  );
}
