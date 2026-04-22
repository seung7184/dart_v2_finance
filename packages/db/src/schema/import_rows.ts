import { pgTable, uuid, text, integer, jsonb, timestamp } from 'drizzle-orm/pg-core';
import { users } from './users';
import { importBatches } from './import_batches';
import { transactions } from './transactions';

export const importRows = pgTable('import_rows', {
  id: uuid('id').primaryKey().defaultRandom(),
  importBatchId: uuid('import_batch_id').notNull().references(() => importBatches.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  rowIndex: integer('row_index').notNull(),
  rawData: jsonb('raw_data').notNull(),
  parseStatus: text('parse_status').notNull(),
  parseError: text('parse_error'),
  transactionId: uuid('transaction_id').references(() => transactions.id),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});
