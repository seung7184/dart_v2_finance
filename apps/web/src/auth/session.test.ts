import { describe, expect, it } from 'vitest';
import {
  AUTH_COOKIE_NAME,
  getAuthenticatedUserIdFromCookieHeader,
} from './session';

describe('getAuthenticatedUserIdFromCookieHeader', () => {
  it('returns null when the auth cookie is missing', () => {
    expect(getAuthenticatedUserIdFromCookieHeader(null)).toBeNull();
    expect(getAuthenticatedUserIdFromCookieHeader('theme=dark')).toBeNull();
  });

  it('extracts the authenticated user id from the cookie header', () => {
    expect(
      getAuthenticatedUserIdFromCookieHeader(`theme=dark; ${AUTH_COOKIE_NAME}=user-123; mode=beta`),
    ).toBe('user-123');
  });

  it('treats blank auth cookie values as missing', () => {
    expect(getAuthenticatedUserIdFromCookieHeader(`${AUTH_COOKIE_NAME}=   `)).toBeNull();
  });
});

