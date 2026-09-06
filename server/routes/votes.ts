import { Router } from 'express';
import { z } from 'zod';
import { notImplemented } from '../services/notImplemented.js';

export const votesRouter = Router();
const voteSchema = z
  .object({
    participantId: z.uuid(),
    scenarioId: z.string().min(1).max(100),
    choiceId: z.string().min(1).max(100),
  })
  .strict();
votesRouter.post(
  '/',
  (req, res, next) => {
    if (!voteSchema.safeParse(req.body).success) {
      res.status(400).json({
        error: {
          code: 'INVALID_VOTE',
          message: 'Expected a pseudonymous participant ID, scenario ID and choice ID only.',
        },
      });
      return;
    }
    next();
  },
  notImplemented('Vote persistence'),
);
// TODO: authenticated membership, scenario/choice validation, one vote per round, reveal only after everyone votes.
