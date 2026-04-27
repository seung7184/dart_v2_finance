import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import {
  SUPABASE_ACCESS_TOKEN_COOKIE,
  SUPABASE_REFRESH_TOKEN_COOKIE,
} from './constants';

type CookieSession = {
  accessToken: string;
  refreshToken: string;
};

type SupabaseAuthConfig = {
  anonKey: string;
  authUrl: string;
};

type SupabaseUser = {
  id: string;
};

export const LOCAL_DEV_USER_ID = '00000000-0000-4000-8000-000000000001';

function parseCookieHeader(cookieHeader: string): Map<string, string> {
  return cookieHeader
    .split(';')
    .map((segment) => segment.trim())
    .filter((segment) => segment.length > 0)
    .reduce<Map<string, string>>((allCookies, segment) => {
      const separatorIndex = segment.indexOf('=');
      const key = separatorIndex === -1 ? segment : segment.slice(0, separatorIndex);
      const value = separatorIndex === -1 ? '' : segment.slice(separatorIndex + 1);
      allCookies.set(key, decodeURIComponent(value));
      return allCookies;
    }, new Map<string, string>());
}

function cleanToken(value: string | undefined) {
  const token = value?.trim();
  return token && token.length > 0 ? token : null;
}

export function getSupabaseSessionFromCookieHeader(cookieHeader: string | null): CookieSession | null {
  if (!cookieHeader) {
    return null;
  }

  const parsedCookies = parseCookieHeader(cookieHeader);
  const accessToken = cleanToken(parsedCookies.get(SUPABASE_ACCESS_TOKEN_COOKIE));
  const refreshToken = cleanToken(parsedCookies.get(SUPABASE_REFRESH_TOKEN_COOKIE));

  if (!accessToken || !refreshToken) {
    return null;
  }

  return {
    accessToken,
    refreshToken,
  };
}

export function getSupabaseAuthConfig(
  env: Record<string, string | undefined>,
): SupabaseAuthConfig | null {
  const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const anonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

  if (!supabaseUrl || !anonKey) {
    return null;
  }

  return {
    anonKey,
    authUrl: `${supabaseUrl.replace(/\/$/, '')}/auth/v1`,
  };
}

export function getLocalDevUserId(env: Record<string, string | undefined>): string | null {
  if (env.NODE_ENV === 'production') {
    return null;
  }

  return LOCAL_DEV_USER_ID;
}

export async function fetchSupabaseUser(
  accessToken: string,
  config: SupabaseAuthConfig,
  fetchImpl: typeof fetch = fetch,
): Promise<SupabaseUser | null> {
  const response = await fetchImpl(`${config.authUrl}/user`, {
    method: 'GET',
    headers: {
      apikey: config.anonKey,
      authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    return null;
  }

  const payload = (await response.json()) as Record<string, unknown>;
  const userId = typeof payload.id === 'string' ? payload.id : null;

  return userId ? { id: userId } : null;
}

export async function getAuthenticatedUserIdFromCookieHeader(
  cookieHeader: string | null,
  fetchImpl: typeof fetch = fetch,
): Promise<string | null> {
  const localDevUserId = getLocalDevUserId(process.env);
  if (localDevUserId) {
    return localDevUserId;
  }

  const session = getSupabaseSessionFromCookieHeader(cookieHeader);
  const config = getSupabaseAuthConfig(process.env);

  if (!session || !config) {
    return null;
  }

  const user = await fetchSupabaseUser(session.accessToken, config, fetchImpl);
  return user?.id ?? null;
}

export async function getAuthenticatedUserIdFromRequestCookies(
  fetchImpl: typeof fetch = fetch,
): Promise<string | null> {
  const localDevUserId = getLocalDevUserId(process.env);
  if (localDevUserId) {
    return localDevUserId;
  }

  const cookieStore = await cookies();
  const accessToken = cleanToken(cookieStore.get(SUPABASE_ACCESS_TOKEN_COOKIE)?.value);
  const refreshToken = cleanToken(cookieStore.get(SUPABASE_REFRESH_TOKEN_COOKIE)?.value);
  const config = getSupabaseAuthConfig(process.env);

  if (!accessToken || !refreshToken || !config) {
    return null;
  }

  const user = await fetchSupabaseUser(accessToken, config, fetchImpl);
  return user?.id ?? null;
}

export async function requireAuthenticatedAppUser(): Promise<string> {
  const userId = await getAuthenticatedUserIdFromRequestCookies();

  if (!userId) {
    redirect('/sign-in');
  }

  return userId;
}
