import 'dotenv/config';
import { defineConfig } from 'prisma/config';

export default defineConfig({
  schema: 'server/prisma/schema.prisma',
  migrations: { path: 'server/prisma/migrations' },
  datasource: {
    url:
      process.env.DATABASE_URL ??
      'postgresql://shieldquest:shieldquest_local@localhost:5432/shieldquest?schema=public',
  },
});
