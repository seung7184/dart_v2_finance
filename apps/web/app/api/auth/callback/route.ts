import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import {
  SUPABASE_ACCESS_TOKEN_COOKIE,
  SUPABASE_REFRESH_TOKEN_COOKIE,
} from '@/auth/constants';

type CallbackPayload = {
  accessToken?: unknown;
  refreshToken?: unknown;
};

function getToken(value: unknown): string | null {
  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : null;
}

export async function POST(request: Request) {
  const payload = (await request.json()) as CallbackPayload;
  const accessToken = getToken(payload.accessToken);
  const refreshToken = getToken(payload.refreshToken);

  if (!accessToken || !refreshToken) {
    return NextResponse.json({ error: 'INVALID_AUTH_CALLBACK' }, { status: 400 });
  }

  const cookieStore = await cookies();
  const secure = new URL(request.url).protocol === 'https:';

  cookieStore.set(SUPABASE_ACCESS_TOKEN_COOKIE, accessToken, {
    httpOnly: true,
    path: '/',
    sameSite: 'lax',
    secure,
  });
  cookieStore.set(SUPABASE_REFRESH_TOKEN_COOKIE, refreshToken, {
    httpOnly: true,
    path: '/',
    sameSite: 'lax',
    secure,
  });

  return NextResponse.json({ status: 'session_stored' }, { status: 200 });
}
