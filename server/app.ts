import express, { type ErrorRequestHandler } from 'express';
import helmet from 'helmet';
import { sessionsRouter } from './routes/sessions.js';
import { scenariosRouter } from './routes/scenarios.js';
import { votesRouter } from './routes/votes.js';

export const app = express();
app.disable('x-powered-by');
app.use(helmet());
app.use(express.json({ limit: '16kb' }));
app.get('/api/health', (_req, res) =>
  res.json({ status: 'ok', mode: 'scaffold', database: 'not-connected' }),
);
app.use('/api/sessions', sessionsRouter);
app.use('/api/scenarios', scenariosRouter);
app.use('/api/votes', votesRouter);
app.use((_req, res) =>
  res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Route not found.' } }),
);
const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  const status = error.type === 'entity.too.large' ? 413 : error instanceof SyntaxError ? 400 : 500;
  res.status(status).json({
    error: {
      code: 'REQUEST_ERROR',
      message: status === 500 ? 'Unexpected server error.' : 'Invalid request body.',
    },
  });
};
app.use(errorHandler);
