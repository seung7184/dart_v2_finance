# 81 — Mobile Auth Smoke Test Checklist

Date: 2026-04-30
Scope: Phase 2.5 Android auth/session smoke testing.

## Purpose

This checklist verifies the Phase 2 mobile auth/session foundation before any persistent Quick Add, live safe-to-spend, live categories, transaction writes, migrations, CSV import, reconciliation, or billing/paywall work begins.

## Required Local Env Vars

Required mobile auth variables:

```bash
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
EXPO_PUBLIC_APP_SCHEME=dart-finance
```

These are client-safe public values. Mobile must not contain:

```bash
SUPABASE_SERVICE_ROLE_KEY
DATABASE_URL
POSTGRES_URL
```

Existing RevenueCat public-key placeholders may remain in `apps/mobile/.env.example`, but billing is outside Phase 2.5.

## Supabase Dashboard Redirect URL Checklist

In the Supabase project used for mobile auth:

- Add `dart-finance://auth/callback` to allowed redirect URLs.
- Confirm the project URL matches `EXPO_PUBLIC_SUPABASE_URL`.
- Confirm the anon key matches `EXPO_PUBLIC_SUPABASE_ANON_KEY`.
- Confirm email OTP/magic-link auth is enabled.
- Confirm no service role key is copied into mobile env, app config, logs, or code.
- If testing a custom scheme, ensure `EXPO_PUBLIC_APP_SCHEME` and `apps/mobile/app.json` `expo.scheme` match.

## Android Emulator Test Steps

1. Start the mobile app:

   ```bash
   pnpm --dir apps/mobile start
   ```

2. Open the app in an Android emulator.
3. With no existing session, confirm the app routes to `/auth/sign-in`.
4. Confirm Home, Transactions, Bills, and Quick Add are not reachable while signed out.
5. Enter an invalid email and confirm the magic-link button stays disabled.
6. Enter a valid test email and tap Send magic link.
7. Confirm the sign-in screen shows a sent-link message.
8. Open the email link on the emulator, or paste/open the `dart-finance://auth/callback?...` link through Android intent tooling.
9. Confirm `/auth/callback` shows a loading state, exchanges the code, and routes to `/(tabs)`.
10. Confirm the Home screen shows the signed-in email/state row.
11. Close and reopen the app; confirm the session is restored from SecureStore.
12. Tap Sign out.
13. Confirm the app clears the local session and routes back to `/auth/sign-in`.

## Real Android Device Test Steps

1. Install or run the Expo build on a real Android device.
2. Confirm the same env values are available to the build.
3. Confirm `dart-finance://auth/callback` opens the app from the device browser/email client.
4. Start signed out and confirm the sign-in screen appears.
5. Request a magic link for a real test account.
6. Open the link from the same Android device.
7. Confirm callback success routes to the tab app.
8. Confirm app restart preserves the session.
9. Confirm Sign out returns to the sign-in screen.
10. Confirm requesting a new magic link while already signed in does not trap the app in a redirect loop.

## Expected Signed-Out Behavior

- Auth provider state is `signed_out` when no stored session exists.
- Non-auth routes redirect to `/auth/sign-in`.
- `/auth/sign-in` remains visible.
- `/auth/callback` remains available so a magic-link callback can complete.
- Mock financial screens are not reachable while signed out.
- No local-dev bypass is used on mobile.

## Expected Signed-In Behavior

- Auth provider state is `signed_in` with a Supabase `session` and `user`.
- `/auth/sign-in` redirects to `/(tabs)`.
- `/auth/callback` is allowed to render so callback links do not get blocked by an existing session.
- Home shows a small signed-in row.
- Home, Transactions, Bills, and Quick Add remain mock/static.
- No live financial data reads or writes occur.

## Expected Callback Behavior

Success:

- Callback route receives a `code` param.
- Mobile calls `exchangeCodeForSession(code)`.
- Provider refreshes the session.
- User is routed to `/(tabs)`.

