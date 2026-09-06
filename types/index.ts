/** Shared contracts only: no browser APIs, database clients or secrets. */
export type DistrictId = 'school' | 'retail' | 'digital';
export type MissionPhase =
  'Explore' | 'Investigate' | 'Discuss' | 'Decide' | 'Experience' | 'Protect';
export type GuardianId = 'verifox' | 'echo' | 'beacon' | 'shieldfin' | 'cluepaw' | 'bytebuddy';
export type ScenarioStatus = 'draft' | 'published' | 'archived';
export interface Session {
  id: string;
  code: string;
  expiresAt: string;
}
export interface Participant {
  id: string;
  squadId: string;
}
export interface Squad {
  id: string;
  code: string;
  sessionId: string;
  participants: Participant[];
}
export interface Choice {
  id: string;
  label: string;
  nextNodeId?: string;
  reflection: string;
}
export interface ScenarioNode {
  id: string;
  phase: MissionPhase;
  text: string;
  choiceIds: string[];
}
export interface Scenario {
  id: string;
  title: string;
  district: DistrictId;
  status: ScenarioStatus;
  summary: string;
  prompt: string;
  clue: string;
  skill: string;
  guardian: GuardianId;
  durationMinutes: number;
  choices: Choice[];
  nodes: ScenarioNode[];
}
export interface VoteSubmission {
  participantId: string;
  scenarioId: string;
  choiceId: string;
}
export interface VoteSummary {
  choiceId: string;
  count: number;
}
export interface DelayedConsequence {
  id: string;
  scenarioId: string;
  choiceId: string;
  triggerAtStep: number;
  message: string;
}
export interface GuardianProgress {
  guardian: GuardianId;
  skill: string;
  earnedAt: string | null;
}
export interface AssessmentResponse {
  participantId: string;
  phase: 'pre' | 'post';
  answers: Record<string, string>;
}
export interface ApiError {
  error: { code: string; message: string };
}
