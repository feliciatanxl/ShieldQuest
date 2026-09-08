import { useNavigate } from 'react-router-dom';
import { PlayerOnboardingModal } from './PlayerOnboardingModal';

export function OnboardingRoutePage() {
  const navigate = useNavigate();

  const handleComplete = () => {
    localStorage.setItem('sq_onboarded_seen', 'true');
    navigate('/board');
  };

  return (
    <div
      data-skin="game"
      className="flex min-h-dvh items-center justify-center bg-[var(--sq-canvas)]"
    >
      <PlayerOnboardingModal open={true} onComplete={handleComplete} />
    </div>
  );
}
