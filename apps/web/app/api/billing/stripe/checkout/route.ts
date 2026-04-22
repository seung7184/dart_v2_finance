import { NextResponse } from 'next/server';
import { captureServerException } from '@/observability/server';
import { buildStripeCheckoutPayload } from '@/billing/stripe';

type CheckoutRequest = {
  email?: unknown;
};

function getEmail(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as CheckoutRequest;
    const email = getEmail(payload.email);

    if (!isValidEmail(email)) {
      return NextResponse.json({ error: 'INVALID_BILLING_EMAIL' }, { status: 400 });
    }

    return NextResponse.json(buildStripeCheckoutPayload({ email }), { status: 200 });
  } catch (error) {
    captureServerException(error, {
      context: 'api_stripe_checkout_mock',
    });
    return NextResponse.json({ error: 'BILLING_CHECKOUT_FAILED' }, { status: 500 });
  }
}

