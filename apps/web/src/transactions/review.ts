export type TransactionReviewRepository = {
  findTransaction(transactionId: string): Promise<{ id: string; userId: string } | null>;
  markReviewed(input: {
    reviewedAt: Date;
    transactionId: string;
    userId: string;
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
