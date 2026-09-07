import { useParams } from 'react-router-dom';
import { MiniGamePage } from './MiniGamePage';

export function MinigameRoutePage() {
  const { id } = useParams<{ id: string }>();
  return <MiniGamePage gameId={id || 'spot-the-warning-signs'} />;
}
