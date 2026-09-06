import type { DistrictId } from './index.js';

/** Board presentation contracts; backend district IDs stay canonical. */
import type { Competency } from './guardians.js';
export { COMPETENCY_LABEL, COMPETENCY_ORDER, COMPETENCY_LETTER } from './guardians.js';
export type { Competency, Guardian as BoardGuardian } from './guardians.js';

// TODO(Scenario.district): add COMMUNITY to Prisma before persisting this district.
export type CityDistrictId = DistrictId | 'community';

export type NodeKind =
  'SCENARIO' | 'MINI_GAME' | 'PEER_SHIELD' | 'GUARDIAN_CHALLENGE' | 'GROUP_DECISION';

export const NODE_KIND_LABEL: Record<NodeKind, string> = {
  SCENARIO: 'Scenario Mission',
  MINI_GAME: 'Mini-Game',
  PEER_SHIELD: 'Peer Shield',
  GUARDIAN_CHALLENGE: 'Guardian Challenge',
  GROUP_DECISION: 'Think · Vote · Explain',
};

export type NodeAvailability = 'OPEN' | 'UNLOCK' | 'PLANNED';

export interface CityMissionNode {
  id: string;
  districtId: CityDistrictId;
  kind: NodeKind;
  title: string;

  summary: string;
  primaryCompetency: Competency;

  guardianId?: string;
  estimatedMinutes: number;
  availability: NodeAvailability;

  requiredInDistrict?: number;

  href?: string;

  story?: {
    character: string;
    beat: string;
  };

  chapterRole?: string;
}

export interface CityDistrict {
  id: CityDistrictId;
  name: string;

  tagline: string;

  topics: string[];

  position: { x: number; y: number };
  nodes: CityMissionNode[];
}

export interface DistrictProgress {
  districtId: CityDistrictId;
  name: string;
  completed: number;
  total: number;
}

export interface WorldProgress {
  completed: number;
  total: number;
  districts: DistrictProgress[];
}

export type BoardSpaceKind =
  | 'SHIELD_CENTRAL'
  | 'DISTRICT_CHECKPOINT'
  | 'SCENARIO'
  | 'PEER_SHIELD'
  | 'MINI_GAME'
  | 'SITUATION_CARD'
  | 'GUARDIAN_CHECKPOINT'
  | 'REWARD_CHECKPOINT'
  | 'GROUP_DECISION';

export const BOARD_SPACE_LABEL: Record<BoardSpaceKind, string> = {
  SHIELD_CENTRAL: 'Shield Central',
  DISTRICT_CHECKPOINT: 'District Checkpoint',
  SCENARIO: 'Scenario Mission',
  PEER_SHIELD: 'Peer Shield',
  MINI_GAME: 'Mini-Game',
  SITUATION_CARD: 'Situation Card',
  GUARDIAN_CHECKPOINT: 'Guardian Checkpoint',
  REWARD_CHECKPOINT: 'Reward Checkpoint',
  GROUP_DECISION: 'Think · Vote · Explain',
};

export interface SituationCard {
  id: string;
  title: string;

  blurb: string;
  competency: Competency;
  guardianId: string;

  nodeId: string;

  actionLabel: string;

  warningSigns: string[];

  saferResponse: string;
}

export interface BoardSpace {
  index: number;
  kind: BoardSpaceKind;

  districtId?: CityDistrictId;
  title: string;

  nodeId?: string;
  situationCardId?: string;

  guardianId?: string;
}

export interface DistrictBadge {
  districtId: CityDistrictId;
  name: string;
  blurb: string;
}

export interface ResolvedNode extends CityMissionNode {
  completed: boolean;

  playable: boolean;

  remainingToUnlock: number;

  unlockCompleted: number;
  unlockRequired: number;

  newlyUnlocked: boolean;
}

export interface ResolvedDistrict extends CityDistrict {
  nodes: ResolvedNode[];
  completed: number;
  total: number;

  cleared: boolean;

  discovered: boolean;
}

export interface ResolvedSpace extends BoardSpace {
  node?: ResolvedNode;
  card?: SituationCard;

  completed: boolean;

  visited: boolean;
  isCurrent: boolean;

  planned: boolean;

  locked: boolean;

  actionable: boolean;
}
