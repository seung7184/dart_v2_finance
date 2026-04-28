import { describe, expect, it } from 'vitest';
import { getDatabaseRuntimeErrorMessage, getTransactionsRuntimeState } from './runtime';

describe('getTransactionsRuntimeState', () => {
  it('marks transactions unavailable when DATABASE_URL is missing', () => {
    expect(getTransactionsRuntimeState({})).toEqual({
      databaseConfigured: false,
      message: 'DATABASE_URL is required to load imported transactions.',
    });
  });

  it('marks transactions available when DATABASE_URL is configured', () => {
    expect(
      getTransactionsRuntimeState({
        DATABASE_URL: 'postgres://user:pass@localhost:5432/dart',
      }),
    ).toEqual({
      databaseConfigured: true,
      message: null,
    });
  });
});

describe('getDatabaseRuntimeErrorMessage', () => {
  it('returns a safe configuration hint for DNS failures without exposing the host', () => {
    expect(
      getDatabaseRuntimeErrorMessage(
        new Error('getaddrinfo ENOTFOUND db.example.supabase.co'),
      ),
    ).toBe(
      'Database host could not be resolved. Check DATABASE_URL in .env.local, then restart the web server.',
    );
  });

  it('returns a generic database failure message for other errors', () => {
    expect(getDatabaseRuntimeErrorMessage(new Error('connection timeout'))).toBe(
      'Database connection failed. Check DATABASE_URL and Supabase status, then restart the web server.',
    );
  });
});
