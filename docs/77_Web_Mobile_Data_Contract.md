# 77 — Web/Mobile Data Contract

Date: 2026-04-30
Status: Phase 2 contract. Implementation of live mobile financial data is postponed.

## Purpose

This document defines how the Android app will share identity and data semantics with the existing web app before Phase 3 persistence work begins.

Phase 2 establishes auth/session shape only. Mobile home, Quick Add, bills, transactions, categories, and safe-to-spend remain mock/static in the app.

## Shared Identity

Web and mobile must represent the same person as the same Supabase Auth user:

- Supabase Auth user ID is the canonical app user ID.
- `public.users.id` is expected to equal Supabase `auth.uid()`.
- Mobile must never send a trusted `user_id` in request bodies.
- Direct Supabase reads/writes must rely on the authenticated JWT and RLS.
- Next.js API routes must derive identity from server-validated session/token state, not from client-provided user IDs.

Current web behavior:

- Web stores Supabase access and refresh tokens in HTTP-only cookies.
- Web resolves the user through `apps/web/src/auth/session.ts`.
- Web has a non-production local-dev bypass returning `LOCAL_DEV_USER_ID`.

Mobile behavior introduced in Phase 2:

- Mobile stores Supabase session data in Expo SecureStore.
- Mobile uses the Supabase anon key only.
- Mobile auth state can be represented as `loading`, `signed_out`, `signed_in`, or `config_missing`.
- Mobile does not inherit the web local-dev bypass.

## Data Access Strategy

Mobile will use both Supabase and Next.js API routes, with narrow boundaries:

| Data area | Phase 2 | Phase 3 target |
|---|---|---|
| Auth/session | Direct Supabase client | Direct Supabase client |
| Safe-to-spend home payload | Mock/static | Next.js API route |
| Categories | Mock/static | Read via Next.js API route or RLS-safe Supabase read |
| Recent transactions | Mock/static | Read via Next.js API route first |
| Manual Quick Add write | Local-only simulation | Next.js API route first, direct Supabase only after RLS smoke test |
| CSV import | Out of scope | Web only for V1 unless separately scoped |
| Reconciliation | Out of scope | Web only until mobile review scope is approved |

Recommended default for Phase 3:

- Use Next.js API routes for mobile financial payloads that need server-side composition.
- Use direct Supabase from mobile only for auth and carefully smoke-tested simple reads.
- Do not duplicate Drizzle query logic in the mobile app.

## Allowed Mobile Reads

Phase 2:

- Auth session only.
- No live financial reads.

Phase 3 candidate reads:

- Current app profile/setup status.
- Safe-to-spend home payload.
- Table-backed category options.
- Active accounts needed for manual entry.
- Recent transactions summary.

Each read must be scoped to the authenticated user by server-side identity or RLS.

## Writes Postponed To Phase 3

The following writes are explicitly not implemented in Phase 2:

- Manual transaction creation from Quick Add.
- Category creation or editing.
- Transaction category/intent edits.
- Import batch creation.
- Import row creation.
- Transaction reconciliation.
- Safe-to-spend snapshot creation.
- Billing/paywall state.

## Category Contract

Categories are table-backed:

- System categories have `categories.user_id IS NULL`.
- User categories have `categories.user_id = auth.uid()`.
- Transactions reference `transactions.category_id`.

Mobile currently has hardcoded local category labels. Phase 3 must replace those labels with a read contract that returns:

```ts
type MobileCategoryOption = {
  id: string;
  name: string;
  icon: string | null;
  color: string | null;
  isSystem: boolean;
};
```

Mobile must not create system categories. If mobile category creation is later added, it must create user-owned categories only.

## Safe-To-Spend Contract

Safe-to-spend is computed from shared `@dart/core`, but the live web data pipeline is server-side:

- `apps/web/src/safe-to-spend/data.ts`
- `apps/web/src/safe-to-spend/view-model.ts`
- `packages/core/src/safe-to-spend/engine.ts`

Phase 3 should expose a mobile-safe API payload rather than making the mobile app rebuild the Drizzle query pipeline.

Candidate payload:

```ts
type MobileSafeToSpendPayload =
  | {
      status: 'ready';
      valueCents: number;
      spendablePoolCents: number;
      daysUntilPayday: number;
      paydayLabel: string;
      pendingReviewCount: number;
      warnings: Array<{
        code: string;
        severity: 'info' | 'warning' | 'error';
        message: string;
      }>;
      updatedAt: string;
    }
  | {
      status:
        | 'missing_user'
        | 'missing_payday'
        | 'missing_accounts'
        | 'missing_import'
        | 'database_unavailable';
      title: string;
      message: string;
      actionLabel: string;
    };
```

The mobile app may format amounts with `@dart/core` `formatEUR`, but it should not perform a separate live safe-to-spend calculation in Phase 3 unless the server and mobile contracts are deliberately unified.

## RLS Smoke Test Requirement

Before enabling Quick Add persistence, verify RLS with an authenticated mobile Supabase session:

1. Sign into mobile as a real Supabase user.
2. Confirm `auth.getUser()` returns the same ID as `public.users.id`.
3. Attempt to read that user's own categories/accounts through the chosen bridge.
4. Attempt to read another user's rows and confirm denial or empty result.
5. If direct transaction insert is considered, insert only with `user_id = auth.uid()` and confirm RLS rejects a mismatched `user_id`.
6. Confirm no service role key is present in mobile env, bundle, logs, or code.

## Phase 3 Prerequisites

- Real mobile sign-in verified on Android deep links.
- Mobile user ID matches the web/Supabase app profile ID.
- API bridge chosen for each Phase 3 read/write.
- RLS smoke test completed and documented.
- Category read contract implemented before replacing Quick Add category labels.
- Active account selection contract implemented before Quick Add persistence.
- Server route or direct RLS insert path chosen for manual transaction creation.
- Verification report updated with real Android device/emulator results.
