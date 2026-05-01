import { fetchSupabaseUser, getSupabaseAuthConfig } from './session';

function parseBearerToken(authorizationHeader: string | null): string | null {
  if (!authorizationHeader) {
    return null;
  }

  const parts = authorizationHeader.trim().split(/\s+/);
  if (parts.length !== 2 || parts[0]?.toLowerCase() !== 'bearer') {
    return null;
  }

  const token = parts[1]?.trim();
  return token && token.length > 0 ? token : null;
}

/**
 * Validates a Supabase Bearer token from an Authorization header.
 * Returns the authenticated user ID, or null if the token is missing or invalid.
 * Never uses the local-dev bypass — mobile routes require real auth.
 */
export async function getAuthenticatedUserIdFromBearerToken(
  authorizationHeader: string | null,
  fetchImpl: typeof fetch = fetch,
): Promise<string | null> {
  const token = parseBearerToken(authorizationHeader);
  if (!token) {
    return null;
  }

  const config = getSupabaseAuthConfig(process.env);
  if (!config) {
    return null;
  }

  const user = await fetchSupabaseUser(token, config, fetchImpl);
  return user?.id ?? null;
}

export { parseBearerToken };
