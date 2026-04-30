# 80 — Phase 2 Verification Report

Date: 2026-04-30
Scope: mobile auth/session foundation and web/mobile contract docs.

## Files Changed

Mobile implementation:

- `apps/mobile/package.json`
- `apps/mobile/.env.example`
- `apps/mobile/app/_layout.tsx`
- `apps/mobile/app/(tabs)/_layout.tsx`
- `apps/mobile/app/(tabs)/index.tsx`
- `apps/mobile/app/auth/sign-in.tsx`
- `apps/mobile/app/auth/callback.tsx`
- `apps/mobile/src/auth/types.ts`
- `apps/mobile/src/auth/storage.ts`
- `apps/mobile/src/auth/supabase.ts`
- `apps/mobile/src/auth/session-provider.tsx`
- `pnpm-lock.yaml`

Docs:

- `docs/77_Web_Mobile_Data_Contract.md`
- `docs/78_Mobile_Auth_Session_Design.md`
- `docs/79_Mobile_API_Bridge_Design.md`
- `docs/80_Phase_2_Verification_Report.md`

Pre-existing untracked audit doc retained:

- `docs/70_Android_Audit_Report.md`

## What Phase 2 Implemented

- Added client-safe Supabase JS dependency to mobile.
- Added Expo SecureStore-backed Supabase session storage.
- Added mobile auth state provider with `loading`, `signed_out`, `signed_in`, and `config_missing`.
- Added Expo Router auth guard.
- Added mobile sign-in screen for Supabase magic links.
- Added mobile auth callback screen for PKCE code exchange.
- Added visible signed-in state and sign-out action on the mock home screen.
- Registered existing mock Transactions and Bills tabs.
- Documented web/mobile identity, data contract, API bridge, RLS smoke test plan, env vars, and Phase 3 prerequisites.

## What Phase 2 Did Not Implement

- Quick Add DB persistence.
- Live safe-to-spend home data.
- Live category loading.
- Mobile CSV import.
- AI categorization.
- Transaction reconciliation.
- Billing/paywall.
- New DB migrations.
- Service role usage in mobile.
- Production auth provider setting changes.

## Security Checks

- No Supabase service role key was added to mobile.
- Mobile env example uses only `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY`, and `EXPO_PUBLIC_APP_SCHEME`.
- Mobile auth identity comes from Supabase session state.
- Existing web local-dev bypass was not copied into mobile.
- Financial writes remain postponed.
- RLS smoke testing is documented as a Phase 3 prerequisite before Quick Add persistence.

## Verification Commands

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

Result: passed. Turbo replayed cached test logs:

- `@dart/core`: 7 test files, 50 tests passed.
- `@dart/web`: 17 test files, 92 tests passed.

```bash
pnpm --filter @dart/mobile test
```

Result: passed with no output because `@dart/mobile` currently has no `test` script.

```bash
pnpm typecheck
```

Result: failed due to the pre-existing web test type error listed below. The mobile package typecheck completed successfully inside this run.

## Known Pre-Existing Issue

The Phase 1 audit found that:

```bash
pnpm typecheck
```

failed in `apps/web/src/transactions/matching.test.ts` with `TS2379` because a test passes `importedTransactionId: undefined` under `exactOptionalPropertyTypes`.

This was not caused by Phase 2 and was not fixed in Phase 2.

Next action: fix the web test fixture by omitting `importedTransactionId` instead of passing `undefined`, or widen the target type if `undefined` is truly intentional. This should be handled outside Phase 2 because the touched work is mobile auth/session and docs only.

## Phase 3 Prerequisites Before Quick Add Persistence

- Register and verify `dart-finance://auth/callback` in Supabase auth redirect settings.
- Verify Android emulator/device magic-link callback reaches `/auth/callback`.
- Verify `exchangeCodeForSession` succeeds on Android.
- Verify SecureStore session survives app restart.
- Verify mobile `auth.getUser()` user ID matches the web app profile row.
- Choose Next.js API route vs direct Supabase write for manual transactions.
- Implement table-backed category loading.
- Implement active account loading.
- Complete RLS smoke tests for own-row access, cross-user denial, and mismatched `user_id` rejection.
- Decide whether mobile manual transaction creation reuses or wraps the existing web manual route validation.
