import { describe, expect, it } from 'vitest';
import { buildSupabaseOtpPayload, parseSupabaseAuthStartError } from './start';

describe('buildSupabaseOtpPayload', () => {
  it('sends the auth callback URL as email_redirect_to for Supabase otp email flows', () => {
    expect(
      buildSupabaseOtpPayload('user@example.com', 'http://localhost:3000/auth/callback'),
    ).toEqual({
      create_user: true,
      email: 'user@example.com',
      options: {
        email_redirect_to: 'http://localhost:3000/auth/callback',
      },
    });
  });
});

describe('parseSupabaseAuthStartError', () => {
  it('prefers the upstream error code from Supabase', async () => {
    const response = new Response(
      JSON.stringify({
        error_code: 'over_email_send_rate_limit',
        msg: 'email rate limit exceeded',
      }),
      {
        status: 429,
        headers: {
          'content-type': 'application/json',
        },
      },
    );

    await expect(parseSupabaseAuthStartError(response)).resolves.toEqual({
      error: 'over_email_send_rate_limit',
      status: 429,
    });
  });
});
