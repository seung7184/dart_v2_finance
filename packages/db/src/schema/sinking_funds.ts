import { pgTable, uuid, text, integer, boolean, timestamp, date } from 'drizzle-orm/pg-core';
import { users } from './users';

export const sinkingFunds = pgTable('sinking_funds', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  targetAmount: integer('target_amount').notNull(),
  currency: text('currency').notNull().default('EUR'),
  monthlyAllocation: integer('monthly_allocation').notNull(),
  currentBalance: integer('current_balance'),
  targetDate: date('target_date'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});
