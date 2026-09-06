import 'dotenv/config';
import { app } from './app.js';

const port = Number(process.env.PORT ?? 3001);
const server = app.listen(port, '127.0.0.1', () => {
  console.log(`ShieldQuest API: http://127.0.0.1:${port}/api/health (scaffold mode)`);
});
for (const signal of ['SIGINT', 'SIGTERM'] as const) {
  process.on(signal, () => server.close(() => process.exit(0)));
}
