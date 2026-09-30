import { useEffect } from 'react';

import { DISTRICT_ORDER } from '../game/board.ts';
import { useGame } from '../state/store.ts';
import type { GameState } from '../game/types.ts';
import { play } from './sfx.ts';

function builtCount(game: GameState | null): number {
  if (!game) return 0;
  return DISTRICT_ORDER.reduce((sum, id) => sum + game.districts[id].upgrades, 0);
}

/**
 * Plays the game's sounds off the store, in one place.
 *
 * Listening to state transitions rather than sprinkling `play()` through the
 * components means both boards get the same soundtrack, and a sheet that opens
 * from a resume or a follow-up queue sounds exactly like one opened by a roll.
 * Hops are the one exception: only the 3D scene knows when each one lands, so
 * it calls `play('hop')` itself.
 */
export function useGameSfx() {
  useEffect(
    () =>
      useGame.subscribe((next, prev) => {
        if (next.rolling && !prev.rolling) play('roll');
        if (!next.rolling && prev.rolling) play('clack');
        if (prev.path.length > 0 && next.path.length === 0 && next.game) play('land');

        if (next.overlay.kind !== prev.overlay.kind) {
          switch (next.overlay.kind) {
            case 'consequence':
              play('consequence');
              break;
            case 'award':
            case 'secured':
              play('fanfare');
              break;
            case 'none':
              break;
            default:
              play('open');
          }
        }

        if (next.flash && next.flash.id !== prev.flash?.id) {
          const gained = next.flash.deltas.coins ?? 0;
          if (next.flash.outcome === 'SAFE') play('safe');
          if (gained > 0) {
            // A handful of clinks in step with the coins flying to the purse.
            const clinks = Math.min(6, 2 + Math.floor(gained / 40));
            for (let i = 0; i < clinks; i += 1) {
              window.setTimeout(() => play('coin'), 180 + i * 85);
            }
          }
        }

        if (builtCount(next.game) > builtCount(prev.game)) play('build');
      }),
    [],
  );
}
