import { createApp } from './app.js';
import { config } from './config/index.js';

const app = createApp();

app.listen(config.port, () => {
  console.log(`[ShieldQuest API] Service running on http://localhost:${config.port}`);
  console.log(`[ShieldQuest API] Environment: ${config.nodeEnv}`);
});
