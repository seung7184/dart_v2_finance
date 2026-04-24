import { describe, expect, it } from 'vitest';
import { getAuthCallbackRedirectFromUrl } from './root-token-redirect';

describe('getAuthCallbackRedirectFromUrl', () => {
  it('redirects root hash token flows to /auth/callback', () => {
    expect(
      getAuthCallbackRedirectFromUrl('http://localhost:3000/#access_token=redacted&refresh_token=redacted'),
    ).toBe('http://localhost:3000/auth/callback#access_token=redacted&refresh_token=redacted');
  });

  it('does not redirect when hash tokens are absent', () => {
    expect(getAuthCallbackRedirectFromUrl('http://localhost:3000/')).toBeNull();
    expect(getAuthCallbackRedirectFromUrl('http://localhost:3000/#foo=bar')).toBeNull();
  });

  it('does not redirect when already on /auth/callback', () => {
    expect(
      getAuthCallbackRedirectFromUrl(
        'http://localhost:3000/auth/callback#access_token=redacted&refresh_token=redacted',
      ),
    ).toBeNull();
  });
});
