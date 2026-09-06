import type { RequestHandler } from 'express';

/** Return an explicit placeholder, never a fake successful write. */
export function notImplemented(feature: string): RequestHandler {
  return (_req, res) => {
    res.status(501).json({
      error: {
        code: 'NOT_IMPLEMENTED',
        message: `${feature} is scaffolded but not connected yet.`,
      },
    });
  };
}
