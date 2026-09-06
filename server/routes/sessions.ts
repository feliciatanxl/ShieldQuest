import { Router } from 'express';
import { notImplemented } from '../services/notImplemented.js';

export const sessionsRouter = Router();
sessionsRouter.post('/', notImplemented('Session creation'));
sessionsRouter.get('/:code', notImplemented('Session lookup'));
sessionsRouter.post('/:code/join', notImplemented('Squad assignment (4–5 participants)'));
// TODO: short-lived participant tokens, expiry, rate limiting, transactional capacity checks.
