import { useNavigate } from 'react-router-dom';
import { PlayerOnboardingModal } from './PlayerOnboardingModal';

export function OnboardingRoutePage() {
  const navigate = useNavigate();

  const handleComplete = () => {
    localStorage.setItem('sq_onboarded_seen', 'true');
    navigate('/board');
  };

  return (
    <div className="flex min-h-full items-center justify-center bg-navy-950">
      <PlayerOnboardingModal open={true} onComplete={handleComplete} />
    </div>
  );
}
