import { describe, expect, it } from 'vitest';
import {
  createStripeCheckoutSession,
  getStripeBillingState,
} from './stripe';

describe('getStripeBillingState', () => {
  it('marks Stripe pending when Stripe keys are absent', () => {
    expect(getStripeBillingState({})).toMatchObject({
      annualPlanAvailable: false,
      monthlyPlanAvailable: false,
      publicKeyPresent: false,
      secretKeyPresent: false,
      status: 'pending_secret',
      webhookSecretPresent: false,
    });
  });

  it('tracks monthly and annual availability separately from the start', () => {
    expect(
      getStripeBillingState({
        NEXT_PUBLIC_STRIPE_PRICE_ID_ANNUAL: 'price_annual',
        NEXT_PUBLIC_STRIPE_PRICE_ID_MONTHLY: 'price_monthly',
        NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: 'pk_test_123',
        STRIPE_SECRET_KEY: 'sk_test_123',
        STRIPE_WEBHOOK_SECRET: 'whsec_123',
      }),
    ).toMatchObject({
      annualPlanAvailable: true,
      monthlyPlanAvailable: true,
      publicKeyPresent: true,
      secretKeyPresent: true,
      status: 'configured',
      webhookSecretPresent: true,
    });
  });

  it('keeps a missing plan unavailable even when the rest of Stripe is wired', () => {
    expect(
      getStripeBillingState({
        NEXT_PUBLIC_STRIPE_PRICE_ID_MONTHLY: 'price_monthly',
        NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: 'pk_test_123',
        STRIPE_SECRET_KEY: 'sk_test_123',
      }),
    ).toMatchObject({
      annualPlanAvailable: false,
      monthlyPlanAvailable: true,
      status: 'partial',
    });
  });
});

describe('createStripeCheckoutSession', () => {
  it('creates a hosted Stripe Checkout session for the selected plan', async () => {
    const calls: Array<{ body: string; headers: HeadersInit | undefined; url: string }> = [];

    const result = await createStripeCheckoutSession(
      {
        baseUrl: 'https://dart.finance',
        email: 'beta@example.com',
        interval: 'annual',
      },
      {
        NEXT_PUBLIC_STRIPE_PRICE_ID_ANNUAL: 'price_annual',
        NEXT_PUBLIC_STRIPE_PRICE_ID_MONTHLY: 'price_monthly',
        STRIPE_SECRET_KEY: 'sk_test_123',
      },
      async (url, init) => {
        calls.push({
          body: String(init?.body ?? ''),
          headers: init?.headers,
          url: String(url),
        });

        return new Response(
          JSON.stringify({
            id: 'cs_test_123',
            url: 'https://checkout.stripe.com/c/pay/cs_test_123',
          }),
          { status: 200 },
        );
      },
    );

    expect(result).toEqual({
      billingProvider: 'stripe',
      checkoutSessionId: 'cs_test_123',
      checkoutUrl: 'https://checkout.stripe.com/c/pay/cs_test_123',
      interval: 'annual',
      mode: 'live_checkout',
      planLabel: 'Dart Finance Beta Annual',
    });

    expect(calls[0]?.url).toBe('https://api.stripe.com/v1/checkout/sessions');
    expect(calls[0]?.body).toContain('mode=subscription');
    expect(calls[0]?.body).toContain('line_items%5B0%5D%5Bprice%5D=price_annual');
    expect(calls[0]?.body).toContain('success_url=https%3A%2F%2Fdart.finance%2Fbilling%3Fcheckout%3Dsuccess');
    expect(calls[0]?.body).toContain('cancel_url=https%3A%2F%2Fdart.finance%2Fbilling%3Fcheckout%3Dcancelled');
  });

  it('fails safely when the selected price id is missing', async () => {
    await expect(
      createStripeCheckoutSession(
        {
          baseUrl: 'https://dart.finance',
          email: 'beta@example.com',
          interval: 'annual',
        },
        {
          NEXT_PUBLIC_STRIPE_PRICE_ID_MONTHLY: 'price_monthly',
          STRIPE_SECRET_KEY: 'sk_test_123',
        },
      ),
    ).rejects.toThrow('STRIPE_PRICE_NOT_CONFIGURED');
  });

  it('fails safely when the Stripe secret key is missing', async () => {
    await expect(
      createStripeCheckoutSession(
        {
          baseUrl: 'https://dart.finance',
          email: 'beta@example.com',
          interval: 'monthly',
        },
        {
          NEXT_PUBLIC_STRIPE_PRICE_ID_MONTHLY: 'price_monthly',
        },
      ),
    ).rejects.toThrow('STRIPE_CHECKOUT_NOT_CONFIGURED');
  });
});
