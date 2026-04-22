'use client';

import { useState } from 'react';
import { Badge, Button, Card, Input } from '@dart/ui';
import { trackEvent, trackException } from '@/observability/client';

type CheckoutState =
  | { status: 'idle' }
  | { status: 'success'; planLabel: string; priceLabel: string }
  | { status: 'error'; message: string };

function providerValue(value: string | undefined) {
  return value?.trim() ? 'Configured in environment' : 'Missing public key';
}

export default function BillingPage() {
  const [email, setEmail] = useState('');
  const [checkoutState, setCheckoutState] = useState<CheckoutState>({ status: 'idle' });
  const [isLoading, setIsLoading] = useState(false);

  async function handleMockCheckout() {
    setIsLoading(true);
    setCheckoutState({ status: 'idle' });

    try {
      const response = await fetch('/api/billing/stripe/checkout', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const payload = (await response.json()) as Record<string, unknown>;
      if (!response.ok) {
        throw new Error(
          typeof payload.error === 'string' ? payload.error : 'BILLING_CHECKOUT_FAILED',
        );
      }

      trackEvent('onboarding_completed', {
        source: 'billing_mock_checkout',
      });
      setCheckoutState({
        status: 'success',
        planLabel:
          typeof payload.planLabel === 'string' ? payload.planLabel : 'Dart Finance Beta',
        priceLabel: typeof payload.priceLabel === 'string' ? payload.priceLabel : 'EUR 7 / month',
      });
    } catch (error) {
      trackException(error, {
        context: 'billing_page',
        provider: 'stripe',
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
            This phase adds provider-aware wiring only: a mock Stripe checkout request on web and a
            RevenueCat readiness scaffold for mobile. No live payment session or entitlement sync is
            enabled here.
          </p>
        </div>

        <Card style={{ display: 'grid', gap: '12px' }}>
          <h2 style={{ fontSize: 'var(--text-xl)' }}>Stripe</h2>
          <p style={{ color: 'var(--color-text-muted)' }}>
            Publishable key status: {providerValue(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)}
          </p>
          <Input
            label="Billing email"
            placeholder="name@example.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
          <Button type="button" onClick={() => void handleMockCheckout()} disabled={isLoading}>
            {isLoading ? 'Preparing checkout…' : 'Start mock Stripe checkout'}
          </Button>
          <p style={{ color: 'var(--color-text-faint)', fontSize: 'var(--text-sm)' }}>
            This route returns a mock checkout payload only. TODO(owner): attach real checkout
            session creation once Stripe products and webhook handling are defined.
          </p>
          {checkoutState.status === 'success' ? (
            <p style={{ color: 'var(--color-safe)', fontSize: 'var(--text-sm)' }}>
              Mock checkout ready for {checkoutState.planLabel} at {checkoutState.priceLabel}.
            </p>
          ) : null}
          {checkoutState.status === 'error' ? (
            <p style={{ color: 'var(--color-warning)', fontSize: 'var(--text-sm)' }}>
              {checkoutState.message === 'INVALID_BILLING_EMAIL'
                ? 'Enter a valid email before starting mock checkout.'
                : checkoutState.message}
            </p>
          ) : null}
        </Card>

        <Card style={{ display: 'grid', gap: '12px' }}>
          <h2 style={{ fontSize: 'var(--text-xl)' }}>RevenueCat</h2>
          <p style={{ color: 'var(--color-text-muted)' }}>
            Public Apple key status:{' '}
            {providerValue(process.env.NEXT_PUBLIC_REVENUECAT_APPLE_PUBLIC_KEY)}
          </p>
          <p style={{ color: 'var(--color-text-faint)', fontSize: 'var(--text-sm)' }}>
            Mobile home now has a provider-aware paywall readiness card. TODO(owner): map the final
            product identifiers and entitlement names before installing the live SDK.
          </p>
        </Card>
      </div>
    </main>
  );
}

