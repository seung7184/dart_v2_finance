import { and, eq } from 'drizzle-orm';
import {
  accounts,
  categories,
  db,
  importBatches,
  importRows,
  transactionMatches,
  transactions,
  type Database,
} from '@dart/db';
import type { ImportRepository } from './service';

type QueryableDatabase = Database;
type TransactionInsert = typeof transactions.$inferInsert;

export function createImportRepository(database: QueryableDatabase = db): ImportRepository {
  return {
    async completeImportBatch(input) {
      await database
        .update(importBatches)
        .set({
          duplicateCount: input.duplicateCount,
          importedCount: input.importedCount,
          importCompletedAt: input.importCompletedAt,
          reviewStatus: input.reviewStatus as NonNullable<TransactionInsert['reviewStatus']>,
          rowCount: input.rowCount,
          updatedAt: input.importCompletedAt,
        })
        .where(eq(importBatches.id, input.batchId));
    },

    async createImportBatch(input) {
      const [createdBatch] = await database
        .insert(importBatches)
        .values({
          accountId: input.accountId,
          fileHash: input.fileHash,
          importStartedAt: input.importStartedAt,
          originalFilename: input.originalFilename,
          reviewStatus: input.reviewStatus,
          rowCount: input.rowCount,
          source: input.source,
          userId: input.userId,
          updatedAt: input.importStartedAt,
        })
        .returning({ id: importBatches.id });

      if (!createdBatch) {
        throw new Error('FAILED_TO_CREATE_IMPORT_BATCH');
      }

      return createdBatch;
    },

    async createImportRow(input) {
      await database.insert(importRows).values({
        importBatchId: input.importBatchId,
        parseError: input.parseError,
        parseStatus: input.parseStatus,
        rawData: input.rawData,
        rowIndex: input.rowIndex,
        transactionId: input.transactionId,
        userId: input.userId,
      });
    },

    async createTransaction(input) {
      const [createdTransaction] = await database
        .insert(transactions)
        .values({
          accountId: input.accountId,
          amount: input.amount,
          categoryId: input.categoryId ?? null,
          currency: input.currency,
          externalId: input.externalId,
          importBatchId: input.importBatchId,
          intent: input.intent as NonNullable<TransactionInsert['intent']>,
          merchantName: input.merchantName ?? null,
          merchantCategory: input.merchantCategory ?? null,
          normalizedMerchantName: input.normalizedMerchantName ?? null,
          occurredAt: input.occurredAt,
          rawDescription: input.rawDescription,
          reviewStatus: input.reviewStatus,
          source: input.source,
          userId: input.userId,
        })
        .returning({ id: transactions.id });

      if (!createdTransaction) {
        throw new Error('FAILED_TO_CREATE_TRANSACTION');
      }

      return createdTransaction;
    },

    async createSuggestedTransactionMatch(input) {
      await database
        .insert(transactionMatches)
        .values({
          importedTransactionId: input.importedTransactionId,
          manualTransactionId: input.manualTransactionId,
          matchConfidence: input.matchConfidence,
          matchReason: input.matchReason,
          matchStatus: 'suggested',
          userId: input.userId,
        })
        .onConflictDoNothing();
    },

    async findCategoryByName(name) {
      const [category] = await database
        .select({ id: categories.id })
        .from(categories)
        .where(eq(categories.name, name))
        .limit(1);

      return category ?? null;
    },

    async findAccount(accountId) {
      const [account] = await database
        .select({ id: accounts.id, userId: accounts.userId })
        .from(accounts)
        .where(eq(accounts.id, accountId))
        .limit(1);

      return account ?? null;
    },

    async findExistingBatchByFileHash(userId, fileHash) {
      const [batch] = await database
        .select({
          id: importBatches.id,
          duplicateCount: importBatches.duplicateCount,
          importedCount: importBatches.importedCount,
          rowCount: importBatches.rowCount,
        })
        .from(importBatches)
        .where(and(eq(importBatches.userId, userId), eq(importBatches.fileHash, fileHash)))
        .limit(1);

      return batch ?? null;
    },

    async findManualMatchCandidates(userId) {
      const rows = await database
        .select({
          accountId: transactions.accountId,
          accountType: accounts.accountType,
          amountCents: transactions.amount,
          id: transactions.id,
          merchantName: transactions.merchantName,
          occurredAt: transactions.occurredAt,
          rawDescription: transactions.rawDescription,
          source: transactions.source,
          userId: transactions.userId,
        })
        .from(transactions)
        .innerJoin(accounts, eq(transactions.accountId, accounts.id))
        .where(and(eq(transactions.userId, userId), eq(transactions.source, 'manual')));

      return rows.map((row) => ({
        accountId: row.accountId,
        accountType: row.accountType,
        amountCents: row.amountCents,
        id: row.id,
        merchantName: row.merchantName ?? null,
        occurredAt: row.occurredAt,
        rawDescription: row.rawDescription,
        source: 'manual' as const,
        userId: row.userId,
      }));
    },

    async findTransactionByExternalId(accountId, externalId) {
      const [transaction] = await database
        .select({ id: transactions.id })
        .from(transactions)
        .where(
          and(eq(transactions.accountId, accountId), eq(transactions.externalId, externalId)),
        )
        .limit(1);

      return transaction ?? null;
    },

    async findTransactionByFallback(input) {
      const [transaction] = await database
        .select({ id: transactions.id })
        .from(transactions)
        .where(
          and(
            eq(transactions.accountId, input.accountId),
            eq(transactions.amount, input.amount),
            eq(transactions.occurredAt, input.occurredAt),
            eq(transactions.rawDescription, input.rawDescription),
          ),
        )
        .limit(1);

      return transaction ?? null;
    },

    async touchAccountLastImport(accountId, importedAt) {
      await database
        .update(accounts)
        .set({
          lastImportAt: importedAt,
          updatedAt: importedAt,
        })
        .where(eq(accounts.id, accountId));
    },
  };
}
