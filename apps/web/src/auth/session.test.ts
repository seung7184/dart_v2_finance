import { describe, expect, it, vi } from 'vitest';
import {
  SUPABASE_ACCESS_TOKEN_COOKIE,
  SUPABASE_REFRESH_TOKEN_COOKIE,
  fetchSupabaseUser,
  getSupabaseAuthConfig,
  getSupabaseSessionFromCookieHeader,
} from './session';

describe('getSupabaseSessionFromCookieHeader', () => {
  it('returns null when auth cookies are missing', () => {
    expect(getSupabaseSessionFromCookieHeader(null)).toBeNull();
    expect(getSupabaseSessionFromCookieHeader('theme=dark')).toBeNull();
  });

  it('extracts access and refresh tokens from cookie headers', () => {
    expect(
      getSupabaseSessionFromCookieHeader(
        `theme=dark; ${SUPABASE_ACCESS_TOKEN_COOKIE}=access-123; ${SUPABASE_REFRESH_TOKEN_COOKIE}=refresh-123`,
      ),
    ).toEqual({
      accessToken: 'access-123',
      refreshToken: 'refresh-123',
    });
  });

  it('treats blank token cookies as missing', () => {
    expect(
      getSupabaseSessionFromCookieHeader(
        `${SUPABASE_ACCESS_TOKEN_COOKIE}= ; ${SUPABASE_REFRESH_TOKEN_COOKIE}=refresh-123`,
      ),
    ).toBeNull();
  });
});

describe('getSupabaseAuthConfig', () => {
  it('returns null when required env is missing', () => {
    expect(getSupabaseAuthConfig({})).toBeNull();
  });

  it('returns the auth config when url and anon key exist', () => {
    expect(
      getSupabaseAuthConfig({
        NEXT_PUBLIC_SUPABASE_ANON_KEY: 'anon-key',
        NEXT_PUBLIC_SUPABASE_URL: 'https://project.supabase.co',
      }),
    ).toEqual({
      anonKey: 'anon-key',
      authUrl: 'https://project.supabase.co/auth/v1',
    });
  });
});

describe('fetchSupabaseUser', () => {
  it('returns the authenticated user id from the Supabase auth user endpoint', async () => {
    const fetchImpl = vi.fn(async () => ({
      ok: true,
      json: async () => ({
        id: 'user-123',
      }),
    }));

    await expect(
      fetchSupabaseUser(
        'access-123',
        {
          anonKey: 'anon-key',
          authUrl: 'https://project.supabase.co/auth/v1',
        },
        fetchImpl as typeof fetch,
      ),
    ).resolves.toEqual({
      id: 'user-123',
    });

    expect(fetchImpl).toHaveBeenCalledWith('https://project.supabase.co/auth/v1/user', {
      headers: {
        apikey: 'anon-key',
        authorization: 'Bearer access-123',
      },
      method: 'GET',
    });
  });

  it('returns null when the Supabase user endpoint rejects the access token', async () => {
    const fetchImpl = vi.fn(async () => ({
      ok: false,
      status: 401,
    }));

    await expect(
      fetchSupabaseUser(
        'access-123',
        {
          anonKey: 'anon-key',
          authUrl: 'https://project.supabase.co/auth/v1',
        },
        fetchImpl as typeof fetch,
      ),
    ).resolves.toBeNull();
  });
});