Error:

- If Supabase returns `error_description`, `error`, or `error_code`, the callback displays that message.
- If no `code` exists, the callback displays a clear invalid-link message.
- If Supabase mobile env is missing, the callback displays a configuration message.
- Error state exposes a Back to sign in action.

## Expected Sign-Out Behavior

- Sign out calls Supabase auth sign-out with local scope.
- Local SecureStore-backed session is cleared.
- Provider state moves to `signed_out`.
- Route guard sends the user to `/auth/sign-in`.
- No server-side service role or database operation is involved.

## Auth Guard Hardening Notes

The route guard should avoid redirect loops:

- `loading` shows a spinner and does not redirect.
- `signed_out` and `config_missing` redirect only non-auth routes to `/auth/sign-in`.
- `signed_in` redirects `/auth/sign-in` to `/(tabs)`.
- `signed_in` does not forcibly redirect `/auth/callback`, so callback links can be processed honestly.

## Required Code Checks

- Mobile env contract references only client-safe public auth values.
- Mobile code does not reference service role keys.
- Supabase client uses Expo SecureStore-compatible storage.
- Provider handles initial loading, signed-in, signed-out, auth state changes, and unsubscribe cleanup.
- Callback handles success and error states.
- Sign out clears local session state.

## Known Limitations

- Manual Android emulator/device auth has not been completed in this repository session.
- `pnpm --dir apps/mobile start` starts an interactive Expo dev server and should be stopped after smoke testing.
- `pnpm --dir apps/mobile start` starts Metro on `http://localhost:8081`; in this session it still reported pre-existing Expo compatibility warnings for `@expo/vector-icons@14.1.0` and `react-native@0.76.0`.
- Mobile has no automated test script yet.
- Mobile still uses mock/static safe-to-spend, category, bill, transaction, and Quick Add data.
- Direct mobile RLS behavior is not smoke-tested yet.
- Full monorepo `pnpm typecheck` may still fail because of the pre-existing `apps/web/src/transactions/matching.test.ts` `exactOptionalPropertyTypes` issue documented in `docs/80_Phase_2_Verification_Report.md`.

## Verification Run

Commands run during Phase 2.5:

```bash
rg -n "SERVICE_ROLE|SUPABASE_SERVICE|service_role|service role|DATABASE_URL|POSTGRES|SECRET|PRIVATE" apps/mobile
```

Result: passed; no matches.

```bash
pnpm tsc --noEmit
```

Result: passed.

```bash
pnpm --dir apps/mobile typecheck
```

Result: passed.

```bash
pnpm --filter @dart/mobile typecheck
```

Result: passed.

```bash
pnpm test
```

Result: passed from Turbo cache. `@dart/core` reported 50 tests passed; `@dart/web` reported 92 tests passed.

```bash
pnpm --dir apps/mobile start
```

Result: Metro started and waited on `http://localhost:8081`. The server was stopped after the smoke check. The first run exposed an incompatible `expo-secure-store` version, which was corrected to `~14.0.1`; the follow-up run no longer warned about `expo-secure-store`.

```bash
pnpm typecheck
```

Result: failed due to the pre-existing web test issue:

```text
apps/web/src/transactions/matching.test.ts(134,39): error TS2379
```

The mobile package typecheck completed successfully inside that command before the web package failed.

## Phase 3 Readiness Decision

Phase 3 Quick Add persistence is not ready until all of these are true:

- Android emulator magic-link sign-in passes.
- Real Android device magic-link sign-in passes.
- Session survives app restart.
- Sign out reliably returns to `/auth/sign-in`.
- `auth.getUser()` returns the same user ID as the web app profile row.
- RLS smoke tests confirm own-row access and cross-user denial.
- Table-backed categories can be loaded for the signed-in user.
- Active manual-entry accounts can be loaded for the signed-in user.
- The team chooses a Next.js API route or direct Supabase path for manual transaction creation.

Until then, Quick Add must remain local-only and non-persistent.
