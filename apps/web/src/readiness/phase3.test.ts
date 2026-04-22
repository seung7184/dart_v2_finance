import { describe, expect, it } from 'vitest';
import { getPhase3Readiness } from './phase3';

describe('getPhase3Readiness', () => {
  it('defaults provider-backed items to pending secrets and keeps static scaffolds available', () => {
    const readiness = getPhase3Readiness({});

    expect(readiness.find((item) => item.id === 'auth')?.status).toBe('scaffolded');
    expect(readiness.find((item) => item.id === 'privacy')?.status).toBe('scaffolded');
    expect(readiness.find((item) => item.id === 'posthog')?.status).toBe('pending_secret');
    expect(readiness.find((item) => item.id === 'sentry')?.status).toBe('pending_secret');
    expect(readiness.find((item) => item.id === 'stripe')?.status).toBe('pending_secret');
    expect(readiness.find((item) => item.id === 'revenuecat')?.status).toBe('pending_secret');
  });

  it('marks env-backed providers configured when public keys are present', () => {
    const readiness = getPhase3Readiness({
      NEXT_PUBLIC_POSTHOG_KEY: 'phc_test',
      NEXT_PUBLIC_SENTRY_DSN: 'https://dsn.example/123',
      NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: 'pk_test_123',
      NEXT_PUBLIC_REVENUECAT_APPLE_PUBLIC_KEY: 'appl_test_123',
    });

    expect(readiness.find((item) => item.id === 'posthog')?.status).toBe('configured');
    expect(readiness.find((item) => item.id === 'sentry')?.status).toBe('configured');
    expect(readiness.find((item) => item.id === 'stripe')?.status).toBe('configured');
    expect(readiness.find((item) => item.id === 'revenuecat')?.status).toBe('configured');
  });
});
