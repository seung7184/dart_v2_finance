import { describe, expect, it } from 'vitest';
import {
  shouldExcludeFromMonthlyAnalytics,
  summarizeManualTracking,
  summarizeMonthlyCumulativeSpendingRows,
} from './monthly';

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

describe('summarizeMonthlyCumulativeSpendingRows', () => {
  it('returns cumulative daily points that increase by transaction day', () => {
    const points = summarizeMonthlyCumulativeSpendingRows({
      year: 2026,
      month: 3,
      rows: [
        {
          amount: -1250,
          occurredAt: new Date('2026-03-01T10:00:00.000Z'),
          intent: 'living_expense',
          matchStatus: null,
          source: 'manual',
        },
        {
          amount: -400,
          occurredAt: new Date('2026-03-03T10:00:00.000Z'),
          intent: 'fee',
          matchStatus: null,
          source: 'ing_csv',
        },
      ],
    });

    expect(points[0]).toEqual({ day: 1, amountCents: 1250 });
    expect(points[1]).toEqual({ day: 2, amountCents: 1250 });
    expect(points[2]).toEqual({ day: 3, amountCents: 1650 });
    expect(points.at(-1)).toEqual({ day: 31, amountCents: 1650 });
  });

  it('carries zero-spend days forward from the previous cumulative amount', () => {
    const points = summarizeMonthlyCumulativeSpendingRows({
      year: 2026,
      month: 4,
      rows: [
        {
          amount: -999,
          occurredAt: new Date('2026-04-10T08:00:00.000Z'),
          intent: 'recurring_bill',
          matchStatus: null,
          source: 'manual',
        },
      ],
    });

    expect(points[8]).toEqual({ day: 9, amountCents: 0 });
    expect(points[9]).toEqual({ day: 10, amountCents: 999 });
    expect(points[10]).toEqual({ day: 11, amountCents: 999 });
  });

  it('excludes confirmed matched manual duplicates while keeping imported matched CSV rows', () => {
    const points = summarizeMonthlyCumulativeSpendingRows({
      year: 2026,
      month: 3,
      rows: [
        {
          amount: -2500,
          occurredAt: new Date('2026-03-05T10:00:00.000Z'),
          intent: 'living_expense',
          matchStatus: 'confirmed',
          source: 'manual',
        },
        {
          amount: -2500,
          occurredAt: new Date('2026-03-05T10:00:00.000Z'),
          intent: 'living_expense',
          matchStatus: 'confirmed',
          source: 'ing_csv',
        },
      ],
    });

    expect(points[4]).toEqual({ day: 5, amountCents: 2500 });
    expect(points.at(-1)).toEqual({ day: 31, amountCents: 2500 });
  });

  it('counts only spending intents using integer cents', () => {
    const points = summarizeMonthlyCumulativeSpendingRows({
      year: 2026,
      month: 3,
      rows: [
        {
          amount: -1234,
          occurredAt: new Date('2026-03-02T10:00:00.000Z'),
          intent: 'tax',
          matchStatus: null,
          source: 'manual',
        },
        {
          amount: 50000,
          occurredAt: new Date('2026-03-02T11:00:00.000Z'),
          intent: 'income_salary',
          matchStatus: null,
          source: 'ing_csv',
        },
        {
          amount: -321,
          occurredAt: new Date('2026-03-02T12:00:00.000Z'),
          intent: 'investment_contribution',
          matchStatus: null,
          source: 'ing_csv',
        },
      ],
    });

    expect(points[1]).toEqual({ day: 2, amountCents: 1234 });
    expect(Number.isInteger(points[1]?.amountCents)).toBe(true);
  });
});
