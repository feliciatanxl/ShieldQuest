import { Router, Request, Response } from 'express';
import { publicData } from '../data/fixtures.js';

export const publicRouter = Router();

publicRouter.get('/site', (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: publicData.site,
  });
});

publicRouter.get('/districts', (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: publicData.districts,
  });
});

publicRouter.get('/districts/:id', (req: Request, res: Response) => {
  const paramId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const district = publicData.districts.find(
    (d) => d.id.toLowerCase() === (paramId || '').toLowerCase()
  );

  if (!district) {
    res.status(404).json({
      success: false,
      error: {
        message: `District with id '${paramId}' not found.`,
        statusCode: 404,
      },
    });
    return;
  }

  res.json({
    success: true,
    data: district,
  });
});

publicRouter.get('/guardians', (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: publicData.guardians,
  });
});

publicRouter.get('/guardians/:id', (req: Request, res: Response) => {
  const paramId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const guardian = publicData.guardians.find(
    (g) => g.id.toLowerCase() === (paramId || '').toLowerCase()
  );

  if (!guardian) {
    res.status(404).json({
      success: false,
      error: {
        message: `Guardian with id '${paramId}' not found.`,
        statusCode: 404,
      },
    });
    return;
  }

  res.json({
    success: true,
    data: guardian,
  });
});

publicRouter.get('/framework', (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: publicData.framework,
  });
});

publicRouter.get('/teaser', (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: publicData.teaserScenarios,
  });
});
