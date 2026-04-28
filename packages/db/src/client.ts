import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

type DrizzleDb = ReturnType<typeof drizzle<typeof schema>>;

// Survive Next.js HMR: store singleton on globalThis so module re-execution
// during hot reload doesn't create a new pool while the old one stays open.
declare global {
  // eslint-disable-next-line no-var
  var __dartDb: DrizzleDb | undefined;
}

function createDatabase(): DrizzleDb {
  const connectionString = process.env['DATABASE_URL'];
  if (!connectionString) {
    throw new Error(
      'DATABASE_URL environment variable is required before using @dart/db runtime queries.',
    );
  }

  const client = postgres(connectionString, {
    // Keep pool small in local dev to avoid exhausting Supabase connection slots.
    // Supabase local projects default to ~97 connections; 3 per Next.js worker leaves
    // plenty of headroom for the dashboard, Table Editor, and other tools.
    max: 3,
    // Release idle connections after 20 s so slots are returned when dev server is idle.
    idle_timeout: 20,
    // Recycle connections every 30 min to avoid stale state after Supabase restarts.
    max_lifetime: 1800,
  });

  return drizzle(client, { schema });
}

export function getDb(): DrizzleDb {
  if (!globalThis.__dartDb) {
    globalThis.__dartDb = createDatabase();
  }

  return globalThis.__dartDb;
}

export const db = new Proxy({} as DrizzleDb, {
  get(_target, property) {
    return getDb()[property as keyof DrizzleDb];
  },
});

export type Database = DrizzleDb;
