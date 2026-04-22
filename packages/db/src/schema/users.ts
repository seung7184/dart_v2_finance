import { pgTable, uuid, text, integer, boolean, timestamp } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: uuid('id').primaryKey(),
  email: text('email').notNull(),
  displayName: text('display_name'),
  paydayDay: integer('payday_day'),
  paydayType: text('payday_type'),
  expectedMonthlyIncome: integer('expected_monthly_income'),
  minimumCashBuffer: integer('minimum_cash_buffer').default(0),
  plannedInvestingProtected: boolean('planned_investing_protected').default(true),
  locale: text('locale').default('en'),
  currency: text('currency').default('EUR'),
  onboardingCompleted: boolean('onboarding_completed').default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});
