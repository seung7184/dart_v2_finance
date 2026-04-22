'use client';

import { useState } from 'react';
import { Badge, Button, Card, Input } from '@dart/ui';
import {
  SUPABASE_AUTH_CALLBACK_PATH,
  SUPABASE_ACCESS_TOKEN_COOKIE,
  SUPABASE_REFRESH_TOKEN_COOKIE,
} from '@/auth/constants';

type SignInState =
  | { status: 'idle' }
  | { status: 'success'; callbackUrl: string }
  | { status: 'error'; message: string };

export default function SignInPage() {
  const [email, setEmail] = useState('');
  const [signInState, setSignInState] = useState<SignInState>({ status: 'idle' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setSignInState({ status: 'idle' });

    try {
      const response = await fetch('/api/auth/start', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const payload = (await response.json()) as Record<string, unknown>;
      if (!response.ok) {
        throw new Error(
          typeof payload.error === 'string' ? payload.error : 'SUPABASE_AUTH_START_FAILED',
        );
      }

      setSignInState({
        status: 'success',
        callbackUrl:
          typeof payload.callbackUrl === 'string' ? payload.callbackUrl : SUPABASE_AUTH_CALLBACK_PATH,
      });
    } catch (error) {
      setSignInState({
        status: 'error',
        message: error instanceof Error ? error.message : 'SUPABASE_AUTH_START_FAILED',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main style={{ minHeight: '100vh', padding: '40px 24px', background: 'var(--color-bg)' }}>
      <div style={{ maxWidth: '560px', margin: '0 auto', display: 'grid', gap: '20px' }}>
        <div style={{ display: 'grid', gap: '8px' }}>
          <Badge variant="transfer">Auth wiring</Badge>
          <h1 style={{ fontSize: 'var(--text-3xl)' }}>Sign in for beta access</h1>
          <p style={{ color: 'var(--color-text-muted)' }}>
            This page now starts a real Supabase-compatible magic link flow when the Supabase URL
            and anon key are configured. Protected routes remain deny-by-default until valid
            Supabase session tokens are stored.
          </p>
        </div>

        <Card style={{ display: 'grid', gap: '14px' }}>
          <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '14px' }}>
            <Input
              label="Email"
              placeholder="name@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Requesting magic link…' : 'Send sign-in link'}
            </Button>
          </form>

          <p style={{ color: 'var(--color-text-faint)', fontSize: 'var(--text-sm)' }}>
            Required owner inputs: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
            and a Supabase redirect URL that points to `{SUPABASE_AUTH_CALLBACK_PATH}`.
          </p>
          <p style={{ color: 'var(--color-text-faint)', fontSize: 'var(--text-sm)' }}>
            Session cookies used after callback: `{SUPABASE_ACCESS_TOKEN_COOKIE}` and `
            {SUPABASE_REFRESH_TOKEN_COOKIE}`.
          </p>

          {signInState.status === 'success' ? (
            <p style={{ color: 'var(--color-safe)', fontSize: 'var(--text-sm)' }}>
              Magic link requested. Confirm your Supabase redirect URL includes: {signInState.callbackUrl}
            </p>
          ) : null}

          {signInState.status === 'error' ? (
            <p style={{ color: 'var(--color-warning)', fontSize: 'var(--text-sm)' }}>
              {signInState.message}
            </p>
          ) : null}
        </Card>
      </div>
    </main>
  );
}
