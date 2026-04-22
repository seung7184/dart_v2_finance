import { pgTable, uuid, text, integer, timestamp, unique } from 'drizzle-orm/pg-core';
import { users } from './users';
import { accounts } from './accounts';

export const importBatches = pgTable('import_batches', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  accountId: uuid('account_id').notNull().references(() => accounts.id, { onDelete: 'cascade' }),
  source: text('source').notNull(),
  originalFilename: text('original_filename'),
  fileHash: text('file_hash').notNull(),
  rowCount: integer('row_count'),
  importedCount: integer('imported_count'),
  duplicateCount: integer('duplicate_count'),
  reviewStatus: text('review_status'),
  importStartedAt: timestamp('import_started_at', { withTimezone: true }),
  importCompletedAt: timestamp('import_completed_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (t) => ({
  uniqueFileHash: unique().on(t.userId, t.fileHash),
}));
