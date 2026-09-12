import { useGame } from './state/store.ts';
import GameShell from './ui/GameShell.tsx';
import Onboarding from './ui/Onboarding.tsx';

/**
 * Two screens: get in, and play.
 *
 * There is no router because there is nowhere else to go. A participant arrives
 * from a QR code, plays, and leaves; a deep link into the middle of a facilitated
 * session is not a thing anyone needs, and every extra route is another way for
 * a phone to land somewhere confusing in the middle of a workshop.
 */
export default function App() {
  const game = useGame((s) => s.game);
  return game ? <GameShell /> : <Onboarding />;
}
