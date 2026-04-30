import 'react-native-url-polyfill/auto';

import { createClient, type SupabaseClient } from '@supabase/supabase-js';

import { secureSessionStorage } from './storage';
import type { MagicLinkRequestResult } from './types';

type MobileAuthEnv = Record<string, string | undefined>;

type MobileSupabaseConfig = {
  anonKey: string;
  redirectTo: string;
  url: string;
};

function getRuntimeEnv(): MobileAuthEnv {
  const runtime = globalThis as typeof globalThis & {
    process?: {
      env?: MobileAuthEnv;
    };
  };

  return runtime.process?.env ?? {};
}

function cleanEnv(value: string | undefined): string | null {
  const cleaned = value?.trim();
  return cleaned && cleaned.length > 0 ? cleaned : null;
}

export function getMobileSupabaseConfig(
  env: MobileAuthEnv = getRuntimeEnv(),
): MobileSupabaseConfig | null {
  const url = cleanEnv(env.EXPO_PUBLIC_SUPABASE_URL);
  const anonKey = cleanEnv(env.EXPO_PUBLIC_SUPABASE_ANON_KEY);
  const scheme = cleanEnv(env.EXPO_PUBLIC_APP_SCHEME) ?? 'dart-finance';

  if (!url || !anonKey) {
    return null;
  }

  return {
    anonKey,
    redirectTo: `${scheme}://auth/callback`,
    url,
  };
}

const mobileSupabaseConfig = getMobileSupabaseConfig();

export const mobileSupabase: SupabaseClient | null = mobileSupabaseConfig
  ? createClient(mobileSupabaseConfig.url, mobileSupabaseConfig.anonKey, {
      auth: {
        autoRefreshToken: true,
        detectSessionInUrl: false,
        flowType: 'pkce',
        persistSession: true,
        storage: secureSessionStorage,
      },
    })
  : null;

export function getMobileAuthRedirectUrl(): string | null {
  return mobileSupabaseConfig?.redirectTo ?? null;
}

export function isMobileSupabaseConfigured(): boolean {
  return mobileSupabase !== null;
}

export async function requestMobileMagicLink(
  email: string,
): Promise<MagicLinkRequestResult> {
  const redirectTo = getMobileAuthRedirectUrl();
  const normalizedEmail = email.trim().toLowerCase();

  if (!mobileSupabase || !redirectTo) {
    return {
      status: 'error',
      message: 'Mobile Supabase auth is not configured.',
    };
  }

  const { error } = await mobileSupabase.auth.signInWithOtp({
    email: normalizedEmail,
    options: {
      emailRedirectTo: redirectTo,
      shouldCreateUser: true,
    },
  });

  if (error) {
    return {
      status: 'error',
      message: error.message,
    };
  }

  return {
    status: 'sent',
    email: normalizedEmail,
    redirectTo,
  };
}
