import { NextResponse } from 'next/server';
import { captureServerException } from '@/observability/server';
import { createStripeCheckoutSession } from '@/billing/stripe';

type CheckoutRequest = {
  email?: unknown;
  interval?: unknown;
};

function getEmail(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidInterval(interval: string): interval is 'monthly' | 'annual' {
  return interval === 'monthly' || interval === 'annual';
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as CheckoutRequest;
    const email = getEmail(payload.email);
    const interval = typeof payload.interval === 'string' ? payload.interval.trim() : '';

    if (!isValidEmail(email)) {
      return NextResponse.json({ error: 'INVALID_BILLING_EMAIL' }, { status: 400 });
    }

    if (!isValidInterval(interval)) {
      return NextResponse.json({ error: 'INVALID_BILLING_INTERVAL' }, { status: 400 });
    }

    return NextResponse.json(
      await createStripeCheckoutSession(
        {
          baseUrl: new URL(request.url).origin,
          email,
          interval,
        },
        process.env,
      ),
      { status: 200 },
    );
  } catch (error) {
    captureServerException(error, {
      context: 'api_stripe_checkout',
    });

    const message = error instanceof Error ? error.message : 'BILLING_CHECKOUT_FAILED';
    const status =
      message === 'STRIPE_CHECKOUT_NOT_CONFIGURED' || message === 'STRIPE_PRICE_NOT_CONFIGURED'
        ? 503
        : 500;

    return NextResponse.json({ error: message }, { status });
  }
}
