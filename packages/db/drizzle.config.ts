import { existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { config as loadEnv } from 'dotenv';
import type { Config } from 'drizzle-kit';

const currentDir = dirname(fileURLToPath(import.meta.url));
const localEnvPath = resolve(currentDir, '.env.local');
const rootEnvPath = resolve(currentDir, '../../.env.local');

if (existsSync(localEnvPath)) {
  loadEnv({ path: localEnvPath });
}

if (existsSync(rootEnvPath)) {
  loadEnv({ path: rootEnvPath, override: false });
}

const databaseUrl = process.env['DATABASE_URL'];
if (!databaseUrl) {
  throw new Error(
    'DATABASE_URL is required for Drizzle commands. Add it to packages/db/.env.local or the repo root .env.local before running db:generate or db:migrate.',
  );
}

export default {
  schema: './src/schema/index.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: databaseUrl,
  },
} satisfies Config;
