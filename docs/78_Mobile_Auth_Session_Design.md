# 78 — Mobile Auth Session Design

Date: 2026-04-30
Status: Phase 2 implemented scaffold.

## Goal

Give the Expo Android app a real Supabase auth/session foundation without enabling live financial data or transaction writes.

## Implemented Shape

Files:

- `apps/mobile/src/auth/types.ts`
- `apps/mobile/src/auth/storage.ts`
- `apps/mobile/src/auth/supabase.ts`
- `apps/mobile/src/auth/session-provider.tsx`
- `apps/mobile/app/auth/sign-in.tsx`
- `apps/mobile/app/auth/callback.tsx`
- `apps/mobile/app/_layout.tsx`

Auth states:

- `loading`
- `signed_out`
- `signed_in`
- `config_missing`

Session storage:

- Supabase sessions are persisted through Expo SecureStore.
- SecureStore is accessed through a Supabase `SupportedStorage` adapter.
- No service role key is used or expected in mobile.

Supabase client:

- Uses `EXPO_PUBLIC_SUPABASE_URL`.
- Uses `EXPO_PUBLIC_SUPABASE_ANON_KEY`.
- Uses PKCE flow.
- Uses `detectSessionInUrl: false` because the callback route handles the auth code.
- Uses redirect URL `${EXPO_PUBLIC_APP_SCHEME}://auth/callback`.

## Route Guard

`apps/mobile/app/_layout.tsx` wraps the app in `MobileAuthSessionProvider`.

Guard behavior:

- `loading`: show a dark loading state.
- `signed_out`: redirect non-auth routes to `/auth/sign-in`.
- `config_missing`: redirect non-auth routes to `/auth/sign-in` and show configuration guidance.
- `signed_in`: redirect auth routes back to `/(tabs)`.

This means signed-in/signed-out state is now representable without making mock financial screens live.

## Sign-In Flow

1. User enters email on `/auth/sign-in`.
2. Mobile calls `mobileSupabase.auth.signInWithOtp`.
3. Supabase sends a magic link with redirect URL `dart-finance://auth/callback` by default.
4. `/auth/callback` reads the `code` param.
5. Mobile calls `exchangeCodeForSession(code)`.
6. Provider refreshes session from SecureStore-backed Supabase auth.
7. User is routed to `/(tabs)`.

## Sign-Out Flow

The home screen now exposes a small signed-in state row and a Sign out button.

Sign out calls:

```ts
mobileSupabase.auth.signOut()
```

Then the provider returns to `signed_out`, and the route guard sends the user back to `/auth/sign-in`.

## Required Environment Variables

Mobile public values:

```bash
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
EXPO_PUBLIC_APP_SCHEME=dart-finance
```

Existing billing placeholders remain in `apps/mobile/.env.example`, but billing is out of scope for Phase 2.

Never add these to mobile:

```bash
SUPABASE_SERVICE_ROLE_KEY
DATABASE_URL
POSTGRES_URL
```

## Security Notes

- User identity comes from the Supabase session.
- Mobile must not trust `user_id` from UI state or request bodies.
- Client writes must be compatible with RLS.
- The web local-dev auth bypass remains web-only.
- Direct mobile RLS behavior is not claimed verified until Phase 3 smoke testing.

## Explicitly Out Of Scope

- Quick Add persistence.
- Live safe-to-spend data.
- Live categories.
- CSV import.
- Reconciliation.
- Billing/paywall.
- New migrations.
- Production Supabase provider setting changes.

## Phase 3 Auth Prerequisites

- Register the mobile redirect URL in the Supabase project settings.
- Verify `dart-finance://auth/callback` opens the Android app.
- Verify the callback receives a `code` param on Android.
- Verify `auth.getUser()` returns the same ID as the web app profile.
- Verify SecureStore persists a session across app restart.
- Verify sign out clears the local session and returns to signed-out routing.
