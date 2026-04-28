'use server';

import { redirect } from 'next/navigation';
import { getAuthenticatedUserIdFromRequestCookies } from '@/auth/session';
import { createOnboardingRepository } from './repository';
import { saveOnboardingSetup } from './service';

export async function completeOnboardingAction(formData: FormData): Promise<void> {
  const userId = await getAuthenticatedUserIdFromRequestCookies();

  if (!userId) {
    redirect('/sign-in');
  }

  const paydayRaw = formData.get('payday');
  const incomeRaw = formData.get('income');
  const investingRaw = formData.get('investing');
  const protectionRaw = formData.get('protection');

  const paydayDay = typeof paydayRaw === 'string' ? parseInt(paydayRaw, 10) : NaN;
  const expectedMonthlyIncludeCents = typeof incomeRaw === 'string' ? parseInt(incomeRaw, 10) : NaN;
  const plannedInvestingCents = typeof investingRaw === 'string' ? parseInt(investingRaw, 10) : NaN;
  const plannedInvestingProtected = protectionRaw !== 'off';

  if (
    !Number.isFinite(paydayDay) ||
    !Number.isFinite(expectedMonthlyIncludeCents) ||
    !Number.isFinite(plannedInvestingCents)
  ) {
    redirect('/onboarding/payday');
  }

  const now = new Date();
  const year = now.getUTCFullYear();
  const month = now.getUTCMonth() + 1;

  await saveOnboardingSetup(
    {
      authenticatedUserId: userId,
      paydayDay,
      expectedMonthlyIncludeCents,
      plannedInvestingCents,
      plannedInvestingProtected,
      year,
      month,
    },
    createOnboardingRepository(),
    now,
  );

  redirect('/dashboard');
}
