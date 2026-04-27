import { describe, expect, it, vi } from 'vitest';
import {
  fetchSupabaseUser,
  getAuthenticatedUserIdFromCookieHeader,
  getLocalDevUserId,
  getSupabaseAuthConfig,
  getSupabaseSessionFromCookieHeader,
  LOCAL_DEV_USER_ID,
} from './session';
import {
  SUPABASE_ACCESS_TOKEN_COOKIE,
  SUPABASE_REFRESH_TOKEN_COOKIE,
} from './constants';

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

describe('getLocalDevUserId', () => {
  it('returns a stable local user id when running development without Supabase env', () => {
    expect(getLocalDevUserId({ NODE_ENV: 'development' })).toBe(LOCAL_DEV_USER_ID);
  });

  it('does not bypass auth in production', () => {
    expect(getLocalDevUserId({ NODE_ENV: 'production' })).toBeNull();
  });

  it('still returns a local user in development when Supabase env is configured', () => {
    expect(
      getLocalDevUserId({
        NEXT_PUBLIC_SUPABASE_ANON_KEY: 'anon-key',
        NEXT_PUBLIC_SUPABASE_URL: 'https://project.supabase.co',
        NODE_ENV: 'development',
      }),
    ).toBe(LOCAL_DEV_USER_ID);
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
        fetchImpl as unknown as typeof fetch,
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
        fetchImpl as unknown as typeof fetch,
      ),
    ).resolves.toBeNull();
  });
});

describe('getAuthenticatedUserIdFromCookieHeader', () => {
  it('uses the local dev user before Supabase cookies in development', async () => {
    const originalEnv = process.env;
    const fetchImpl = vi.fn();

    vi.stubGlobal('process', {
      ...process,
      env: {
        ...originalEnv,
        NEXT_PUBLIC_SUPABASE_ANON_KEY: 'anon-key',
        NEXT_PUBLIC_SUPABASE_URL: 'https://project.supabase.co',
        NODE_ENV: 'development',
      },
    });

    await expect(
      getAuthenticatedUserIdFromCookieHeader(
        `${SUPABASE_ACCESS_TOKEN_COOKIE}=access-123; ${SUPABASE_REFRESH_TOKEN_COOKIE}=refresh-123`,
        fetchImpl as unknown as typeof fetch,
      ),
    ).resolves.toBe(LOCAL_DEV_USER_ID);

    expect(fetchImpl).not.toHaveBeenCalled();
    vi.unstubAllGlobals();
  });
});
