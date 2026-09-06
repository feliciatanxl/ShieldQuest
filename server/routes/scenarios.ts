import { Router } from 'express';
import { demoScenarios } from '../../types/demo.js';
import { notImplemented } from '../services/notImplemented.js';

export const scenariosRouter = Router();
scenariosRouter.get('/', (_req, res) => res.json({ mode: 'demo', data: demoScenarios }));
scenariosRouter.get('/:id', (req, res) => {
  const scenario = demoScenarios.find((item) => item.id === req.params.id);
  if (!scenario) {
    res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Scenario not found.' } });
    return;
  }
  res.json({ mode: 'demo', data: scenario });
});
// Never enable these writes until facilitator authentication and authorization exist.
scenariosRouter.post('/', notImplemented('Create scenario'));
scenariosRouter.patch('/:id', notImplemented('Update scenario'));
scenariosRouter.delete('/:id', notImplemented('Delete scenario'));
scenariosRouter.post('/:id/publish', notImplemented('Publish scenario'));
