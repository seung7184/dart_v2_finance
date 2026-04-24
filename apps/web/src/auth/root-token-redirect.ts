function hasSupabaseHashTokens(hash: string) {
  const params = new URLSearchParams(hash.replace(/^#/, ''));
  return Boolean(params.get('access_token') && params.get('refresh_token'));
}

export function getAuthCallbackRedirectFromUrl(url: string): string | null {
  const parsedUrl = new URL(url);

  if (parsedUrl.pathname === '/auth/callback') {
    return null;
  }

  if (!hasSupabaseHashTokens(parsedUrl.hash)) {
    return null;
  }

  parsedUrl.pathname = '/auth/callback';
  return parsedUrl.toString();
}
