import type { OnboardingRepository } from './repository';

export type OnboardingSetupInput = {
  authenticatedUserId: string;
  paydayDay: number;
  expectedMonthlyIncludeCents: number;
  plannedInvestingCents: number;
  plannedInvestingProtected: boolean;
  year: number;
  month: number;
};

export type OnboardingSetupResult = {
  status: 'saved';
};

export async function saveOnboardingSetup(
  input: OnboardingSetupInput,
  repository: OnboardingRepository,
  now: Date = new Date(),
): Promise<OnboardingSetupResult> {
  if (input.paydayDay < 1 || input.paydayDay > 31) {
    throw new Error('INVALID_PAYDAY_DAY');
  }

  if (input.expectedMonthlyIncludeCents < 0) {
    throw new Error('INVALID_INCOME');
  }

  if (input.plannedInvestingCents < 0) {
    throw new Error('INVALID_INVESTING');
  }

  await repository.saveUserSetup(
    input.authenticatedUserId,
    {
      paydayDay: input.paydayDay,
      expectedMonthlyIncome: input.expectedMonthlyIncludeCents,
      plannedInvestingProtected: input.plannedInvestingProtected,
    },
    now,
  );

  await repository.upsertBudgetPeriod(
    {
      userId: input.authenticatedUserId,
      year: input.year,
      month: input.month,
      plannedInvesting: input.plannedInvestingCents,
      investingProtected: input.plannedInvestingProtected,
    },
    now,
  );

  await repository.createDefaultAccountsIfMissing({
    userId: input.authenticatedUserId,
    now,
  });

  return { status: 'saved' };
}
