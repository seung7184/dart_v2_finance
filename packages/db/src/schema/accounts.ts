import { pgTable, uuid, text, boolean, integer, timestamp } from 'drizzle-orm/pg-core';
import { users } from './users';
import { accountTypeEnum } from './enums';

export const accounts = pgTable('accounts', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  institution: text('institution'),
  accountType: accountTypeEnum('account_type').notNull(),
  currency: text('currency').notNull().default('EUR'),
  isAccessibleSavings: boolean('is_accessible_savings').default(false),
  isActive: boolean('is_active').default(true),
  displayOrder: integer('display_order'),
  lastImportAt: timestamp('last_import_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});
