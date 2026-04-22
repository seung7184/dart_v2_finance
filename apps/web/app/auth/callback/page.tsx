'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

function parseTokensFromLocation(locationValue: Location) {
  const hashParams = new URLSearchParams(locationValue.hash.replace(/^#/, ''));
  const queryParams = new URLSearchParams(locationValue.search);

  return {
    accessToken: hashParams.get('access_token') ?? queryParams.get('access_token'),
    refreshToken: hashParams.get('refresh_token') ?? queryParams.get('refresh_token'),
  };
}

export default function AuthCallbackPage() {
  const router = useRouter();
  const [message, setMessage] = useState('Completing sign-in…');

  useEffect(() => {
    async function completeSignIn() {
      const { accessToken, refreshToken } = parseTokensFromLocation(window.location);

      if (!accessToken || !refreshToken) {
        setMessage('Missing Supabase session tokens. Check your callback URL settings.');
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
        setMessage('Failed to store the Supabase session cookies.');
        return;
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
      <p>{message}</p>
    </main>
  );
}
