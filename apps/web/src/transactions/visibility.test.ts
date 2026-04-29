import { describe, expect, it } from 'vitest';
import { filterTransactionsForView, type TransactionVisibilityFilter, type TransactionVisibilityRow } from './visibility';

const baseRow: TransactionVisibilityRow = {
  id: 'imported-1',
  matchStatus: null,
  reviewStatus: 'reviewed',
  source: 'ing_csv',
};

function row(overrides: Partial<TransactionVisibilityRow>): TransactionVisibilityRow {
  return { ...baseRow, ...overrides };
}

function idsFor(filter: TransactionVisibilityFilter, rows: TransactionVisibilityRow[]): string[] {
  return filterTransactionsForView(rows, filter).map((item) => item.id);
}

describe('filterTransactionsForView', () => {
  const rows: TransactionVisibilityRow[] = [
    row({ id: 'imported', source: 'ing_csv' }),
    row({ id: 'manual-unmatched', source: 'manual', matchStatus: null }),
    row({ id: 'manual-suggested', source: 'manual', matchStatus: 'suggested' }),
    row({ id: 'manual-confirmed', source: 'manual', matchStatus: 'confirmed' }),
    row({ id: 'manual-rejected', source: 'manual', matchStatus: 'rejected' }),
    row({ id: 'needs-review', reviewStatus: 'needs_attention', source: 't212_csv' }),
  ];

  it('shows active imported, unmatched manual, and suggested manual rows by default', () => {
    expect(idsFor('all_active', rows)).toEqual([
      'imported',
      'manual-unmatched',
      'manual-suggested',
      'manual-rejected',
      'needs-review',
    ]);
  });

  it('shows only confirmed matched manual rows in the matched filter', () => {
    expect(idsFor('matched', rows)).toEqual(['manual-confirmed']);
  });

  it('supports manual and review-focused filters', () => {
    expect(idsFor('manual_only', rows)).toEqual([
      'manual-unmatched',
      'manual-suggested',
      'manual-confirmed',
      'manual-rejected',
    ]);
    expect(idsFor('unmatched_manual', rows)).toEqual(['manual-unmatched', 'manual-rejected']);
    expect(idsFor('match_suggested', rows)).toEqual(['manual-suggested']);
    expect(idsFor('needs_review', rows)).toEqual(['needs-review']);
  });
});
