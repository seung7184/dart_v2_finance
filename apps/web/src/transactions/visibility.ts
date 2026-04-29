export type TransactionVisibilityFilter =
  | 'all_active'
  | 'manual_only'
  | 'unmatched_manual'
  | 'match_suggested'
  | 'matched'
  | 'needs_review';

export type TransactionVisibilityMatchStatus = 'suggested' | 'confirmed' | 'rejected' | null;
export type TransactionVisibilityReviewStatus =
  | 'pending'
  | 'reviewed'
  | 'needs_attention'
  | 'auto_approved';

export type TransactionVisibilityRow = {
  id: string;
  matchStatus: TransactionVisibilityMatchStatus;
  reviewStatus: TransactionVisibilityReviewStatus;
  source: string;
};

function isManual(row: TransactionVisibilityRow): boolean {
  return row.source === 'manual';
}

function needsReview(row: TransactionVisibilityRow): boolean {
  return row.reviewStatus === 'pending' || row.reviewStatus === 'needs_attention';
}

export function filterTransactionsForView<T extends TransactionVisibilityRow>(
  rows: T[],
  filter: TransactionVisibilityFilter,
): T[] {
  return rows.filter((row) => {
    if (filter === 'all_active') {
      return !(isManual(row) && row.matchStatus === 'confirmed');
    }

    if (filter === 'manual_only') {
      return isManual(row);
    }

    if (filter === 'unmatched_manual') {
      return isManual(row) && (row.matchStatus === null || row.matchStatus === 'rejected');
    }

    if (filter === 'match_suggested') {
      return isManual(row) && row.matchStatus === 'suggested';
    }

    if (filter === 'matched') {
      return isManual(row) && row.matchStatus === 'confirmed';
    }

    return needsReview(row);
  });
}
