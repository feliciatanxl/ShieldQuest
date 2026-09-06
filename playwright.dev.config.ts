import { defineConfig } from '@playwright/test';

const port = Number(process.env.PLAYWRIGHT_DEV_PORT ?? 5173);
if (!Number.isInteger(port) || port < 1 || port > 65535)
  throw new Error('Invalid development port');
const baseURL = `http://localhost:${port}`;

export default defineConfig({
  testDir: './tests/dev',
  use: {
    baseURL,
    channel: process.env.PLAYWRIGHT_CHANNEL || undefined,
    trace: 'retain-on-failure',
  },
  webServer: [
    {
      command: 'npm run dev:server',
      url: 'http://127.0.0.1:3001/api/health',
      reuseExistingServer: !process.env.CI,
    },
    {
      command: `npm run dev:web -- --port ${port}`,
      url: baseURL,
      reuseExistingServer: !process.env.CI,
    },
  ],
});
