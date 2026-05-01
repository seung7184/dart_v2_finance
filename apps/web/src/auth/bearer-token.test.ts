import { describe, expect, it, vi } from 'vitest';
import { parseBearerToken, getAuthenticatedUserIdFromBearerToken } from './bearer-token';

describe('parseBearerToken', () => {
  it('returns null for null input', () => {
    expect(parseBearerToken(null)).toBeNull();
  });

  it('returns null for empty string', () => {
    expect(parseBearerToken('')).toBeNull();
  });

  it('returns null when scheme is not Bearer', () => {
    expect(parseBearerToken('Basic sometoken')).toBeNull();
    expect(parseBearerToken('Token abc123')).toBeNull();
  });

  it('returns null when only scheme is present', () => {
    expect(parseBearerToken('Bearer')).toBeNull();
    expect(parseBearerToken('Bearer ')).toBeNull();
  });

  it('returns null when extra parts are present', () => {
    expect(parseBearerToken('Bearer tok en extra')).toBeNull();
  });

  it('extracts token from valid Bearer header', () => {
    expect(parseBearerToken('Bearer abc123')).toBe('abc123');
  });

  it('is case-insensitive for the Bearer scheme', () => {
    expect(parseBearerToken('bearer abc123')).toBe('abc123');
    expect(parseBearerToken('BEARER abc123')).toBe('abc123');
  });

  it('trims surrounding whitespace from the header', () => {
    expect(parseBearerToken('  Bearer abc123  ')).toBe('abc123');
  });
});

describe('getAuthenticatedUserIdFromBearerToken', () => {
  it('returns null when no authorization header is provided', async () => {
    const result = await getAuthenticatedUserIdFromBearerToken(null);
    expect(result).toBeNull();
  });

  it('returns null when the token format is invalid', async () => {
    const result = await getAuthenticatedUserIdFromBearerToken('not-bearer-format');
    expect(result).toBeNull();
  });

  it('returns null when Supabase config env vars are missing', async () => {
    const savedUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const savedKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    try {
      const result = await getAuthenticatedUserIdFromBearerToken('Bearer valid-token');
      expect(result).toBeNull();
    } finally {
      if (savedUrl !== undefined) {
        process.env.NEXT_PUBLIC_SUPABASE_URL = savedUrl;
      }
      if (savedKey !== undefined) {
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = savedKey;
      }
    }
  });

  it('returns the user ID when Supabase validates the token', async () => {
    const savedUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const savedKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://project.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon-key';

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ id: 'user-uuid-123' }),
    });

    try {
      const result = await getAuthenticatedUserIdFromBearerToken(
        'Bearer valid-token',
        mockFetch as unknown as typeof fetch,
      );
      expect(result).toBe('user-uuid-123');
    } finally {
      if (savedUrl !== undefined) {
        process.env.NEXT_PUBLIC_SUPABASE_URL = savedUrl;
      } else {
        delete process.env.NEXT_PUBLIC_SUPABASE_URL;
      }
      if (savedKey !== undefined) {
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = savedKey;
      } else {
        delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      }
    }
  });

  it('returns null when Supabase rejects the token', async () => {
    const savedUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const savedKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://project.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon-key';

    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
    });

    try {
      const result = await getAuthenticatedUserIdFromBearerToken(
        'Bearer expired-token',
        mockFetch as unknown as typeof fetch,
      );
      expect(result).toBeNull();
    } finally {
      if (savedUrl !== undefined) {
        process.env.NEXT_PUBLIC_SUPABASE_URL = savedUrl;
      } else {
        delete process.env.NEXT_PUBLIC_SUPABASE_URL;
      }
      if (savedKey !== undefined) {
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = savedKey;
      } else {
        delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      }
    }
  });

  it('does not use the local-dev bypass', async () => {
    // Remove Supabase config so there is nothing to validate against.
    // Even in NODE_ENV=development, the bearer-token path must return null
    // rather than falling back to LOCAL_DEV_USER_ID.
    const savedUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const savedKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    try {
      const result = await getAuthenticatedUserIdFromBearerToken('Bearer some-token');
      expect(result).toBeNull();
    } finally {
      if (savedUrl !== undefined) {
        process.env.NEXT_PUBLIC_SUPABASE_URL = savedUrl;
      }
      if (savedKey !== undefined) {
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = savedKey;
      }
    }
  });
});
