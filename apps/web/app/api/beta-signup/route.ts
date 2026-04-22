import { NextResponse } from 'next/server';
import { captureServerException } from '@/observability/server';
import { submitBetaSignup } from '@/beta/signup';

type SignupPayload = {
  broker?: unknown;
  email?: unknown;
  primaryBank?: unknown;
  reason?: unknown;
};

function getStringField(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as SignupPayload;
    const result = await submitBetaSignup({
      broker: getStringField(payload.broker),
      email: getStringField(payload.email),
      primaryBank: getStringField(payload.primaryBank),
      reason: getStringField(payload.reason),
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    captureServerException(error, {
      context: 'api_beta_signup',
    });

    const message = error instanceof Error ? error.message : 'UNKNOWN_BETA_SIGNUP_ERROR';
    const status = message === 'INVALID_BETA_SIGNUP' ? 400 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

