import { describe, expect, it } from 'vitest';
import { confirmAllPendingReviews, confirmTransactionReview, type TransactionReviewRepository } from './review';

class FakeTransactionReviewRepository implements TransactionReviewRepository {
  public readonly updates: Array<{ reviewedAt: Date; transactionId: string; userId: string }> = [];
  public readonly bulkUpdates: Array<{ userId: string; reviewedAt: Date }> = [];
  private readonly transactions = new Map<string, { id: string; userId: string }>();

  addTransaction(id: string, userId: string) {
    this.transactions.set(id, { id, userId });
  }

  async findTransaction(transactionId: string) {
    return this.transactions.get(transactionId) ?? null;
  }

  async markReviewed(input: { reviewedAt: Date; transactionId: string; userId: string }) {
    this.updates.push(input);
  }

  async markAllPendingReviewed(userId: string, reviewedAt: Date) {
    this.bulkUpdates.push({ userId, reviewedAt });
  }
}

describe('confirmTransactionReview', () => {
  it('marks an owned transaction as reviewed', async () => {
    const repository = new FakeTransactionReviewRepository();
    repository.addTransaction('transaction-1', 'user-1');
    const reviewedAt = new Date('2026-04-22T10:00:00.000Z');

    await expect(
      confirmTransactionReview(
        {
          authenticatedUserId: 'user-1',
          reviewedAt,
          transactionId: 'transaction-1',
        },
        repository,
      ),
    ).resolves.toEqual({ status: 'reviewed' });

    expect(repository.updates).toEqual([
      {
        reviewedAt,
        transactionId: 'transaction-1',
        userId: 'user-1',
      },
    ]);
  });

  it('rejects confirming another user transaction', async () => {
    const repository = new FakeTransactionReviewRepository();
    repository.addTransaction('transaction-1', 'user-1');

    await expect(
      confirmTransactionReview(
        {
          authenticatedUserId: 'user-2',
          reviewedAt: new Date('2026-04-22T10:00:00.000Z'),
          transactionId: 'transaction-1',
        },
        repository,
      ),
    ).rejects.toThrow('TRANSACTION_ACCESS_DENIED');

    expect(repository.updates).toHaveLength(0);
  });
});

describe('confirmAllPendingReviews', () => {
  it('marks all pending transactions reviewed for the authenticated user', async () => {
    const repository = new FakeTransactionReviewRepository();
    const reviewedAt = new Date('2026-04-27T10:00:00.000Z');

    const result = await confirmAllPendingReviews(
      { authenticatedUserId: 'user-1', reviewedAt },
      repository,
    );

    expect(result).toEqual({ status: 'all_reviewed' });
    expect(repository.bulkUpdates).toEqual([{ userId: 'user-1', reviewedAt }]);
  });

  it('scopes bulk review to the authenticated user only', async () => {
    const repository = new FakeTransactionReviewRepository();

    await confirmAllPendingReviews(
      { authenticatedUserId: 'user-2', reviewedAt: new Date('2026-04-27T10:00:00.000Z') },
      repository,
    );

    expect(repository.bulkUpdates[0]?.userId).toBe('user-2');
    expect(repository.updates).toHaveLength(0);
  });
});
