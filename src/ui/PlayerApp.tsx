import { useGame } from '../state/store.ts';
import GameShell from './GameShell.tsx';
import Onboarding from './Onboarding.tsx';

/**
 * The player surface: get in, then play.
 *
 * Split out of `App` so that the game engine, its content and Three.js are all
 * behind the `/play` route. A grant assessor opening the public site should not
 * download a board game to read about one.
 */
export default function PlayerApp() {
  const game = useGame((s) => s.game);
  return game ? <GameShell /> : <Onboarding />;
}
