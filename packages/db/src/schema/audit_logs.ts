import { pgTable, uuid, text, jsonb, timestamp } from 'drizzle-orm/pg-core';
import { users } from './users';

export const auditLogs = pgTable('audit_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  tableName: text('table_name').notNull(),
  recordId: uuid('record_id').notNull(),
  action: text('action').notNull(),
  changedFields: jsonb('changed_fields'),
  actor: text('actor'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});
