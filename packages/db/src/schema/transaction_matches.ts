import { sql } from 'drizzle-orm';
import {
  check,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
} from 'drizzle-orm/pg-core';
import { users } from './users';
import { transactions } from './transactions';

export const transactionMatches = pgTable('transaction_matches', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  manualTransactionId: uuid('manual_transaction_id')
    .notNull()
    .references(() => transactions.id, { onDelete: 'cascade' }),
  importedTransactionId: uuid('imported_transaction_id')
    .notNull()
    .references(() => transactions.id, { onDelete: 'cascade' }),
  matchStatus: text('match_status').notNull().default('suggested'),
  matchConfidence: integer('match_confidence').notNull(),
  matchReason: text('match_reason').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (t) => ({
  idxImportedTransaction: index('idx_transaction_matches_imported_transaction_id')
    .on(t.importedTransactionId),
  idxManualTransaction: index('idx_transaction_matches_manual_transaction_id')
    .on(t.manualTransactionId),
  idxMatchStatus: index('idx_transaction_matches_match_status').on(t.matchStatus),
  idxUser: index('idx_transaction_matches_user_id').on(t.userId),
  matchStatusCheck: check(
    'transaction_matches_match_status_check',
    sql`${t.matchStatus} in ('suggested', 'confirmed', 'rejected')`,
  ),
  uniqueManualImportedPair: unique('transaction_matches_manual_imported_unique')
    .on(t.manualTransactionId, t.importedTransactionId),
}));
