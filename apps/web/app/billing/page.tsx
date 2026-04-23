'use client';

import { useState } from 'react';
import { Badge, Button, Card, Input } from '@dart/ui';
import type { StripePlanInterval } from '@/billing/stripe';
import { trackEvent, trackException } from '@/observability/client';

type CheckoutState =
  | { status: 'idle' }
  | { status: 'redirecting'; planLabel: string }
  | { status: 'error'; message: string };

function providerValue(value: string | undefined) {
  return value?.trim() ? 'Configured in environment' : 'Unavailable';
}

function planValue(value: string | undefined) {
  return value?.trim() ? 'Plan is available' : 'Plan is not live yet';
}

export default function BillingPage() {
  const [email, setEmail] = useState('');
  const [checkoutState, setCheckoutState] = useState<CheckoutState>({ status: 'idle' });
  const [isLoading, setIsLoading] = useState(false);
  const publicKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
  const monthlyPriceId = process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_MONTHLY;
  const annualPriceId = process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_ANNUAL;

  async function handleCheckout(interval: StripePlanInterval) {
    setIsLoading(true);
    setCheckoutState({ status: 'idle' });

    try {
      const response = await fetch('/api/billing/stripe/checkout', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({ email, interval }),
      });

      const payload = (await response.json()) as Record<string, unknown>;
      if (!response.ok) {
        throw new Error(
          typeof payload.error === 'string' ? payload.error : 'BILLING_CHECKOUT_FAILED',
        );
      }

      const checkoutUrl =
        typeof payload.checkoutUrl === 'string' ? payload.checkoutUrl : 'https://checkout.stripe.com';
      const planLabel =
        typeof payload.planLabel === 'string'
          ? payload.planLabel
          : interval === 'monthly'
            ? 'Dart Finance Beta Monthly'
            : 'Dart Finance Beta Annual';

      trackEvent('onboarding_completed', {
        source: 'billing_live_checkout',
        interval,
      });
      setCheckoutState({
        status: 'redirecting',
        planLabel,
      });

      window.location.assign(checkoutUrl);
    } catch (error) {
      trackException(error, {
        context: 'billing_page',
        provider: 'stripe',
        interval,
      });
      setCheckoutState({
        status: 'error',
        message: error instanceof Error ? error.message : 'BILLING_CHECKOUT_FAILED',
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main style={{ minHeight: '100vh', padding: '40px 24px', background: 'var(--color-bg)' }}>
      <div style={{ maxWidth: '760px', margin: '0 auto', display: 'grid', gap: '20px' }}>
        <div style={{ display: 'grid', gap: '8px' }}>
          <Badge variant="warning">Billing scaffold</Badge>
          <h1 style={{ fontSize: 'var(--text-3xl)' }}>Billing readiness</h1>
          <p style={{ color: 'var(--color-text-muted)' }}>
            Billing is not enabled for beta by default. This page exposes live-ready provider
            wiring only when the required environment values exist, and it keeps unavailable plans
            disabled instead of presenting them as live.
          </p>
        </div>

        <Card style={{ display: 'grid', gap: '12px' }}>
          <h2 style={{ fontSize: 'var(--text-xl)' }}>Stripe</h2>
          <p style={{ color: 'var(--color-text-muted)' }}>
            Publishable key status: {providerValue(publicKey)}
          </p>
          <p style={{ color: 'var(--color-text-muted)' }}>
            Monthly plan status: {planValue(monthlyPriceId)}
          </p>
          <p style={{ color: 'var(--color-text-muted)' }}>
            Annual plan status: {planValue(annualPriceId)}
          </p>
          <Input
            label="Billing email"
            placeholder="name@example.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <Button
              type="button"
              onClick={() => void handleCheckout('monthly')}
              disabled={isLoading || !monthlyPriceId}
            >
              {isLoading ? 'Preparing checkout…' : 'Start monthly checkout'}
            </Button>
            <Button
              type="button"
              onClick={() => void handleCheckout('annual')}
              disabled={isLoading || !annualPriceId}
            >
              {isLoading ? 'Preparing checkout…' : 'Start annual checkout'}
            </Button>
          </div>
          <p style={{ color: 'var(--color-text-faint)', fontSize: 'var(--text-sm)' }}>
            The page only exposes plans whose public price IDs are configured. Hosted checkout also
            requires server-side `STRIPE_SECRET_KEY` plus webhook handling before billing is fully
            operational.
          </p>
          <p style={{ color: 'var(--color-text-faint)', fontSize: 'var(--text-sm)' }}>
            TODO(owner): add the real webhook endpoint, set `STRIPE_WEBHOOK_SECRET`, and connect
            post-checkout subscription activation before charging external beta users.
          </p>
          {checkoutState.status === 'redirecting' ? (
            <p style={{ color: 'var(--color-safe)', fontSize: 'var(--text-sm)' }}>
              Redirecting to Stripe Checkout for {checkoutState.planLabel}.
            </p>
          ) : null}
          {checkoutState.status === 'error' ? (
            <p style={{ color: 'var(--color-warning)', fontSize: 'var(--text-sm)' }}>
              {checkoutState.message === 'INVALID_BILLING_EMAIL'
                ? 'Enter a valid email before starting checkout.'
                : checkoutState.message === 'INVALID_BILLING_INTERVAL'
                  ? 'Select a valid billing interval.'
                  : checkoutState.message === 'STRIPE_PRICE_NOT_CONFIGURED'
                    ? 'That billing plan is not live yet.'
                    : checkoutState.message === 'STRIPE_CHECKOUT_NOT_CONFIGURED'
                      ? 'Stripe checkout is not fully configured on the server yet.'
                : checkoutState.message}
            </p>
          ) : null}
        </Card>

        <Card style={{ display: 'grid', gap: '12px' }}>
          <h2 style={{ fontSize: 'var(--text-xl)' }}>RevenueCat</h2>
          <p style={{ color: 'var(--color-text-muted)' }}>
            Mobile RevenueCat status is shown in the Expo app, where Apple and Google public keys
            are checked separately.
          </p>
          <p style={{ color: 'var(--color-text-faint)', fontSize: 'var(--text-sm)' }}>
            TODO(owner): keep mobile billing disabled until both platform keys, the RevenueCat SDK,
            offering `default`, entitlement `premium`, and packages `$rc_monthly` / `$rc_annual`
            are verified in a development build.
          </p>
        </Card>
      </div>
    </main>
  );
}
