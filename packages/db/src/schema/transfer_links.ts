import { pgTable, uuid, text, timestamp, unique } from 'drizzle-orm/pg-core';
import { users } from './users';
import { transactions } from './transactions';

export const transferLinks = pgTable('transfer_links', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  fromTransactionId: uuid('from_transaction_id').notNull().references(() => transactions.id, { onDelete: 'cascade' }),
  toTransactionId: uuid('to_transaction_id').notNull().references(() => transactions.id, { onDelete: 'cascade' }),
  confirmedBy: text('confirmed_by'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (t) => ({
  uniqueFrom: unique().on(t.fromTransactionId),
  uniqueTo: unique().on(t.toTransactionId),
}));
