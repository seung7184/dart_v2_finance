type BillingEnv = Record<string, string | undefined>;

export type StripePlanInterval = 'monthly' | 'annual';

export type StripeBillingState = {
  annualPlanAvailable: boolean;
  provider: 'stripe';
  publicKeyPresent: boolean;
  secretKeyPresent: boolean;
  status: 'configured' | 'partial' | 'pending_secret';
  webhookSecretPresent: boolean;
  monthlyPlanAvailable: boolean;
};

export type StripeCheckoutSessionResult = {
  billingProvider: 'stripe';
  checkoutSessionId: string;
  checkoutUrl: string;
  interval: StripePlanInterval;
  mode: 'live_checkout';
  planLabel: string;
};

type StripeCheckoutSessionInput = {
  baseUrl: string;
  email: string;
  interval: StripePlanInterval;
};

type FetchLike = typeof fetch;

function hasValue(value: string | undefined) {
  return typeof value === 'string' && value.trim().length > 0;
}

function cleanValue(value: string | undefined) {
  return hasValue(value) ? value!.trim() : null;
}

function getStripePriceId(env: BillingEnv, interval: StripePlanInterval) {
  return interval === 'monthly'
    ? cleanValue(env.NEXT_PUBLIC_STRIPE_PRICE_ID_MONTHLY)
    : cleanValue(env.NEXT_PUBLIC_STRIPE_PRICE_ID_ANNUAL);
}

function getPlanLabel(interval: StripePlanInterval) {
  return interval === 'monthly' ? 'Dart Finance Beta Monthly' : 'Dart Finance Beta Annual';
}

function getStripeSecretKey(env: BillingEnv) {
  return cleanValue(env.STRIPE_SECRET_KEY);
}

function getStripeWebhookSecret(env: BillingEnv) {
  return cleanValue(env.STRIPE_WEBHOOK_SECRET);
}

function getStripeBaseUrl() {
  return 'https://api.stripe.com/v1';
}

export function getStripeBillingState(env: BillingEnv): StripeBillingState {
  const publicKeyPresent = hasValue(env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);
  const secretKeyPresent = hasValue(env.STRIPE_SECRET_KEY);
  const webhookSecretPresent = hasValue(env.STRIPE_WEBHOOK_SECRET);
  const monthlyPlanAvailable = hasValue(env.NEXT_PUBLIC_STRIPE_PRICE_ID_MONTHLY);
  const annualPlanAvailable = hasValue(env.NEXT_PUBLIC_STRIPE_PRICE_ID_ANNUAL);

  const fullyConfigured =
    publicKeyPresent &&
    secretKeyPresent &&
    webhookSecretPresent &&
    monthlyPlanAvailable &&
    annualPlanAvailable;

  const partiallyConfigured =
    publicKeyPresent ||
    secretKeyPresent ||
    webhookSecretPresent ||
    monthlyPlanAvailable ||
    annualPlanAvailable;

  return {
    annualPlanAvailable,
    monthlyPlanAvailable,
    provider: 'stripe',
    publicKeyPresent,
    secretKeyPresent,
    status: fullyConfigured ? 'configured' : partiallyConfigured ? 'partial' : 'pending_secret',
    webhookSecretPresent,
  };
}

function buildStripeCheckoutFormBody(input: StripeCheckoutSessionInput, priceId: string) {
  const params = new URLSearchParams();
  const baseUrl = input.baseUrl.replace(/\/$/, '');

  params.set('customer_email', input.email.trim());
  params.set('mode', 'subscription');
  params.set('line_items[0][price]', priceId);
  params.set('line_items[0][quantity]', '1');
  params.set('success_url', `${baseUrl}/billing?checkout=success`);
  params.set('cancel_url', `${baseUrl}/billing?checkout=cancelled`);
  params.set('metadata[plan_interval]', input.interval);
  params.set('metadata[source]', 'dart_web_billing');

  return params.toString();
}

export async function createStripeCheckoutSession(
  input: StripeCheckoutSessionInput,
  env: BillingEnv,
  fetchImpl: FetchLike = fetch,
): Promise<StripeCheckoutSessionResult> {
  const secretKey = getStripeSecretKey(env);
  if (!secretKey) {
    throw new Error('STRIPE_CHECKOUT_NOT_CONFIGURED');
  }

  const priceId = getStripePriceId(env, input.interval);
  if (!priceId) {
    throw new Error('STRIPE_PRICE_NOT_CONFIGURED');
  }

  const response = await fetchImpl(`${getStripeBaseUrl()}/checkout/sessions`, {
    body: buildStripeCheckoutFormBody(input, priceId),
    headers: {
      Authorization: `Bearer ${secretKey}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    method: 'POST',
  });

  if (!response.ok) {
    throw new Error('STRIPE_CHECKOUT_FAILED');
  }

  const payload = (await response.json()) as {
    id?: unknown;
    url?: unknown;
  };

  if (typeof payload.id !== 'string' || typeof payload.url !== 'string') {
    throw new Error('STRIPE_CHECKOUT_FAILED');
  }

  return {
    billingProvider: 'stripe',
    checkoutSessionId: payload.id,
    checkoutUrl: payload.url,
    interval: input.interval,
    mode: 'live_checkout',
    planLabel: getPlanLabel(input.interval),
  };
}
