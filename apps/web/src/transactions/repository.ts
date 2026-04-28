import { and, eq, inArray } from 'drizzle-orm';
import { db, transactions, type Database } from '@dart/db';
import type { TransactionReviewRepository, ValidIntent } from './review';

type QueryableDatabase = Database;
type TransactionUpdate = typeof transactions.$inferInsert;

export function createTransactionReviewRepository(
  database: QueryableDatabase = db,
): TransactionReviewRepository {
  return {
    async findTransaction(transactionId) {
      const [transaction] = await database
        .select({ id: transactions.id, userId: transactions.userId })
        .from(transactions)
        .where(eq(transactions.id, transactionId))
        .limit(1);

      return transaction ?? null;
    },

    async markReviewed(input) {
      await database
        .update(transactions)
        .set({
          reviewStatus: 'reviewed' as NonNullable<TransactionUpdate['reviewStatus']>,
          updatedAt: input.reviewedAt,
        })
        .where(
          and(
            eq(transactions.id, input.transactionId),
            eq(transactions.userId, input.userId),
          ),
        );
    },

    async markAllPendingReviewed(userId, reviewedAt) {
      await database
        .update(transactions)
        .set({
          reviewStatus: 'reviewed' as NonNullable<TransactionUpdate['reviewStatus']>,
          updatedAt: reviewedAt,
        })
        .where(
          and(
            eq(transactions.userId, userId),
            inArray(transactions.reviewStatus, ['pending', 'needs_attention'] as NonNullable<TransactionUpdate['reviewStatus']>[]),
          ),
        );
    },

    async updateIntent(input) {
      await database
        .update(transactions)
        .set({
          intent: input.intent as NonNullable<TransactionUpdate['intent']>,
          updatedAt: input.updatedAt,
        })
        .where(
          and(
            eq(transactions.id, input.transactionId),
            eq(transactions.userId, input.userId),
          ),
        );
    },
  };
}
