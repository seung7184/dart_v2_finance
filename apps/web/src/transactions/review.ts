export type ValidIntent =
  | 'living_expense'
  | 'recurring_bill'
  | 'income_salary'
  | 'income_dividend'
  | 'income_refund'
  | 'income_other'
  | 'transfer'
  | 'reimbursement_out'
  | 'reimbursement_in'
  | 'investment_contribution'
  | 'investment_buy'
  | 'investment_sell'
  | 'fee'
  | 'tax'
  | 'adjustment'
  | 'unclassified';

export const VALID_INTENTS: ReadonlySet<string> = new Set<ValidIntent>([
  'living_expense',
  'recurring_bill',
  'income_salary',
  'income_dividend',
  'income_refund',
  'income_other',
  'transfer',
  'reimbursement_out',
  'reimbursement_in',
  'investment_contribution',
  'investment_buy',
  'investment_sell',
  'fee',
  'tax',
  'adjustment',
  'unclassified',
]);

export function isValidIntent(value: string): value is ValidIntent {
  return VALID_INTENTS.has(value);
}

export type TransactionReviewRepository = {
  findTransaction(transactionId: string): Promise<{ id: string; userId: string } | null>;
  markReviewed(input: {
    reviewedAt: Date;
    transactionId: string;
    userId: string;
  }): Promise<void>;
  markAllPendingReviewed(userId: string, reviewedAt: Date): Promise<void>;
  updateIntent(input: {
    transactionId: string;
    userId: string;
    intent: ValidIntent;
    updatedAt: Date;
  }): Promise<void>;
};

export async function confirmTransactionReview(
  input: {
    authenticatedUserId: string;
    reviewedAt: Date;
    transactionId: string;
  },
  repository: TransactionReviewRepository,
): Promise<{ status: 'reviewed' }> {
  const transaction = await repository.findTransaction(input.transactionId);

  if (!transaction) {
    throw new Error('TRANSACTION_NOT_FOUND');
  }

  if (transaction.userId !== input.authenticatedUserId) {
    throw new Error('TRANSACTION_ACCESS_DENIED');
  }

  await repository.markReviewed({
    reviewedAt: input.reviewedAt,
    transactionId: input.transactionId,
    userId: input.authenticatedUserId,
  });

  return { status: 'reviewed' };
}

export async function confirmAllPendingReviews(
  input: {
    authenticatedUserId: string;
    reviewedAt: Date;
  },
  repository: TransactionReviewRepository,
): Promise<{ status: 'all_reviewed' }> {
  await repository.markAllPendingReviewed(input.authenticatedUserId, input.reviewedAt);
  return { status: 'all_reviewed' };
}

export async function updateTransactionIntent(
  input: {
    authenticatedUserId: string;
    transactionId: string;
    intent: ValidIntent;
    updatedAt: Date;
  },
  repository: TransactionReviewRepository,
): Promise<{ status: 'updated' }> {
  const transaction = await repository.findTransaction(input.transactionId);

  if (!transaction) {
    throw new Error('TRANSACTION_NOT_FOUND');
  }

  if (transaction.userId !== input.authenticatedUserId) {
    throw new Error('TRANSACTION_ACCESS_DENIED');
  }

  await repository.updateIntent({
    transactionId: input.transactionId,
    userId: input.authenticatedUserId,
    intent: input.intent,
    updatedAt: input.updatedAt,
  });

  return { status: 'updated' };
}
