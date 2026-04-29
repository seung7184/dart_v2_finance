'use client';

import { useState } from 'react';
import Link from 'next/link';
import { SUPABASE_AUTH_CALLBACK_PATH } from '@/auth/constants';

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
        headers: { 'content-type': 'application/json' },
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
          typeof payload.callbackUrl === 'string'
            ? payload.callbackUrl
            : SUPABASE_AUTH_CALLBACK_PATH,
      });
    } catch (error) {
      setSignInState({
        status: 'error',
        message: error instanceof Error ? error.message : 'Sign-in request failed.',
      });
    } finally {
      setIsSubmitting(false);
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
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          marginBottom: 40,
          textDecoration: 'none',
        }}
      >
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: 8,
            background: 'var(--accent-500)',
            color: 'var(--text-on-accent)',
            display: 'grid',
            placeItems: 'center',
            fontWeight: 800,
            fontSize: 15,
            letterSpacing: '-0.02em',
          }}
        >
          D
        </div>
        <span
          style={{
            fontSize: 14,
            fontWeight: 600,
            color: 'var(--text-primary)',
            letterSpacing: '-0.01em',
          }}
        >
          Dart Finance
        </span>
      </Link>

      {/* Card */}
      <div
        style={{
          width: '100%',
          maxWidth: 400,
          background: 'var(--surface-1)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 16,
          padding: '28px 24px',
          display: 'flex',
          flexDirection: 'column',
          gap: 20,
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <h1
            style={{
              fontSize: 22,
              fontWeight: 600,
              color: 'var(--text-primary)',
              letterSpacing: '-0.02em',
            }}
          >
            Sign in
          </h1>
          <p style={{ fontSize: 13, color: 'var(--text-tertiary)' }}>
            We&apos;ll send a one-time link to your email.
          </p>
        </div>

        {signInState.status !== 'success' ? (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label
                htmlFor="email"
                style={{
                  fontSize: 13,
                  fontWeight: 500,
                  color: 'var(--text-secondary)',
                  letterSpacing: '-0.005em',
                }}
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                required
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

            {signInState.status === 'error' ? (
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
                {signInState.message}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                height: 44,
                background: 'var(--accent-500)',
                color: 'var(--text-on-accent)',
                border: 'none',
                borderRadius: 8,
                fontFamily: 'var(--font-sans)',
                fontSize: 14,
                fontWeight: 600,
                letterSpacing: '-0.005em',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                opacity: isSubmitting ? 0.6 : 1,
              }}
            >
              {isSubmitting ? 'Sending link…' : 'Send sign-in link'}
            </button>
          </form>
        ) : (
          <div
            style={{
              padding: '16px',
              background: 'var(--accent-tint)',
              border: '1px solid rgba(59,130,246,0.22)',
              borderRadius: 10,
              display: 'flex',
              flexDirection: 'column',
              gap: 6,
            }}
          >
            <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--accent-400)' }}>
              Check your inbox
            </p>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
              A sign-in link was sent to {email}. It expires after a few minutes.
            </p>
          </div>
        )}

        <p style={{ fontSize: 12, color: 'var(--text-tertiary)', textAlign: 'center' }}>
          Don&apos;t have access?{' '}
          <Link href="/beta" style={{ color: 'var(--accent-400)' }}>
            Request beta access
          </Link>
        </p>
      </div>
    </main>
  );
}
