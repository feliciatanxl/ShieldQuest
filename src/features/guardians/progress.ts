import type { GuardianId } from '../../../types';
import type {
  Guardian,
  GuardianAward,
  GuardianStanding,
  GuardianState,
} from '../../../types/guardians';
import { guardians } from './data';

export function guardianStanding(guardian: Guardian, cumulative = 0): GuardianStanding {
  const count = Number.isFinite(cumulative) ? Math.max(0, Math.trunc(cumulative)) : 0;
  const target = Math.max(1, Math.trunc(guardian.target) || 1);
  return { level: 1 + Math.floor(count / target), progress: count % target, target };
}

export function initialGuardianState(): GuardianState {
  return {
    guardians: [],
    guardianProgress: {},
    guardianGrants: [],
    currentGuardianId: null,
    pendingGuardianMeetings: [],
    guardianNotice: null,
  };
}

/** One grant per distinct activity and skill. Travel never calls this function. */
export function advanceGuardian(
  state: GuardianState,
  activityId: string,
  guardianId: GuardianId,
): { state: GuardianState; award: GuardianAward | null } {
  if (!activityId.trim() || !guardians.some((guardian) => guardian.id === guardianId))
    return { state, award: null };
  const key = JSON.stringify([activityId, guardianId]);
  if (state.guardianGrants.includes(key))
    return { state: { ...state, guardianNotice: { guardianId, award: null } }, award: null };
  const firstMeeting = !state.guardians.includes(guardianId);
  const award = firstMeeting ? 'MET' : 'PROGRESSED';
  return {
    award,
    state: {
      ...state,
      guardians: firstMeeting ? [...state.guardians, guardianId] : state.guardians,
      guardianProgress: {
        ...state.guardianProgress,
        [guardianId]: (state.guardianProgress[guardianId] ?? 0) + 1,
      },
      guardianGrants: [...state.guardianGrants, key],
      currentGuardianId: guardianId,
      pendingGuardianMeetings: firstMeeting
        ? [...state.pendingGuardianMeetings, guardianId]
        : state.pendingGuardianMeetings,
      guardianNotice: { guardianId, award },
    },
  };
}
