import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

let database: ReturnType<typeof drizzle<typeof schema>> | null = null;

function createDatabase() {
  const connectionString = process.env['DATABASE_URL'];
  if (!connectionString) {
    throw new Error(
      'DATABASE_URL environment variable is required before using @dart/db runtime queries.',
    );
  }

  const client = postgres(connectionString);
  return drizzle(client, { schema });
}

export function getDb() {
  if (!database) {
    database = createDatabase();
  }

  return database;
}

export const db = new Proxy({} as ReturnType<typeof getDb>, {
  get(_target, property) {
    return getDb()[property as keyof ReturnType<typeof getDb>];
  },
});

export type Database = ReturnType<typeof getDb>;
