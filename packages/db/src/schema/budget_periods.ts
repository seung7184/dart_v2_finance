import { pgTable, uuid, text, integer, boolean, timestamp, unique } from 'drizzle-orm/pg-core';
import { users } from './users';

export const budgetPeriods = pgTable('budget_periods', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  year: integer('year').notNull(),
  month: integer('month').notNull(),
  expectedIncome: integer('expected_income'),
  plannedInvesting: integer('planned_investing'),
  investingProtected: boolean('investing_protected'),
  notes: text('notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (t) => ({
  uniqueUserYearMonth: unique().on(t.userId, t.year, t.month),
}));
