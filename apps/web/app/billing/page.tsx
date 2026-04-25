'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { StripePlanInterval } from '@/billing/stripe';
import { trackEvent, trackException } from '@/observability/client';

type CheckoutState =
  | { status: 'idle' }
  | { status: 'redirecting'; planLabel: string }
  | { status: 'error'; message: string };

function providerStatus(value: string | undefined) {
  return value?.trim() ? '✓ Configured' : '— Not configured';
}

function planStatus(value: string | undefined) {
  return value?.trim() ? '✓ Available' : '— Not live yet';
}

export default function BillingPage() {
  const [email, setEmail] = useState('');
  const [checkoutState, setCheckoutState] = useState<CheckoutState>({ status: 'idle' });
  const [isLoading, setIsLoading] = useState(false);
  const publicKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
  const monthlyPriceId = process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_MONTHLY;
  const annualPriceId = process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_ANNUAL;

  const stripeReady = !!publicKey && (!!monthlyPriceId || !!annualPriceId);

  async function handleCheckout(interval: StripePlanInterval) {
    setIsLoading(true);
    setCheckoutState({ status: 'idle' });
    try {
      const response = await fetch('/api/billing/stripe/checkout', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
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
      trackEvent('onboarding_completed', { source: 'billing_live_checkout', interval });
      setCheckoutState({ status: 'redirecting', planLabel });
      window.location.assign(checkoutUrl);
    } catch (error) {
      trackException(error, { context: 'billing_page', provider: 'stripe', interval });
      setCheckoutState({
        status: 'error',
        message: error instanceof Error ? error.message : 'BILLING_CHECKOUT_FAILED',
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main
      style={{
        minHeight: '100vh',
        background: 'var(--surface-0)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 24px',
      }}
    >
      {/* Brand */}
      <Link
        href="/"
        style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 40, textDecoration: 'none' }}
      >
        <div
          style={{
            width: 28, height: 28, borderRadius: 8,
            background: 'var(--accent-500)', color: '#fff',
            display: 'grid', placeItems: 'center',
            fontWeight: 800, fontSize: 15, letterSpacing: '-0.02em',
          }}
        >
          D
        </div>
        <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
          Dart Finance
        </span>
      </Link>

      <div style={{ width: '100%', maxWidth: 560, display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Header */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <h1
            style={{
              fontSize: 28,
              fontWeight: 700,
              color: 'var(--text-primary)',
              letterSpacing: '-0.03em',
              lineHeight: 1.1,
            }}
          >
            Billing
          </h1>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            Beta is free. Billing is not enabled and will not charge you.
          </p>
        </div>

        {/* Beta notice */}
        {!stripeReady && (
          <div
            style={{
              padding: '14px 16px',
              background: 'var(--surface-2)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 10,
              fontSize: 13,
              color: 'var(--text-secondary)',
              lineHeight: 1.6,
            }}
          >
            <strong style={{ color: 'var(--text-primary)' }}>Free during beta.</strong>{' '}
            Stripe checkout requires owner-provided keys and price IDs before any plan goes live.
            No payment will be taken without those values configured.
          </div>
        )}

        {/* Stripe card */}
        <div
          style={{
            background: 'var(--surface-1)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 16,
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
              Stripe
            </h2>
            <span
              style={{
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                padding: '3px 9px',
                borderRadius: 999,
                background: stripeReady ? 'var(--positive-tint)' : 'var(--surface-3)',
                color: stripeReady ? 'var(--positive)' : 'var(--text-tertiary)',
              }}
            >
              {stripeReady ? 'Configured' : 'Not configured'}
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {[
              { label: 'Publishable key', value: providerStatus(publicKey) },
              { label: 'Monthly plan', value: planStatus(monthlyPriceId) },
              { label: 'Annual plan', value: planStatus(annualPriceId) },
            ].map((row) => (
              <div
                key={row.label}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: 13,
                  color: 'var(--text-secondary)',
                  padding: '6px 0',
                  borderBottom: '1px solid var(--border-subtle)',
                }}
              >
                <span>{row.label}</span>
                <span
                  style={{
                    color: row.value.startsWith('✓') ? 'var(--positive)' : 'var(--text-tertiary)',
                    fontWeight: 500,
                  }}
                >
                  {row.value}
                </span>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)' }}>
              Billing email
            </label>
            <input
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: '100%',
                height: 44,
                padding: '0 14px',
                borderRadius: 8,
                background: 'var(--surface-2)',
                border: '1px solid var(--border-default)',
                color: 'var(--text-primary)',
                fontFamily: 'var(--font-sans)',
                fontSize: 15,
                outline: 'none',
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            {[
              { interval: 'monthly' as const, label: 'Monthly · €4–7/mo', priceId: monthlyPriceId },
              { interval: 'annual' as const, label: 'Annual · €36–60/yr', priceId: annualPriceId },
            ].map((plan) => (
              <button
                key={plan.interval}
                type="button"
                onClick={() => void handleCheckout(plan.interval)}
                disabled={isLoading || !plan.priceId}
                style={{
                  flex: 1,
                  height: 44,
                  background: plan.priceId ? 'var(--accent-500)' : 'var(--surface-3)',
                  color: plan.priceId ? '#fff' : 'var(--text-disabled)',
                  border: 'none',
                  borderRadius: 8,
                  fontFamily: 'var(--font-sans)',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: plan.priceId && !isLoading ? 'pointer' : 'not-allowed',
                  letterSpacing: '-0.005em',
                }}
              >
                {isLoading ? 'Preparing…' : plan.label}
              </button>
            ))}
          </div>

          {checkoutState.status === 'redirecting' && (
            <p style={{ fontSize: 13, color: 'var(--positive)' }}>
              Redirecting to Stripe Checkout for {checkoutState.planLabel}…
            </p>
          )}
          {checkoutState.status === 'error' && (
            <p
              style={{
                fontSize: 13,
                color: 'var(--warning)',
                background: 'var(--warning-tint)',
                border: '1px solid rgba(230,194,122,0.24)',
                borderRadius: 8,
                padding: '10px 12px',
              }}
            >
              {checkoutState.message === 'INVALID_BILLING_EMAIL'
                ? 'Enter a valid email before starting checkout.'
                : checkoutState.message === 'STRIPE_PRICE_NOT_CONFIGURED'
                ? 'That billing plan is not live yet.'
                : checkoutState.message === 'STRIPE_CHECKOUT_NOT_CONFIGURED'
                ? 'Stripe is not fully configured.'
                : checkoutState.message}
            </p>
          )}
        </div>

        {/* RevenueCat note */}
        <div
          style={{
            background: 'var(--surface-1)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 16,
            padding: '20px 24px',
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
          }}
        >
          <h2 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>
            Mobile · RevenueCat
          </h2>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            Mobile billing is managed in the Expo app. Apple and Google keys are checked
            separately. Status: <span style={{ color: 'var(--text-tertiary)' }}>SDK not installed</span>.
          </p>
        </div>

        <p style={{ fontSize: 12, color: 'var(--text-tertiary)', textAlign: 'center' }}>
          <Link href="/" style={{ color: 'var(--accent-400)' }}>← Back to home</Link>
        </p>
      </div>
    </main>
  );
}
