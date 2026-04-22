type BillingEnv = Record<string, string | undefined>;

export type StripeBillingState = {
  provider: 'stripe';
  publicKeyPresent: boolean;
  status: 'configured' | 'pending_secret';
};

export type StripeCheckoutPayload = {
  billingProvider: 'stripe';
  currency: 'EUR';
  email: string;
  interval: 'monthly';
  mode: 'mock_checkout';
  planLabel: 'Dart Finance Beta';
  priceLabel: 'EUR 7 / month';
};

function hasValue(value: string | undefined) {
  return typeof value === 'string' && value.trim().length > 0;
}

export function getStripeBillingState(env: BillingEnv): StripeBillingState {
  const publicKeyPresent = hasValue(env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

  return {
    provider: 'stripe',
    publicKeyPresent,
    status: publicKeyPresent ? 'configured' : 'pending_secret',
  };
}

export function buildStripeCheckoutPayload(input: { email: string }): StripeCheckoutPayload {
  return {
    billingProvider: 'stripe',
    currency: 'EUR',
    email: input.email.trim(),
    interval: 'monthly',
    mode: 'mock_checkout',
    planLabel: 'Dart Finance Beta',
    priceLabel: 'EUR 7 / month',
  };
}

