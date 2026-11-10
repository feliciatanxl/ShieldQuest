import { Router, Request, Response } from 'express';

export const healthRouter = Router();

healthRouter.get('/', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'healthy',
    service: 'shieldquest-api',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});
