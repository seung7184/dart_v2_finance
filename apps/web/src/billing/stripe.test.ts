import { describe, expect, it } from 'vitest';
import {
  buildStripeCheckoutPayload,
  getStripeBillingState,
} from './stripe';

describe('getStripeBillingState', () => {
  it('marks Stripe configured only when a publishable key is present', () => {
    expect(getStripeBillingState({}).status).toBe('pending_secret');
    expect(
      getStripeBillingState({
        NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: 'pk_test_123',
      }).status,
    ).toBe('configured');
  });
});

describe('buildStripeCheckoutPayload', () => {
  it('returns a mock billing payload for the documented paid plan', () => {
    expect(
      buildStripeCheckoutPayload({
        email: 'beta@example.com',
      }),
    ).toEqual({
      billingProvider: 'stripe',
      currency: 'EUR',
      email: 'beta@example.com',
      interval: 'monthly',
      mode: 'mock_checkout',
      planLabel: 'Dart Finance Beta',
      priceLabel: 'EUR 7 / month',
    });
  });
});
