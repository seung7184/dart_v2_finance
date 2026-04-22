import { pgTable, uuid, integer, boolean, jsonb, timestamp } from 'drizzle-orm/pg-core';
import { users } from './users';

export const safeToSpendSnapshots = pgTable('safe_to_spend_snapshots', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  computedAt: timestamp('computed_at', { withTimezone: true }).notNull(),
  valueCents: integer('value_cents').notNull(),
  spendablePoolCents: integer('spendable_pool_cents').notNull(),
  daysUntilPayday: integer('days_until_payday').notNull(),
  availableCashCents: integer('available_cash_cents').notNull(),
  protectedTotalCents: integer('protected_total_cents').notNull(),
  upcomingBillsCents: integer('upcoming_bills_cents').notNull(),
  sinkingFundCents: integer('sinking_fund_cents').notNull(),
  minBufferCents: integer('min_buffer_cents').notNull(),
  investingCents: integer('investing_cents').notNull(),
  anomalyReserveCents: integer('anomaly_reserve_cents').notNull(),
  investingProtected: boolean('investing_protected').notNull(),
  assumptionTrail: jsonb('assumption_trail').notNull(),
  warnings: jsonb('warnings'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});
