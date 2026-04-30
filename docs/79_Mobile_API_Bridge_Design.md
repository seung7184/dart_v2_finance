# 79 — Mobile API Bridge Design

Date: 2026-04-30
Status: Phase 2 design. No live financial bridge implemented yet.

## Decision

Mobile will use a hybrid bridge:

- Direct Supabase client for auth/session.
- Next.js API routes for composed financial payloads.
- Direct Supabase reads/writes only when the query is simple, RLS-safe, and smoke-tested.

This keeps server-owned Drizzle composition on the web side and avoids duplicating financial query policy in React Native screens.

## Identity Model

For API routes:

- Mobile must send a Supabase access token with `Authorization: Bearer <token>`.
- The API route must validate that token against Supabase Auth.
- The API route must derive `userId` server-side.
- Request bodies must not contain trusted `userId`.

For direct Supabase:

- Supabase JS sends the authenticated JWT.
- RLS uses `auth.uid()`.
- Direct writes must use `user_id = auth.uid()` and must be tested against mismatch attempts.

## Proposed Mobile API Client Boundary

Phase 3 can add a small mobile API client under:

```text
apps/mobile/src/api/
```

Candidate functions:

```ts
type MobileApiResult<T> =
  | { status: 'ok'; data: T }
  | { status: 'auth_required' }
  | { status: 'unavailable'; message: string };

async function getMobileHome(): Promise<MobileApiResult<MobileSafeToSpendPayload>>;
async function getMobileCategories(): Promise<MobileApiResult<MobileCategoryOption[]>>;
async function getMobileManualEntryOptions(): Promise<MobileApiResult<MobileManualEntryOptions>>;
```

The client should read the access token from `mobileSupabase.auth.getSession()` and attach only the bearer token.

## Proposed Web API Routes

Candidate Phase 3 routes:

```text
apps/web/app/api/mobile/home/route.ts
apps/web/app/api/mobile/categories/route.ts
apps/web/app/api/mobile/manual-entry-options/route.ts
apps/web/app/api/mobile/transactions/manual/route.ts
```

The manual transaction route must be added only when Quick Add persistence begins. It should reuse existing validation logic where possible, but it must derive the authenticated user from the bearer token.

## Safe-To-Spend Serving

The mobile home route should reuse:

- `apps/web/src/safe-to-spend/data.ts`
- `apps/web/src/safe-to-spend/view-model.ts`
- `packages/core/src/safe-to-spend/engine.ts`

It should return a mobile-specific JSON payload, not the full internal view model.

The mobile app should continue to format money with `@dart/core`, but server should own the live calculation inputs and missing-state decisions.

## Category Loading

Categories should eventually load from table-backed data:

- System categories: `user_id IS NULL`.
- User categories: `user_id = authenticated user`.

Phase 3 should add a read route or direct RLS-safe read that returns stable `id`, `name`, `icon`, `color`, and `isSystem`.

Quick Add persistence must not ship until category IDs and active account IDs are real.

## Writes Postponed

Postponed until Phase 3:

- Manual transaction creation.
- Category writes.
- Intent/category review writes.
- Transaction match writes.
- Import writes.
- Safe-to-spend snapshot writes.

## RLS Smoke Test Plan

Before choosing direct Supabase writes:

1. Sign in on Android.
2. Read `auth.getUser()`.
3. Query own categories/accounts.
4. Query another user's known row ID and confirm denial/empty result.
5. Attempt transaction insert with mismatched `user_id`; confirm rejection.
6. Attempt transaction insert with matching `user_id`; confirm allowed only if all required fields and account ownership constraints are satisfied.
7. Delete test rows or reset local test data through approved local/dev scripts.

If any direct write smoke test is ambiguous, use a Next.js API route for Phase 3 persistence instead.

## Out Of Scope

- Service role usage in mobile.
- Direct Drizzle or database URL usage in mobile.
- Mobile CSV import.
- Mobile reconciliation.
- Bank sync.
- Live safe-to-spend in Phase 2.
- Quick Add persistence in Phase 2.
