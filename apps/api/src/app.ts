import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './config/index.js';
import { healthRouter } from './routes/health.js';
import { publicRouter } from './routes/public.js';
import { errorHandler } from './middleware/errorHandler.js';
import { sessionsRouter } from './routes/sessions.js';
import { createMemoryStore, SessionStore } from './data/sessionStore.js';

export function createApp(store: SessionStore = createMemoryStore()): Application {
  const app = express();

  app.use(
    helmet({
      contentSecurityPolicy: false, // Allow frontend dev & API consumers
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    })
  );

  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps, curl, server-to-server)
        if (!origin) return callback(null, true);
        if (config.allowedOrigins.includes(origin) || config.nodeEnv === 'development') {
          return callback(null, true);
        }
        return callback(new Error('Blocked by CORS policy'));
      },
      credentials: false, // bearer tokens, no cookies
      methods: ['GET', 'HEAD', 'OPTIONS', 'POST', 'PUT'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    })
  );

  app.use(express.json({ limit: '16kb' }));

  // Mount API routes
  app.use('/api/health', healthRouter);
  app.use('/api/public', publicRouter);
  app.use('/api/sessions', sessionsRouter(store));

  // 404 handler for API routes
  app.use('/api/*', (_req, res) => {
    res.status(404).json({
      success: false,
      error: {
        message: 'API route not found',
        statusCode: 404,
      },
    });
  });

  // Global error handler
  app.use(errorHandler);

  return app;
}
