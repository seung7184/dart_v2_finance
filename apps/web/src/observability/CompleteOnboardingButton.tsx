'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@dart/ui';
import { trackEvent } from './client';

export function CompleteOnboardingButton() {
  const router = useRouter();

  return (
    <Button
      type="button"
      onClick={() => {
        trackEvent('onboarding_completed', {
          source: 'onboarding_accounts',
          supportedBank: 'ING',
          supportedBroker: 'T212',
        });
        router.push('/dashboard');
      }}
    >
      Finish onboarding
    </Button>
  );
}
