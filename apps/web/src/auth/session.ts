import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export const AUTH_COOKIE_NAME = 'dart_auth_uid';

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

export function getAuthenticatedUserIdFromCookieHeader(cookieHeader: string | null): string | null {
  if (!cookieHeader) {
    return null;
  }

  const parsedCookies = parseCookieHeader(cookieHeader);
  const candidate = parsedCookies.get(AUTH_COOKIE_NAME)?.trim();

  return candidate ? candidate : null;
}

export async function getAuthenticatedUserIdFromRequestCookies(): Promise<string | null> {
  const cookieStore = await cookies();
  const cookieValue = cookieStore.get(AUTH_COOKIE_NAME)?.value?.trim();

  return cookieValue ? cookieValue : null;
}

export async function requireAuthenticatedAppUser(): Promise<string> {
  const userId = await getAuthenticatedUserIdFromRequestCookies();

  if (!userId) {
    redirect('/sign-in');
  }

  return userId;
}

