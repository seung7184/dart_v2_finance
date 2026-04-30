# 82 — Phase 3 Quick Add Persistence Report

Date: 2026-04-30
Scope: Persistent Android Quick Add for authenticated manual expenses.

## Implementation Summary

Phase 3 replaces the local-only Quick Add simulation with real, authenticated persistence through a narrow Next.js API bridge. The mobile app now posts a manual expense to a new server route, which validates the Bearer token, derives the user ID server-side, auto-selects the user's first active account, and inserts a `source = 'manual'` transaction with `import_batch_id = null`.

## Files Created

Web:
- `apps/web/src/auth/bearer-token.ts` — Bearer token parser and Supabase validator
- `apps/web/src/auth/bearer-token.test.ts` — 14 tests for Bearer auth helper
- `apps/web/app/api/mobile/categories/route.ts` — GET /api/mobile/categories
- `apps/web/app/api/mobile/transactions/manual/route.ts` — POST /api/mobile/transactions/manual
- `apps/web/src/transactions/mobile-manual.ts` — Shared validation helpers (integer cents, user_id rejection)
- `apps/web/src/transactions/mobile-manual.test.ts` — 9 tests for mobile transaction validators

Mobile:
- `apps/mobile/src/api/client.ts` — Base fetch client, reads Bearer token from Supabase session
- `apps/mobile/src/api/categories.ts` — Fetches table-backed categories
- `apps/mobile/src/api/transactions.ts` — Posts manual transaction payload
- `apps/mobile/src/transactions/quick-add.ts` — Pure helpers: keypad conversion, validation, payload building, fallback categories
- `apps/mobile/src/transactions/quick-add.test.ts` — 25 tests for Quick Add helpers
- `apps/mobile/vitest.config.ts` — Vitest config with `@/` alias for pure helper tests

Files modified:
- `apps/mobile/app/quick-add.tsx` — Rewritten with real persistence, auth guard, error states, category loading
- `apps/mobile/.env.example` — Added `EXPO_PUBLIC_API_BASE_URL`
- `apps/mobile/package.json` — Added `vitest` devDependency and `test` script

## API / Data Flow

```
Android QuickAddScreen
  │
  ├─ On mount: fetchMobileCategories()
  │     → GET /api/mobile/categories
  │     → Authorization: Bearer <supabase-access-token>
  │     ← 200: MobileCategoryOption[]
  │     ← 401: show signed-out banner
  │     ← failure: keep FALLBACK_CATEGORIES (no DB category assigned)
  │
  └─ On save: postMobileManualTransaction({ amountCents, categoryId, notes })
        → POST /api/mobile/transactions/manual
        → Authorization: Bearer <supabase-access-token>
        → Body: { amountCents: integer, categoryId: string|null, notes: string|null }
        ← 201: { transaction: { id, amountCents, source, importBatchId, ... } }
        ← 401/403: auth error banner
        ← 422: NO_ACCOUNT_CONFIGURED error banner
        ← other: honest error banner with retry
```

## Auth / Session Assumptions

- The mobile Supabase client uses the anon key only. No service role key is used or expected.
- `mobileSupabase.auth.getSession()` returns the current access token, which is sent as `Authorization: Bearer <token>`.
- The web API route calls `getAuthenticatedUserIdFromBearerToken`, which:
  - Parses the Bearer scheme from the header
  - Calls Supabase `/auth/v1/user` to validate the token
  - Returns the user ID, or null if invalid
  - Does NOT use the web local-dev bypass (`LOCAL_DEV_USER_ID`) — mobile routes always require real auth
- `user_id` is never accepted from the request body. The route rejects any body containing `userId` or `user_id` with a 400 error.

## Category Handling Decision

Phase 3 loads table-backed categories via `GET /api/mobile/categories`. The route returns all system categories (user_id IS NULL) and user-owned categories (user_id = authenticated user), matching the contract from doc 77.

**Fallback behavior (documented):** If the categories API is unavailable or returns an empty list, the Quick Add screen keeps `FALLBACK_CATEGORIES` — a static list of 5 display-only categories (Groceries, Transport, Dining, Health, Other) with empty-string IDs. `resolveCategoryId()` maps these to `null`, so saved transactions have `category_id = NULL`. The user can categorize them later on the web app.

This is the "documented minimal fallback" described in the Phase 3 spec.

## Manual Transaction Payload Shape

Request body sent by mobile:

```ts
{
  amountCents: number;   // positive integer, e.g. 1240 = €12.40
  categoryId: string | null;  // real UUID, or null for fallback categories
  notes: string | null;  // optional merchant/note
}
```

Server-enforced fields (not accepted from client):

```ts
{
  source: 'manual',
  importBatchId: null,
  userId: <from Bearer token>,
  accountId: <auto-selected: first active account>,
  direction: 'expense',   // amount stored as negative cents per repo convention
  currency: 'EUR',
  intent: 'living_expense',
  reviewStatus: 'reviewed',
  occurredAt: <server time>,
  rawDescription: notes || 'Quick Add',
}
```

## Security Decisions

| Concern | Decision |
|---------|----------|
| Service role key in mobile | Absent. Mobile uses anon key only. Secret scan passes. |
| user_id from client body | Rejected — 400 `USER_ID_NOT_ACCEPTED` if present |
| Auth derivation | Bearer token → Supabase `/auth/v1/user` → server-side user ID |
| source enforcement | Always `'manual'`; not accepted from client |
| import_batch_id enforcement | Always `null`; not accepted from client |
| Account ownership | Auto-selected account must be owned by `authenticatedUserId` (queried with `WHERE user_id = authenticatedUserId`) |
| Category ownership | If categoryId provided, queried with `WHERE (user_id IS NULL OR user_id = authenticatedUserId)` |
| Signed-out mobile save | 401 from API; UI shows auth banner and disables Save button |
| Local-dev bypass | Web routes: bypass remains (`getLocalDevUserId`). Bearer routes: no bypass — always real Supabase auth |
| Cross-user read | Account auto-select uses `WHERE user_id = authenticatedUserId`, so no cross-user account access |

