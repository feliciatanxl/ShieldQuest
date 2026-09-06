import { create } from 'zustand';
import type { DistrictId, GuardianId } from '../../types';
import type { GuardianAward, GuardianState } from '../../types/guardians';
import type { CityDistrictId } from '../../types/city-board';
import { TOKEN_AWARD, tokenKey } from '../../types/assessment';
import { advanceGuardian, initialGuardianState } from '../features/guardians/progress';
import type { ScenarioChoice, ScenarioMode } from '../../types/scenarios';

interface SessionState extends GuardianState {
  district: DistrictId;
  previewCode: string | null;
  completed: string[];
  shieldTokens: number;
  tokenGrants: string[];
  earnedAchievements: string[];
  districtBadges: CityDistrictId[];
  pendingDistrictCelebrations: CityDistrictId[];
  selectDistrict: (district: DistrictId) => void;
  setPreviewCode: (code: string) => void;
  completePreview: (scenarioId: string, guardian?: GuardianId) => GuardianAward | null;
  completeMission: (
    activityId: string,
    choice: ScenarioChoice,
    mode: ScenarioMode,
  ) => {
    guardianAward: GuardianAward | null;
    tokensAwarded: number;
  };
  completeGroupDecision: (
    activityId: string,
    guardianId: GuardianId,
  ) => {
    guardianAward: GuardianAward | null;
    tokensAwarded: number;
  };
  completeMiniGame: (
    activityId: string,
    guardianId: GuardianId,
  ) => {
    guardianAward: GuardianAward | null;
    tokensAwarded: number;
  };
  recordDistrictBadge: (districtId: CityDistrictId) => { tokensAwarded: number; isNew: boolean };
  recordAchievement: (achievementId: string) => { tokensAwarded: number; isNew: boolean };
  acknowledgeDistrictCelebration: () => void;
  acknowledgeGuardianMet: () => void;
  dismissGuardianNotice: () => void;
  reset: () => void;
}
// In-memory demo only. Do not persist participant tokens or private votes in localStorage.
export const useSessionStore = create<SessionState>((set) => ({
  district: 'school',
  previewCode: null,
  completed: [],
  shieldTokens: 0,
  tokenGrants: [],
  earnedAchievements: [],
  districtBadges: [],
  pendingDistrictCelebrations: [],
  ...initialGuardianState(),
  selectDistrict: (district) => set({ district }),
  setPreviewCode: (previewCode) => set({ previewCode }),
  // TODO(GuardianProgress): use authenticated participant progress when an endpoint exists.
  // Prisma stores earnedAt/skill, but cumulative decisions and the grant ledger need schema support.
  // A missing qualified Guardian records participation without granting skill progress.
  completePreview: (scenarioId, guardian) => {
    let award: GuardianAward | null = null;
    set((state) => {
      if (!scenarioId.trim()) return state;
      const result = guardian
        ? advanceGuardian(state, scenarioId, guardian)
        : { state, award: null };
      award = result.award;
      return { ...result.state, completed: [...new Set([...state.completed, scenarioId])] };
    });
    return award;
  },
  // TODO(Participant, GuardianProgress): tokens and activity grant keys need schema fields
  // and transactional server persistence. Local participation awards last for this visit.
  completeMission: (activityId, choice, mode) => {
    let guardianAward: GuardianAward | null = null;
    let tokensAwarded = 0;
    set((state) => {
      if (!activityId.trim()) return state;
      const guardian = choice.outcome !== 'RISKY' ? choice.debrief.guardianId : undefined;
      const grant = guardian
        ? advanceGuardian(state, activityId, guardian)
        : { state, award: null };
      guardianAward = grant.award;
      const awards: [string, number][] = [[`mission:${activityId}`, 40]];
      if (mode === 'PEER_SHIELD' && choice.outcome === 'SAFE')
        awards.push([`peer-success:${activityId}`, 10]);
      const fresh = awards.filter(([key]) => !state.tokenGrants.includes(key));
      tokensAwarded = fresh.reduce((total, [, amount]) => total + amount, 0);
      return {
        ...grant.state,
        completed: [...new Set([...state.completed, activityId])],
        shieldTokens: state.shieldTokens + tokensAwarded,
        tokenGrants: [...state.tokenGrants, ...fresh.map(([key]) => key)],
      };
    });
    return { guardianAward, tokensAwarded };
  },
  completeGroupDecision: (activityId, guardianId) => {
    let guardianAward: GuardianAward | null = null;
    let tokensAwarded = 0;
    set((state) => {
      if (!activityId.trim()) return state;
      const grant = advanceGuardian(state, activityId, guardianId);
      guardianAward = grant.award;
      const key = `mission:${activityId}`;
      const isFresh = !state.tokenGrants.includes(key);
      tokensAwarded = isFresh ? 40 : 0;
      return {
        ...grant.state,
        completed: [...new Set([...state.completed, activityId])],
        shieldTokens: state.shieldTokens + tokensAwarded,
        tokenGrants: isFresh ? [...state.tokenGrants, key] : state.tokenGrants,
      };
    });
    return { guardianAward, tokensAwarded };
  },
  completeMiniGame: (activityId, guardianId) => {
    let guardianAward: GuardianAward | null = null;
    let tokensAwarded = 0;
    set((state) => {
      if (!activityId.trim()) return state;
      const grant = advanceGuardian(state, activityId, guardianId);
      guardianAward = grant.award;
      const key = `mission:${activityId}`;
      const isFresh = !state.tokenGrants.includes(key);
      tokensAwarded = isFresh ? 25 : 0;
      return {
        ...grant.state,
        completed: [...new Set([...state.completed, activityId])],
        shieldTokens: state.shieldTokens + tokensAwarded,
        tokenGrants: isFresh ? [...state.tokenGrants, key] : state.tokenGrants,
      };
    });
    return { guardianAward, tokensAwarded };
  },
  recordDistrictBadge: (districtId) => {
    let tokensAwarded = 0;
    let isNew = false;
    set((state) => {
      if (!districtId) return state;
      const key = tokenKey.district(districtId);
      const isFresh = !state.tokenGrants.includes(key);
      const hasBadge = state.districtBadges.includes(districtId);
      tokensAwarded = isFresh ? TOKEN_AWARD.district : 0;
      isNew = !hasBadge;
      return {
        districtBadges: hasBadge ? state.districtBadges : [...state.districtBadges, districtId],
        shieldTokens: state.shieldTokens + tokensAwarded,
        tokenGrants: isFresh ? [...state.tokenGrants, key] : state.tokenGrants,
        pendingDistrictCelebrations:
          isNew && !state.pendingDistrictCelebrations.includes(districtId)
            ? [...state.pendingDistrictCelebrations, districtId]
            : state.pendingDistrictCelebrations,
      };
    });
    return { tokensAwarded, isNew };
  },
  recordAchievement: (achievementId) => {
    let tokensAwarded = 0;
    let isNew = false;
    set((state) => {
      if (!achievementId) return state;
      const key = tokenKey.achievement(achievementId);
      const isFresh = !state.tokenGrants.includes(key);
      const hasAch = state.earnedAchievements.includes(achievementId);
      tokensAwarded = isFresh ? TOKEN_AWARD.achievement : 0;
      isNew = !hasAch;
      return {
        earnedAchievements: hasAch ? state.earnedAchievements : [...state.earnedAchievements, achievementId],
        shieldTokens: state.shieldTokens + tokensAwarded,
        tokenGrants: isFresh ? [...state.tokenGrants, key] : state.tokenGrants,
      };
    });
    return { tokensAwarded, isNew };
  },
  acknowledgeDistrictCelebration: () =>
    set((state) => ({
      pendingDistrictCelebrations: state.pendingDistrictCelebrations.slice(1),
    })),
  acknowledgeGuardianMet: () =>
    set((state) => ({
      pendingGuardianMeetings: state.pendingGuardianMeetings.slice(1),
      guardianNotice:
        state.guardianNotice?.guardianId === state.pendingGuardianMeetings[0]
          ? null
          : state.guardianNotice,
    })),
  dismissGuardianNotice: () => set({ guardianNotice: null }),
  reset: () =>
    set({
      district: 'school',
      previewCode: null,
      completed: [],
      shieldTokens: 0,
      tokenGrants: [],
      earnedAchievements: [],
      districtBadges: [],
      pendingDistrictCelebrations: [],
      ...initialGuardianState(),
    }),
}));
