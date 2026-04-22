import { pgTable, uuid, text, integer, timestamp } from 'drizzle-orm/pg-core';
import { users } from './users';
import { transactions } from './transactions';

export const reimbursementLinks = pgTable('reimbursement_links', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  outTransactionId: uuid('out_transaction_id').notNull().references(() => transactions.id, { onDelete: 'cascade' }),
  inTransactionId: uuid('in_transaction_id').references(() => transactions.id),
  expectedAmount: integer('expected_amount'),
  currency: text('currency').notNull().default('EUR'),
  status: text('status').notNull(),
  notes: text('notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});
