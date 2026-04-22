import { pgTable, uuid, text, integer, boolean, timestamp } from 'drizzle-orm/pg-core';
import { users } from './users';
import { accounts } from './accounts';
import { categories } from './categories';

export const recurringSeries = pgTable('recurring_series', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  accountId: uuid('account_id').references(() => accounts.id),
  name: text('name').notNull(),
  amount: integer('amount').notNull(),
  currency: text('currency').notNull().default('EUR'),
  intent: text('intent').notNull(),
  categoryId: uuid('category_id').references(() => categories.id),
  frequency: text('frequency').notNull(),
  dayOfMonth: integer('day_of_month'),
  monthOfYear: integer('month_of_year'),
  nextExpectedAt: timestamp('next_expected_at', { withTimezone: true }),
  lastMatchedAt: timestamp('last_matched_at', { withTimezone: true }),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});
