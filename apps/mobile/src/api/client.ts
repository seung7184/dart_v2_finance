import { mobileSupabase } from '@/src/auth/supabase';

export type MobileApiResult<T> =
  | { status: 'ok'; data: T }
  | { status: 'auth_required' }
  | { status: 'unavailable'; message: string };

function getApiBaseUrl(): string | null {
  const runtime = globalThis as typeof globalThis & {
    process?: { env?: Record<string, string | undefined> };
  };
  const raw = runtime.process?.env?.EXPO_PUBLIC_API_BASE_URL?.trim();
  return raw && raw.length > 0 ? raw.replace(/\/$/, '') : null;
}

async function getBearerToken(): Promise<string | null> {
  if (!mobileSupabase) {
    return null;
  }

  const { data } = await mobileSupabase.auth.getSession();
  return data.session?.access_token ?? null;
}

export async function mobileApiFetch<T>(
  path: string,
  options?: RequestInit,
): Promise<MobileApiResult<T>> {
  const baseUrl = getApiBaseUrl();
  if (!baseUrl) {
    return { status: 'unavailable', message: 'API base URL is not configured.' };
  }

  const token = await getBearerToken();
  if (!token) {
    return { status: 'auth_required' };
  }

  const url = `${baseUrl}${path}`;
  let response: Response;

  try {
    response = await fetch(url, {
      ...options,
      headers: {
        'content-type': 'application/json',
        ...options?.headers,
        authorization: `Bearer ${token}`,
      },
    });
  } catch {
    return { status: 'unavailable', message: 'Network request failed.' };
  }

  if (response.status === 401 || response.status === 403) {
    return { status: 'auth_required' };
  }

  if (!response.ok) {
    let message = `Server error ${response.status}`;
    try {
      const body = (await response.json()) as Record<string, unknown>;
      if (typeof body.error === 'string') {
        message = body.error;
      } else if (typeof body.message === 'string') {
        message = body.message;
      }
    } catch {
      // keep default message
    }
    return { status: 'unavailable', message };
  }

  try {
    const data = (await response.json()) as T;
    return { status: 'ok', data };
  } catch {
    return { status: 'unavailable', message: 'Invalid response from server.' };
  }
}
