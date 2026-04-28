import { and, eq, inArray, sql } from 'drizzle-orm';
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

    async bulkUpdate(input) {
      if (input.transactionIds.length === 0) {
        return { updatedCount: 0 };
      }

      const setValues: Partial<TransactionUpdate> = { updatedAt: input.updatedAt };

      if (input.intent !== undefined) {
        setValues.intent = input.intent as NonNullable<TransactionUpdate['intent']>;
      }
      if ('categoryId' in input) {
        // Allow explicit null to clear the category
        setValues.categoryId = input.categoryId ?? null;
      }
      if (input.reviewStatus !== undefined) {
        setValues.reviewStatus = input.reviewStatus as NonNullable<TransactionUpdate['reviewStatus']>;
      }

      // Only update if there's something to set beyond the timestamp
      const hasPayload = Object.keys(setValues).length > 1;
      if (!hasPayload) {
        return { updatedCount: 0 };
      }

      const result = await database
        .update(transactions)
        .set(setValues)
        .where(
          and(
            inArray(transactions.id, input.transactionIds),
            eq(transactions.userId, input.userId),
          ),
        )
        .returning({ id: transactions.id });

      return { updatedCount: result.length };
    },
  };
}
