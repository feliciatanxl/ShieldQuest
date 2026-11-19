import { createHash, randomBytes, randomUUID, timingSafeEqual } from 'node:crypto';
import type { MissionExit, UnityMissionId } from '@shieldquest/shared';

export type ShieldSkill = 'S' | 'H' | 'I' | 'E' | 'L' | 'D';

export interface MissionProgress { checkpoint: string; completedObjectives: string[]; status: MissionExit['status'] }
export interface SessionProgress { version: number; missions: Partial<Record<UnityMissionId, MissionProgress>> }

/** One player's answer for one SHIELD skill. Never scored client-side; scoring is a server TODO. */
export interface DecisionRecord { decisionId: string; missionId: UnityMissionId; skill: ShieldSkill; choiceId: string; receivedAt: string }

interface Session { tokenHash: Buffer; createdAt: number; progress: SessionProgress; decisions: Map<string, DecisionRecord> }

/**
 * Storage port. The in-memory version backs local dev/tests; a DynamoDB adapter implements the same
 * methods (see docs/architecture/SHIELDQUEST_V4_AUDIT.md for the key design).
 */
export interface SessionStore {
  create(): { sessionId: string; token: string };
  authorise(sessionId: string, token: string): boolean;
  getProgress(sessionId: string): SessionProgress | undefined;
  /** Optimistic concurrency: fails with 'conflict' when expectedVersion is stale. */
  saveProgress(sessionId: string, expectedVersion: number, missionId: UnityMissionId, p: MissionProgress): SessionProgress | 'conflict';
  /** Idempotent by decisionId: a retry returns the original record and created=false. */
  recordDecision(sessionId: string, d: Omit<DecisionRecord, 'receivedAt'>): { record: DecisionRecord; created: boolean };
  listDecisions(sessionId: string): DecisionRecord[];
}

const hash = (t: string) => createHash('sha256').update(t).digest();

export function createMemoryStore(ttlMs = 24 * 60 * 60 * 1000): SessionStore {
  const sessions = new Map<string, Session>();
  const live = (id: string) => {
    const s = sessions.get(id);
    if (s && Date.now() - s.createdAt > ttlMs) { sessions.delete(id); return undefined; } // workshop data expires
    return s;
  };
  return {
    create() {
      const sessionId = randomUUID();
      const token = randomBytes(32).toString('base64url');
      sessions.set(sessionId, { tokenHash: hash(token), createdAt: Date.now(), progress: { version: 0, missions: {} }, decisions: new Map() });
      return { sessionId, token };
    },
    authorise(id, token) { const s = live(id); return !!s && timingSafeEqual(s.tokenHash, hash(token)); },
    getProgress(id) { return live(id)?.progress; },
    saveProgress(id, expectedVersion, missionId, p) {
      const s = live(id)!;
      if (s.progress.version !== expectedVersion) return 'conflict';
      s.progress = { version: expectedVersion + 1, missions: { ...s.progress.missions, [missionId]: p } };
      return s.progress;
    },
    recordDecision(id, d) {
      const s = live(id)!;
      const existing = s.decisions.get(d.decisionId);
      if (existing) return { record: existing, created: false };
      const record = { ...d, receivedAt: new Date().toISOString() };
      s.decisions.set(d.decisionId, record);
      return { record, created: true };
    },
    listDecisions(id) { return [...(live(id)?.decisions.values() ?? [])]; },
  };
}
