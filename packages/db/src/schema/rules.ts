import { pgTable, uuid, text, integer, boolean, timestamp } from 'drizzle-orm/pg-core';
import { users } from './users';
import { categories } from './categories';

export const rules = pgTable('rules', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: text('name'),
  matchField: text('match_field').notNull(),
  matchOperator: text('match_operator').notNull(),
  matchValue: text('match_value').notNull(),
  setIntent: text('set_intent'),
  setCategoryId: uuid('set_category_id').references(() => categories.id),
  setMerchantName: text('set_merchant_name'),
  priority: integer('priority'),
  isActive: boolean('is_active').default(true),
  appliedCount: integer('applied_count').default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});
