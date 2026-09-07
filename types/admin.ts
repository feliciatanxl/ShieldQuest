import type { Competency } from './guardians.js';

export const TARGET_GROUPS = [
  'Primary / Early Secondary',
  'Secondary',
  'Post-Secondary / Tertiary',
  'All Youth Bands',
] as const;

export type TargetGroup = (typeof TARGET_GROUPS)[number];

export const TARGET_GROUP_AGE: Record<TargetGroup, string> = {
  'Primary / Early Secondary': '(10–13)',
  Secondary: '(14–16)',
  'Post-Secondary / Tertiary': '(17–24)',
  'All Youth Bands': '(all cohorts)',
};

export function migrateTargetGroup(value: unknown): TargetGroup {
  if (typeof value !== 'string') return 'All Youth Bands';
  if ((TARGET_GROUPS as readonly string[]).includes(value)) return value as TargetGroup;
  switch (value) {
    case 'ITE / Poly / JC':
      return 'Post-Secondary / Tertiary';
    case 'Secondary / Tertiary':
      return 'Secondary';
    case 'All youth cohorts':
      return 'All Youth Bands';
    default:
      return 'All Youth Bands';
  }
}

export type AdminScenarioStatus = 'LIVE' | 'DRAFT' | 'SCHEDULED' | 'ARCHIVED';

export interface AdminScenarioRow {
  id: string;
  title: string;
  category: string;
  targetGroup: TargetGroup;
  status: AdminScenarioStatus;
  /**
   * Percentage of responses selecting a safer option. Measures CONTENT difficulty,
   * never individual participants.
   */
  safeDecisionRate: number;
  /** Same measure one review cycle earlier, for direction of travel. */
  previousSafeDecisionRate: number;
  responses: number;
  competencies: Competency[];
  updatedBy: string;
  updatedOn: string;
  isFlashMission: boolean;
}

export interface PortalSummary {
  activeScenarios: number;
  participants: number;
  averageSafeDecisionRate: number;
  needsReview: number;
}

export type InsightKind = 'SUPPORT' | 'IMPROVED' | 'PEER_SHIELD';

export interface Insight {
  id: string;
  kind: InsightKind;
  label: string;
  subject: string;
  value: string;
  note: string;
}

export interface EngagementMetric {
  id: string;
  label: string;
  value: string;
  note: string;
}

export type KpiStatus = 'DEMONSTRATED' | 'SIMULATED' | 'PLANNED';

export const KPI_STATUS_LABEL: Record<KpiStatus, string> = {
  DEMONSTRATED: 'Demonstrated in prototype',
  SIMULATED: 'Simulated analytics',
  PLANNED: 'Planned for pilot',
};

export interface PilotKpi {
  id: string;
  number: number;
  name: string;
  measures: string;
  method: string;
  status: KpiStatus;
}

export type SimulatedCohortId =
  | 'primary'
  | 'secondary'
  | 'tertiary'
  | 'community';

export const SIMULATED_COHORTS: { id: SimulatedCohortId; label: string }[] = [
  { id: 'primary', label: 'Primary / Early Secondary (10–13)' },
  { id: 'secondary', label: 'Secondary (14–16)' },
  { id: 'tertiary', label: 'Post-Secondary / Tertiary (17–24)' },
  { id: 'community', label: 'Community Pilot' },
];

export interface FlashMissionDraft {
  title: string;
  category: string;
  targetGroup: TargetGroup;
  prompt: string;
  choices: [string, string, string];
  /**
   * Which choice is the intended learning response (author-facing only).
   */
  safeChoiceIndex: 0 | 1 | 2;
  safeResponse: string;
  competency: Competency;
  guardianId: string;
  debrief: string;
  warningSigns: string[];
  cohorts: SimulatedCohortId[];
  status: Extract<AdminScenarioStatus, 'LIVE' | 'DRAFT'>;
}

export type YouthMissionStatus =
  | 'AWAITING_REVIEW'
  | 'CHANGES_REQUESTED'
  | 'CONVERTED'
  | 'REJECTED';

export const YOUTH_MISSION_STATUS_LABEL: Record<YouthMissionStatus, string> = {
  AWAITING_REVIEW: 'Awaiting review',
  CHANGES_REQUESTED: 'Changes requested',
  CONVERTED: 'Converted to scenario draft',
  REJECTED: 'Not taken forward',
};

export type YouthMissionDecision = Exclude<
  YouthMissionStatus,
  'AWAITING_REVIEW'
>;

export interface YouthMissionSubmission {
  id: string;
  title: string;
  category: string;
  suggestedBand: TargetGroup;
  proposedCompetency: Competency;
  summary: string;
  intendedLesson: string;
  submittedBy: string;
  submittedOn: string;
  submitterBand: TargetGroup;
  status: YouthMissionStatus;
  safeguardingFlags: string[];
  reviewNote?: string;
  reviewedBy?: string;
}

export interface GroupDecisionSignal {
  id: string;
  question: string;
  band: TargetGroup;
  responses: number;
  initialSafePct: number;
  finalSafePct: number;
  reconsideredPct: number;
  topFactor: string;
}

export interface SkillCoverage {
  competency: Competency;
  coverage: number;
  scenarios: number;
}

export type AdminSection =
  | 'overview'
  | 'sessions'
  | 'library'
  | 'builder'
  | 'review'
  | 'youth'
  | 'insights'
  | 'resources';
