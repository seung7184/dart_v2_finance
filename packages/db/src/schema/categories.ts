import { pgTable, uuid, text, boolean, integer, timestamp } from 'drizzle-orm/pg-core';
import { users } from './users';

export const categories = pgTable('categories', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  icon: text('icon'),
  color: text('color'),
  parentId: uuid('parent_id'),
  isSystem: boolean('is_system').default(false),
  displayOrder: integer('display_order'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});
