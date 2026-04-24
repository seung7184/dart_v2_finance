'use client';

import { useEffect } from 'react';
import { getAuthCallbackRedirectFromUrl } from './root-token-redirect';

export function RootTokenRedirect() {
  useEffect(() => {
    const redirectUrl = getAuthCallbackRedirectFromUrl(window.location.href);

    if (redirectUrl) {
      window.location.replace(redirectUrl);
    }
  }, []);

  return null;
}
