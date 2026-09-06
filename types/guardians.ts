import type { GuardianId } from './index.js';

export type Competency = 'SPOT' | 'HOLD' | 'IDENTIFY' | 'EVALUATE' | 'LEAD' | 'DEFEND';

export const COMPETENCY_LABEL: Record<Competency, string> = {
  SPOT: 'Spot the Risk',
  HOLD: 'Hold Before Acting',
  IDENTIFY: 'Identify the Influence',
  EVALUATE: 'Evaluate the Consequences',
  LEAD: 'Lead the Right Choice',
  DEFEND: 'Defend Your Community',
};

export const COMPETENCY_ORDER: Competency[] = [
  'SPOT',
  'HOLD',
  'IDENTIFY',
  'EVALUATE',
  'LEAD',
  'DEFEND',
];

export const COMPETENCY_LETTER: Record<Competency, string> = {
  SPOT: 'S',
  HOLD: 'H',
  IDENTIFY: 'I',
  EVALUATE: 'E',
  LEAD: 'L',
  DEFEND: 'D',
};

export interface Guardian {
  id: GuardianId;
  name: string;

  skill: string;
  motto: string;
  competency: Competency;

  target: number;
  description: string;

  greeting: string;
}

export type GuardianAward = 'MET' | 'PROGRESSED';
export interface GuardianStanding {
  level: number;
  progress: number;
  target: number;
}
export interface GuardianNotice {
  guardianId: GuardianId;
  award: GuardianAward | null;
}
export interface GuardianState {
  guardians: GuardianId[];
  guardianProgress: Partial<Record<GuardianId, number>>;
  guardianGrants: string[];
  currentGuardianId: GuardianId | null;
  pendingGuardianMeetings: GuardianId[];
  guardianNotice: GuardianNotice | null;
}
