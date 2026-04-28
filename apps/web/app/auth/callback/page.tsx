'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

function parseTokensFromLocation(locationValue: Location) {
  const hashParams = new URLSearchParams(locationValue.hash.replace(/^#/, ''));
  const queryParams = new URLSearchParams(locationValue.search);

  return {
    accessToken: hashParams.get('access_token') ?? queryParams.get('access_token'),
    refreshToken: hashParams.get('refresh_token') ?? queryParams.get('refresh_token'),
  };
}

type CallbackState =
  | { status: 'loading' }
  | { status: 'error'; message: string };

export default function AuthCallbackPage() {
  const router = useRouter();
  const [state, setState] = useState<CallbackState>({ status: 'loading' });

  useEffect(() => {
    async function completeSignIn() {
      const { accessToken, refreshToken } = parseTokensFromLocation(window.location);

      if (!accessToken || !refreshToken) {
        setState({
          status: 'error',
          message: 'The sign-in link has expired or is no longer valid. Please request a new magic link.',
        });
        return;
      }

      const response = await fetch('/api/auth/callback', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          accessToken,
          refreshToken,
        }),
      });

      if (!response.ok) {
        setState({
          status: 'error',
          message: "We couldn't complete your sign-in. Please try again — or contact support if this keeps happening.",
        });
        return;
      }

      // Check onboarding status and redirect accordingly
      try {
        const statusRes = await fetch('/api/auth/onboarding-status');
        if (statusRes.ok) {
          const data = (await statusRes.json()) as { onboardingCompleted: boolean };
          if (!data.onboardingCompleted) {
            router.replace('/onboarding/payday');
            return;
          }
        }
      } catch {
        // Non-fatal: fall through to dashboard
      }

      router.replace('/dashboard');
    }

    void completeSignIn();
  }, [router]);

  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        background: 'var(--color-bg)',
        color: 'var(--color-text)',
        padding: '24px',
      }}
    >
      {state.status === 'loading' ? (
        <p style={{ fontSize: 15, color: 'var(--text-secondary)' }}>Signing you in…</p>
      ) : (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 16,
            maxWidth: 400,
            textAlign: 'center',
          }}
        >
          <p style={{ margin: 0, fontSize: 15, color: 'var(--text-primary)' }}>
            {state.message}
          </p>
          <Link
            href="/sign-in"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              height: 38,
              padding: '0 16px',
              borderRadius: 8,
              background: 'var(--accent-500)',
              color: 'var(--text-inverse)',
              textDecoration: 'none',
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            Back to sign in
          </Link>
        </div>
      )}
    </main>
  );
}
