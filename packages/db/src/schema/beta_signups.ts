import { pgTable, text, timestamp, uuid, unique } from 'drizzle-orm/pg-core';

export const betaSignups = pgTable('beta_signups', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull(),
  primaryBank: text('primary_bank').notNull(),
  broker: text('broker').notNull(),
  reason: text('reason').notNull(),
  ticketId: text('ticket_id').notNull(),
  status: text('status').notNull().default('pending'),
  source: text('source').notNull().default('beta_page'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (t) => ({
  uniqueEmail: unique().on(t.email),
  uniqueTicketId: unique().on(t.ticketId),
}));
