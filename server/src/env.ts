/**
 * Configuration, read once at startup.
 *
 * A missing DATABASE_URL is not fatal: the server still starts and answers
 * `/api/health` with 503, so a misconfigured deploy says what is wrong instead
 * of crash-looping with nothing in the logs but a stack trace.
 */
function list(value: string | undefined): string[] {
  return (value ?? '')
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean);
}

export const env = {
  databaseUrl: process.env.DATABASE_URL ?? '',
  databaseSsl: process.env.DATABASE_SSL === 'true',
  port: Number(process.env.PORT ?? 8787),
  corsOrigins: list(process.env.CORS_ORIGINS ?? 'http://localhost:5173'),
  facilitatorKey: process.env.FACILITATOR_KEY ?? '',
  retentionDays: Math.max(1, Number(process.env.DATA_RETENTION_DAYS ?? 90)),
};
