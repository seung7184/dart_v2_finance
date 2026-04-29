import { describe, expect, it } from 'vitest';
import { shouldExcludeFromMonthlyAnalytics, summarizeManualTracking } from './monthly';

describe('shouldExcludeFromMonthlyAnalytics', () => {
  it('excludes only confirmed matched manual transactions', () => {
    expect(
      shouldExcludeFromMonthlyAnalytics({
        matchStatus: 'confirmed',
        source: 'manual',
      }),
    ).toBe(true);
    expect(
      shouldExcludeFromMonthlyAnalytics({
        matchStatus: 'suggested',
        source: 'manual',
      }),
    ).toBe(false);
    expect(
      shouldExcludeFromMonthlyAnalytics({
        matchStatus: 'rejected',
        source: 'manual',
      }),
    ).toBe(false);
    expect(
      shouldExcludeFromMonthlyAnalytics({
        matchStatus: 'confirmed',
        source: 'ing_csv',
      }),
    ).toBe(false);
  });
});

describe('summarizeManualTracking', () => {
  it('counts suggested and rejected manual rows as active while separating confirmed matches', () => {
    const summary = summarizeManualTracking([
      { matchStatus: null, source: 'manual' },
      { matchStatus: 'suggested', source: 'manual' },
      { matchStatus: 'confirmed', source: 'manual' },
      { matchStatus: 'rejected', source: 'manual' },
      { matchStatus: 'confirmed', source: 'ing_csv' },
    ]);

    expect(summary).toEqual({
      confirmedMatchedManualCount: 1,
      manualTransactionCount: 4,
      suggestedMatchCount: 1,
      unmatchedManualCount: 2,
    });
  });
});