## What Remains Mock / Static

- **Safe-to-spend home:** Still mock. Phase 3 does not add live safe-to-spend.
- **Recent transactions list:** Still mock. Not touched.
- **Bills tab:** Still mock. Not touched.
- **Account selection UI:** Not exposed. Server auto-selects the user's first active account. No account picker in Quick Add.
- **Merchant memory / AI categorization:** Not implemented. Out of scope for V1.

## Known Limitations

1. **Account prerequisite:** If the user has no active accounts in the web app, `POST /api/mobile/transactions/manual` returns `422 NO_ACCOUNT_CONFIGURED`. Mobile displays a clear message: "No account is set up yet. Add an account on the web app first." The user must create an account via the web app before Quick Add persistence works.

2. **API base URL must be configured:** Mobile reads `EXPO_PUBLIC_API_BASE_URL` to know where the web app is. For local Android emulator development, this should be `http://10.0.2.2:3000` (the host alias Android uses for the dev machine). Without this env var, `mobileApiFetch` returns `{ status: 'unavailable', message: 'API base URL is not configured.' }`.

3. **RLS smoke testing not completed:** The Phase 3 implementation uses the Next.js API bridge (not direct Supabase writes from mobile), so app-level ownership checks substitute for direct RLS testing. Full RLS smoke testing remains a prerequisite before switching to direct Supabase inserts.

4. **Session expiry during save:** If the Supabase session expires mid-save, the API returns 401 and the user sees "Session expired. Please sign out and sign in again." Token refresh is handled by the Supabase JS client's `autoRefreshToken: true` setting, but there is no automatic retry on the mobile side after a refresh.

5. **Vitest CJS deprecation warning:** `pnpm --filter @dart/mobile test` prints a Vite CJS Node API deprecation warning. This is a cosmetic warning from the vitest version in use (1.6.x) and does not affect test results.

6. **Pre-existing web typecheck failure:** `pnpm typecheck` still fails on `apps/web/src/transactions/matching.test.ts(134,39)` with `TS2379` (`exactOptionalPropertyTypes`). This is the same pre-existing issue documented in reports 80 and 81. Phase 3 did not introduce it and did not fix it.

## Verification Results

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
pnpm --filter @dart/web test
```
Result: passed. 19 test files, 115 tests.
- New: `src/auth/bearer-token.test.ts` — 14 tests
- New: `src/transactions/mobile-manual.test.ts` — 9 tests
- All prior 92 tests continue to pass.

```bash
pnpm --filter @dart/mobile test
```
Result: passed. 1 test file, 25 tests.
- New: `src/transactions/quick-add.test.ts` — 25 tests

```bash
pnpm test
```
Result: passed. `@dart/core` 50 tests, `@dart/web` 115 tests, `@dart/mobile` 25 tests. All packages.

```bash
rg -n "SERVICE_ROLE|SUPABASE_SERVICE|service_role|DATABASE_URL|POSTGRES|SECRET|PRIVATE" apps/mobile
```
Result: CLEAN — no matches.

```bash
pnpm typecheck
```
Result: failed due to the pre-existing `matching.test.ts` TS2379 error only. All Phase 3 code typechecks cleanly. Mobile typecheck completed successfully inside this run.

## Manual QA Checklist

Before claiming Phase 3 complete in production, verify on an Android emulator or device:

- [ ] Sign in with magic link (Phase 2 smoke test — prerequisite).
- [ ] Open Quick Add from Home tab.
- [ ] Confirm the Save button is disabled with zero amount.
- [ ] Type digits on the keypad and confirm the amount display updates (e.g., 1240 → €12.40).
- [ ] Confirm backspace removes the last digit.
- [ ] Select a category chip and confirm it highlights.
- [ ] Tap Save; confirm the loading state ("Saving…") appears.
- [ ] Confirm a successful save shows "Saved €X.XX" in green and then navigates back.
- [ ] On the web app, confirm the transaction appears in the transactions list with `source = manual` and no import batch.
- [ ] Sign out and attempt to open Quick Add; confirm it redirects to sign-in before the save button can be tapped.
- [ ] With a real DB but no account configured, confirm the "No account is set up yet" error appears.
- [ ] Disconnect the API (stop the web server); confirm a network error message appears with a "Try again" button.
- [ ] Confirm no service role key appears in the Expo bundle or logs.

## Phase 4 Recommendation

The next logical phase is:

1. **Live safe-to-spend home payload** via `GET /api/mobile/home`, reusing `apps/web/src/safe-to-spend/data.ts` and `view-model.ts`. Return a `MobileSafeToSpendPayload` as specified in doc 77. This makes the Home tab live.
2. **Live recent transactions** via a new `GET /api/mobile/transactions/recent` route.
3. **Account selection UI** in Quick Add if multi-account users want to choose which account to charge.
4. **Notes input** in Quick Add — the current implementation accepts notes in the payload but does not expose a UI text field.
5. **Full RLS smoke test** for direct Supabase writes, as a prerequisite before any mobile code bypasses the API bridge.

Phase 4 should not begin until the Phase 3 manual QA checklist above is verified on a real Android emulator or device.
