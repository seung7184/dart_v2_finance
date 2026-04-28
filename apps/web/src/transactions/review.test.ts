import { describe, expect, it } from 'vitest';
import {
  bulkUpdateTransactions,
  confirmAllPendingReviews,
  confirmTransactionReview,
  type BulkUpdateInput,
  type TransactionReviewRepository,
  type ValidIntent,
} from './review';

class FakeTransactionReviewRepository implements TransactionReviewRepository {
  public readonly updates: Array<{ reviewedAt: Date; transactionId: string; userId: string }> = [];
  public readonly bulkUpdates: Array<{ userId: string; reviewedAt: Date }> = [];
  public readonly intentUpdates: Array<{ transactionId: string; userId: string; intent: ValidIntent }> = [];
  public readonly bulkUpdateCalls: BulkUpdateInput[] = [];
  private readonly transactionStore = new Map<string, { id: string; userId: string }>();

  addTransaction(id: string, userId: string) {
    this.transactionStore.set(id, { id, userId });
  }

  async findTransaction(transactionId: string) {
    return this.transactionStore.get(transactionId) ?? null;
  }

  async markReviewed(input: { reviewedAt: Date; transactionId: string; userId: string }) {
    this.updates.push(input);
  }

  async markAllPendingReviewed(userId: string, reviewedAt: Date) {
    this.bulkUpdates.push({ userId, reviewedAt });
  }

  async updateIntent(input: { transactionId: string; userId: string; intent: ValidIntent; updatedAt: Date }) {
    this.intentUpdates.push(input);
  }

  async bulkUpdate(input: BulkUpdateInput): Promise<{ updatedCount: number }> {
    this.bulkUpdateCalls.push(input);
    const owned = input.transactionIds.filter((id) => {
      const tx = this.transactionStore.get(id);
      return tx?.userId === input.userId;
    });
    return { updatedCount: owned.length };
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

describe('bulkUpdateTransactions', () => {
  it('returns zero count for empty id list', async () => {
    const repository = new FakeTransactionReviewRepository();
    const result = await bulkUpdateTransactions(
      {
        authenticatedUserId: 'user-1',
        transactionIds: [],
        intent: 'living_expense',
        updatedAt: new Date(),
      },
      repository,
    );
    expect(result).toEqual({ status: 'updated', updatedCount: 0 });
    expect(repository.bulkUpdateCalls).toHaveLength(0);
  });

  it('passes intent and categoryId to repository', async () => {
    const repository = new FakeTransactionReviewRepository();
    repository.addTransaction('tx-1', 'user-1');
    repository.addTransaction('tx-2', 'user-1');

    const updatedAt = new Date('2026-04-28T10:00:00.000Z');
    const result = await bulkUpdateTransactions(
      {
        authenticatedUserId: 'user-1',
        transactionIds: ['tx-1', 'tx-2'],
        intent: 'living_expense',
        categoryId: 'cat-groceries',
        updatedAt,
      },
      repository,
    );

    expect(result.status).toBe('updated');
    expect(result.updatedCount).toBe(2);
    expect(repository.bulkUpdateCalls[0]).toMatchObject({
      transactionIds: ['tx-1', 'tx-2'],
      userId: 'user-1',
      intent: 'living_expense',
      categoryId: 'cat-groceries',
    });
  });

  it('scopes update to authenticated user transactions only', async () => {
    const repository = new FakeTransactionReviewRepository();
    repository.addTransaction('tx-user1', 'user-1');
    repository.addTransaction('tx-user2', 'user-2');

    const result = await bulkUpdateTransactions(
      {
        authenticatedUserId: 'user-1',
        transactionIds: ['tx-user1', 'tx-user2'],
        reviewStatus: 'reviewed',
        updatedAt: new Date(),
      },
      repository,
    );

    // Only user-1's transaction counts (the fake filters by ownership)
    expect(result.updatedCount).toBe(1);
    expect(repository.bulkUpdateCalls[0]?.userId).toBe('user-1');
  });
});
