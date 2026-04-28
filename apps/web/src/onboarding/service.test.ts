import { describe, expect, it } from 'vitest';
import type { OnboardingRepository } from './repository';
import { saveOnboardingSetup } from './service';

class FakeOnboardingRepository implements OnboardingRepository {
  public readonly userUpdates: Array<{ userId: string; paydayDay: number; income: number; protected: boolean }> = [];
  public readonly budgetUpserts: Array<{ userId: string; year: number; month: number; investing: number; protected: boolean }> = [];
  public accountsCreatedForUsers: string[] = [];

  async saveUserSetup(
    userId: string,
    input: { paydayDay: number; expectedMonthlyIncome: number; plannedInvestingProtected: boolean },
  ) {
    this.userUpdates.push({
      userId,
      paydayDay: input.paydayDay,
      income: input.expectedMonthlyIncome,
      protected: input.plannedInvestingProtected,
    });
  }

  async upsertBudgetPeriod(input: {
    userId: string;
    year: number;
    month: number;
    plannedInvesting: number;
    investingProtected: boolean;
  }) {
    this.budgetUpserts.push({
      userId: input.userId,
      year: input.year,
      month: input.month,
      investing: input.plannedInvesting,
      protected: input.investingProtected,
    });
  }

  async createDefaultAccountsIfMissing(input: { userId: string; now: Date }) {
    this.accountsCreatedForUsers.push(input.userId);
  }
}

describe('saveOnboardingSetup', () => {
  it('persists payday, income, investing, and protection to the repository', async () => {
    const repository = new FakeOnboardingRepository();
    const now = new Date('2026-04-27T10:00:00.000Z');

    const result = await saveOnboardingSetup(
      {
        authenticatedUserId: 'user-1',
        paydayDay: 25,
        expectedMonthlyIncludeCents: 350_000,
        plannedInvestingCents: 80_000,
        plannedInvestingProtected: true,
        year: 2026,
        month: 4,
      },
      repository,
      now,
    );

    expect(result).toEqual({ status: 'saved' });

    expect(repository.userUpdates).toEqual([
      {
        userId: 'user-1',
        paydayDay: 25,
        income: 350_000,
        protected: true,
      },
    ]);

    expect(repository.budgetUpserts).toEqual([
      {
        userId: 'user-1',
        year: 2026,
        month: 4,
        investing: 80_000,
        protected: true,
      },
    ]);
  });

  it('persists with investing protection OFF', async () => {
    const repository = new FakeOnboardingRepository();

    await saveOnboardingSetup(
      {
        authenticatedUserId: 'user-2',
        paydayDay: 1,
        expectedMonthlyIncludeCents: 200_000,
        plannedInvestingCents: 0,
        plannedInvestingProtected: false,
        year: 2026,
        month: 4,
      },
      repository,
    );

    expect(repository.userUpdates[0]?.protected).toBe(false);
    expect(repository.budgetUpserts[0]?.protected).toBe(false);
  });

  it('rejects payday day below 1', async () => {
    const repository = new FakeOnboardingRepository();

    await expect(
      saveOnboardingSetup(
        {
          authenticatedUserId: 'user-1',
          paydayDay: 0,
          expectedMonthlyIncludeCents: 350_000,
          plannedInvestingCents: 80_000,
          plannedInvestingProtected: true,
          year: 2026,
          month: 4,
        },
        repository,
      ),
    ).rejects.toThrow('INVALID_PAYDAY_DAY');

    expect(repository.userUpdates).toHaveLength(0);
  });

  it('rejects payday day above 31', async () => {
    const repository = new FakeOnboardingRepository();

    await expect(
      saveOnboardingSetup(
        {
          authenticatedUserId: 'user-1',
          paydayDay: 32,
          expectedMonthlyIncludeCents: 350_000,
          plannedInvestingCents: 80_000,
          plannedInvestingProtected: true,
          year: 2026,
          month: 4,
        },
        repository,
      ),
    ).rejects.toThrow('INVALID_PAYDAY_DAY');
  });

  it('rejects negative income', async () => {
    const repository = new FakeOnboardingRepository();

    await expect(
      saveOnboardingSetup(
        {
          authenticatedUserId: 'user-1',
          paydayDay: 25,
          expectedMonthlyIncludeCents: -1,
          plannedInvestingCents: 0,
          plannedInvestingProtected: true,
          year: 2026,
          month: 4,
        },
        repository,
      ),
    ).rejects.toThrow('INVALID_INCOME');
  });

  it('rejects negative investing amount', async () => {
    const repository = new FakeOnboardingRepository();

    await expect(
      saveOnboardingSetup(
        {
          authenticatedUserId: 'user-1',
          paydayDay: 25,
          expectedMonthlyIncludeCents: 350_000,
          plannedInvestingCents: -100,
          plannedInvestingProtected: true,
          year: 2026,
          month: 4,
        },
        repository,
      ),
    ).rejects.toThrow('INVALID_INVESTING');
  });

  it('creates default ING and T212 accounts during onboarding', async () => {
    const repository = new FakeOnboardingRepository();
    const now = new Date('2026-04-27T10:00:00.000Z');

    await saveOnboardingSetup(
      {
        authenticatedUserId: 'user-3',
        paydayDay: 25,
        expectedMonthlyIncludeCents: 350_000,
        plannedInvestingCents: 80_000,
        plannedInvestingProtected: true,
        year: 2026,
        month: 4,
      },
      repository,
      now,
    );

    expect(repository.accountsCreatedForUsers).toContain('user-3');
  });
});
