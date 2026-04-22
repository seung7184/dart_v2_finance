import { existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { config as loadEnv } from 'dotenv';
import type { Config } from 'drizzle-kit';

const currentDir = dirname(fileURLToPath(import.meta.url));
const localEnvPath = resolve(currentDir, '.env.local');

if (existsSync(localEnvPath)) {
  loadEnv({ path: localEnvPath });
}

export default {
  schema: './src/schema/index.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env['DATABASE_URL'] ?? '',
  },
} satisfies Config;
