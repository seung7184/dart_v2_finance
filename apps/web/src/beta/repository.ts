import { eq } from 'drizzle-orm';
import { betaSignups, db, type Database } from '@dart/db';
import type { BetaSignupRepository } from './signup';

type QueryableDatabase = Database;

export function createBetaSignupRepository(
  database: QueryableDatabase = db,
): BetaSignupRepository {
  return {
    async createSignup(input) {
      const [createdSignup] = await database
        .insert(betaSignups)
        .values({
          broker: input.broker,
          createdAt: input.createdAt,
          email: input.email,
          primaryBank: input.primaryBank,
          reason: input.reason,
          source: input.source,
          status: input.status,
          ticketId: input.ticketId,
          updatedAt: input.createdAt,
        })
        .returning({
          createdAt: betaSignups.createdAt,
          email: betaSignups.email,
          ticketId: betaSignups.ticketId,
        });

      if (!createdSignup) {
        throw new Error('FAILED_TO_CREATE_BETA_SIGNUP');
      }

      return createdSignup;
    },

    async findSignupByEmail(email) {
      const [signup] = await database
        .select({
          createdAt: betaSignups.createdAt,
          email: betaSignups.email,
          ticketId: betaSignups.ticketId,
        })
        .from(betaSignups)
        .where(eq(betaSignups.email, email))
        .limit(1);

      return signup ?? null;
    },
  };
}
