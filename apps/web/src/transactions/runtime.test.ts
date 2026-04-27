import { describe, expect, it } from 'vitest';
import { getTransactionsRuntimeState } from './runtime';

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
