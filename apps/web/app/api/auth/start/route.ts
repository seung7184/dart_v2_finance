import { NextResponse } from 'next/server';
import { SUPABASE_AUTH_CALLBACK_PATH } from '@/auth/constants';
import { captureServerException } from '@/observability/server';
import { getSupabaseAuthConfig } from '@/auth/session';
import { buildSupabaseOtpPayload, parseSupabaseAuthStartError } from '@/auth/start';

type StartAuthRequest = {
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
    const config = getSupabaseAuthConfig(process.env);
    if (!config) {
      return NextResponse.json({ error: 'SUPABASE_AUTH_NOT_CONFIGURED' }, { status: 503 });
    }

    const payload = (await request.json()) as StartAuthRequest;
    const email = getEmail(payload.email);

    if (!isValidEmail(email)) {
      return NextResponse.json({ error: 'INVALID_EMAIL' }, { status: 400 });
    }

    const callbackUrl = new URL(SUPABASE_AUTH_CALLBACK_PATH, request.url).toString();
    const response = await fetch(`${config.authUrl}/otp`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        apikey: config.anonKey,
      },
      body: JSON.stringify(buildSupabaseOtpPayload(email, callbackUrl)),
    });

    if (!response.ok) {
      const error = await parseSupabaseAuthStartError(response);
      return NextResponse.json({ error: error.error }, { status: error.status });
    }

    return NextResponse.json({
      callbackUrl,
      status: 'magic_link_requested',
    });
  } catch (error) {
    captureServerException(error, {
      context: 'api_auth_start',
    });
    return NextResponse.json({ error: 'SUPABASE_AUTH_START_FAILED' }, { status: 500 });
  }
}
