import { and, eq } from 'drizzle-orm';
import { accounts, budgetPeriods, db, users, type Database } from '@dart/db';

export type SaveUserSetupInput = {
  paydayDay: number;
  expectedMonthlyIncome: number;
  plannedInvestingProtected: boolean;
};

export type SaveBudgetPeriodInput = {
  userId: string;
  year: number;
  month: number;
  plannedInvesting: number;
  investingProtected: boolean;
};

export type CreateDefaultAccountsInput = {
  userId: string;
  now: Date;
};

export type OnboardingRepository = {
  saveUserSetup(userId: string, input: SaveUserSetupInput, updatedAt: Date): Promise<void>;
  upsertBudgetPeriod(input: SaveBudgetPeriodInput, now: Date): Promise<void>;
  createDefaultAccountsIfMissing(input: CreateDefaultAccountsInput): Promise<void>;
};

export function createOnboardingRepository(database: Database = db): OnboardingRepository {
  return {
    async saveUserSetup(userId, input, updatedAt) {
      await database
        .update(users)
        .set({
          paydayDay: input.paydayDay,
          expectedMonthlyIncome: input.expectedMonthlyIncome,
          plannedInvestingProtected: input.plannedInvestingProtected,
          onboardingCompleted: true,
          updatedAt,
        })
        .where(eq(users.id, userId));
    },

    async upsertBudgetPeriod(input, now) {
      const existing = await database
        .select({ id: budgetPeriods.id })
        .from(budgetPeriods)
        .where(
          and(
            eq(budgetPeriods.userId, input.userId),
            eq(budgetPeriods.year, input.year),
            eq(budgetPeriods.month, input.month),
          ),
        )
        .limit(1);

      if (existing.length > 0) {
        await database
          .update(budgetPeriods)
          .set({
            plannedInvesting: input.plannedInvesting,
            investingProtected: input.investingProtected,
            updatedAt: now,
          })
          .where(
            and(
              eq(budgetPeriods.userId, input.userId),
              eq(budgetPeriods.year, input.year),
              eq(budgetPeriods.month, input.month),
            ),
          );
      } else {
        await database.insert(budgetPeriods).values({
          userId: input.userId,
          year: input.year,
          month: input.month,
          plannedInvesting: input.plannedInvesting,
          investingProtected: input.investingProtected,
          createdAt: now,
          updatedAt: now,
        });
      }
    },

    async createDefaultAccountsIfMissing({ userId, now }) {
      // Check if user already has accounts to avoid creating duplicates
      const existing = await database
        .select({ id: accounts.id, institution: accounts.institution })
        .from(accounts)
        .where(eq(accounts.userId, userId));

      const hasIng = existing.some(
        (a) =>
          a.institution?.toLowerCase() === 'ing',
      );
      const hasT212 = existing.some(
        (a) =>
          a.institution?.toLowerCase() === 'trading 212',
      );

      if (!hasIng) {
        await database.insert(accounts).values({
          userId,
          name: 'ING Checking',
          institution: 'ING',
          accountType: 'checking',
          currency: 'EUR',
          isAccessibleSavings: false,
          isActive: true,
          displayOrder: 1,
          createdAt: now,
          updatedAt: now,
        });
      }

      if (!hasT212) {
        await database.insert(accounts).values({
          userId,
          name: 'Trading 212 Portfolio',
          institution: 'Trading 212',
          accountType: 'brokerage',
          currency: 'EUR',
          isAccessibleSavings: false,
          isActive: true,
          displayOrder: 2,
          createdAt: now,
          updatedAt: now,
        });
      }
    },
  };
}
