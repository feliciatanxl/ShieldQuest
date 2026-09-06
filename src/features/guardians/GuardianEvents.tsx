import { X } from 'lucide-react';
import { useSessionStore } from '../../stores/sessionStore';
import { guardians } from './data';
import { GuardianMet } from './GuardianMet';
import { GuardianProgressNote } from './GuardianCard';

/** Render after the mission dialog closes, so two dialogs never compete for focus. */
export function GuardianEvents() {
  const { pendingGuardianMeetings, guardianNotice, acknowledgeGuardianMet, dismissGuardianNotice } =
    useSessionStore();
  const meeting = guardians.find((guardian) => guardian.id === pendingGuardianMeetings[0]) ?? null;
  const noticeGuardian = guardians.find((guardian) => guardian.id === guardianNotice?.guardianId);
  return (
    <div className="city-feature guardian-feature">
      <GuardianMet guardian={meeting} onContinue={acknowledgeGuardianMet} />
      {!meeting && guardianNotice && noticeGuardian && (
        <div className="guardian-feedback" role="status">
          <GuardianProgressNote name={noticeGuardian.name} award={guardianNotice.award} />
          <button
            aria-label="Dismiss guardian progress"
            onClick={dismissGuardianNotice}
            className="grid h-11 w-11 shrink-0 place-items-center rounded-lg text-navy-900"
          >
            <X size={18} />
          </button>
        </div>
      )}
    </div>
  );
}
