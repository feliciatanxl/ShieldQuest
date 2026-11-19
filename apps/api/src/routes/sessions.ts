import { Router, Request, Response, NextFunction } from 'express';
import { isUnityMission, parseMissionExit } from '@shieldquest/shared';
import type { SessionStore, ShieldSkill } from '../data/sessionStore.js';

const SKILLS: ShieldSkill[] = ['S', 'H', 'I', 'E', 'L', 'D'];
const ID = /^[A-Za-z0-9_-]{1,64}$/;

const fail = (res: Response, statusCode: number, message: string) =>
  res.status(statusCode).json({ success: false, error: { message, statusCode } });

/** Anonymous workshop sessions: no names or emails, just a random id + bearer token. */
export function sessionsRouter(store: SessionStore): Router {
  const r = Router();

  r.post('/', (_req, res) => {
    res.status(201).json({ success: true, data: store.create() });
  });

  // Every route below needs the session's own token.
  r.use('/:id', (req: Request, res: Response, next: NextFunction) => {
    const token = /^Bearer (\S+)$/.exec(req.get('authorization') ?? '')?.[1];
    if (!token || !store.authorise(String(req.params.id), token)) return void fail(res, 401, 'Invalid or expired session');
    next();
  });

  r.get('/:id/progress', (req, res) => {
    res.json({ success: true, data: store.getProgress(req.params.id) });
  });

  r.put('/:id/progress', (req, res) => {
    const parsed = parseMissionExit(req.body?.exit);
    const expected = req.body?.expectedVersion;
    if (!parsed.ok) return void fail(res, 400, parsed.error);
    if (!Number.isInteger(expected) || expected < 0) return void fail(res, 400, 'expectedVersion must be a non-negative integer');
    const { missionId, checkpoint, completedObjectives, status } = parsed.value;
    const saved = store.saveProgress(req.params.id, expected, missionId, { checkpoint, completedObjectives, status });
    if (saved === 'conflict') return void fail(res, 409, 'Progress changed elsewhere; reload and retry');
    res.json({ success: true, data: saved });
  });

  r.post('/:id/decisions', (req, res) => {
    const { decisionId, missionId, skill, choiceId } = req.body ?? {};
    if (!ID.test(decisionId ?? '') || !ID.test(choiceId ?? '')) return void fail(res, 400, 'decisionId and choiceId must be short ids');
    if (typeof missionId !== 'string' || !isUnityMission(missionId)) return void fail(res, 400, 'unknown missionId');
    if (!SKILLS.includes(skill)) return void fail(res, 400, 'skill must be one of S, H, I, E, L, D');
    // TODO(scoring): approved SHIELD criteria are not in the repo; score server-side per skill once supplied.
    const { record, created } = store.recordDecision(req.params.id, { decisionId, missionId, skill, choiceId });
    res.status(created ? 201 : 200).json({ success: true, data: record });
  });

  return r;
}
