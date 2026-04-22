import {
  pgTable, uuid, text, integer, boolean, timestamp, index, unique,
} from 'drizzle-orm/pg-core';
import { users } from './users';
import { accounts } from './accounts';
import { categories } from './categories';
import { importBatches } from './import_batches';
import { intentEnum, reviewStatusEnum } from './enums';

export const transactions = pgTable('transactions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  accountId: uuid('account_id').notNull().references(() => accounts.id, { onDelete: 'cascade' }),

  // Source-of-truth fields — never modify after import
  source: text('source').notNull(),
  externalId: text('external_id'),
  occurredAt: timestamp('occurred_at', { withTimezone: true }).notNull(),
  settledAt: timestamp('settled_at', { withTimezone: true }),
  amount: integer('amount').notNull(),
  currency: text('currency').notNull().default('EUR'),
  rawDescription: text('raw_description').notNull(),
  importBatchId: uuid('import_batch_id').references(() => importBatches.id),

  // Classification fields — user/rules can modify
  normalizedDescription: text('normalized_description'),
  merchantName: text('merchant_name'),
  intent: intentEnum('intent').default('unclassified').notNull(),
  categoryId: uuid('category_id').references(() => categories.id),
  reviewStatus: reviewStatusEnum('review_status').default('pending').notNull(),
  notes: text('notes'),

  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (t) => ({
  uniqueExternalId: unique().on(t.accountId, t.externalId),
  idxUserOccurredAt: index('idx_transactions_user_occurred_at').on(t.userId, t.occurredAt),
  idxUserIntent: index('idx_transactions_user_intent').on(t.userId, t.intent),
  idxUserReviewStatus: index('idx_transactions_user_review_status').on(t.userId, t.reviewStatus),
}));
