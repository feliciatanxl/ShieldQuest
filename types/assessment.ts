import type { Competency } from './guardians.js';
import type { CityDistrictId, NodeKind } from './city-board.js';

/** How an achievement's progress is counted. All personal, never compared. */
export type AchievementMetric =
  | { kind: 'COMPETENCY'; competency: Competency }
  | { kind: 'NODE_KIND'; nodeKind: NodeKind }
  | { kind: 'GUARDIAN'; guardianId: string }
  | { kind: 'SKILL_BREADTH' };

export interface Achievement {
  id: string;
  title: string;
  description: string;
  target: number;
  metric: AchievementMetric;
}

export interface ResolvedAchievement extends Achievement {
  progress: number;
  earned: boolean;
}

/** A district badge, earned by finishing everything playable in a district. */
export interface DistrictBadge {
  districtId: CityDistrictId;
  name: string;
  blurb: string;
}

/** How many Shield Tokens each kind of completion is worth. */
export const TOKEN_AWARD = {
  mission: 40,
  peerShieldSuccess: 10,
  miniGame: 25,
  district: 100,
  achievement: 50,
} as const;

/** Grant keys. Idempotency depends on these being stable. */
export const tokenKey = {
  mission: (nodeId: string) => `mission:${nodeId}`,
  peerShieldSuccess: (nodeId: string) => `peer-success:${nodeId}`,
  district: (districtId: string) => `district:${districtId}`,
  achievement: (achievementId: string) => `achievement:${achievementId}`,
};
