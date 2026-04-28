# Dart Finance

Investor-aware safe-to-spend app for the Netherlands. Answers: *"오늘 얼마를 써도 되는지, 투자 계획을 무시하지 않고 알려준다."*

## What This Is

Dart Finance tells you how much you can spend today, without ignoring your investment commitments. It imports transaction history from ING and Trading 212 CSV exports, lets you review and categorise spending, then computes a safe daily budget until your next payday.

**Supported CSV providers**: ING and Trading 212 only. No other banks in V1.

**Core product loop**:
```
Onboarding → Import CSV → Review/Categorise → Confirm → Dashboard (safe-to-spend) → Why (drill-down)
```

---

## Status

| Area | Status |
|------|--------|
| Private beta code | GO — all core features working locally |
| External beta | CONDITIONAL GO — requires owner action (see below) |
| Mobile (Expo) | Not yet in beta |
| Billing | Scaffolded — intentionally inactive for beta |

**Owner actions required before external beta**:
1. Confirm PostHog and Sentry ingest: open the app, trigger events (import, onboarding), verify in PostHog and Sentry dashboards
2. Apply `beta_signups` migration to the production Supabase database
3. Decide invite workflow

Full go/no-go detail: `docs/50_Current_Status_2026-04-27.md`

---

## Tech Stack

```
pnpm monorepo (Turborepo)
├── apps/web              Next.js 15 App Router — primary beta surface
├── apps/mobile           Expo — not yet in beta
├── packages/core         Safe-to-spend engine — zero UI/DB imports
├── packages/db           Drizzle ORM schema only — no business logic
├── packages/ui           Shared components + design tokens
└── packages/csv-parsers  ING + T212 CSV parsers only
```

- **Database**: Supabase (PostgreSQL) + Drizzle ORM
- **Auth**: Supabase magic link
- **Design**: shadcn/ui + CSS custom properties (dark mode default, light mode toggle)

---

## Main Commands

```bash
# Install dependencies
pnpm install

# Start dev server — always use this, not pnpm dev from monorepo root
pnpm web:dev          # http://localhost:3000

# Type check — must pass before any commit
pnpm tsc --noEmit

# Run all tests
pnpm test

# Run web tests only
pnpm --dir apps/web test

# Full production build
pnpm build
```

> Do NOT use `pnpm dev` from the monorepo root — it causes stale `.next` chunk errors. Always use `pnpm web:dev`.

---

## Environment Setup

1. Copy `apps/web/.env.example` to `apps/web/.env.local`
2. Fill in values from your Supabase project dashboard

Required variables:

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key |
| `DATABASE_URL` | Supabase Postgres connection string (for Drizzle) |
| `NEXT_PUBLIC_POSTHOG_KEY` | PostHog project API key (observability) |
| `NEXT_PUBLIC_POSTHOG_HOST` | PostHog ingest host — default `https://eu.i.posthog.com` |
| `NEXT_PUBLIC_SENTRY_DSN` | Sentry DSN for error reporting |

Billing variables (Stripe, RevenueCat) are in `.env.example` but intentionally inactive for beta. Leave them as placeholders.

Never commit `.env.local` or any file containing real secrets.

---

## Supabase Notes

- **RLS is required**: All tables use Row Level Security. Every query is scoped to `auth.uid()`. Never bypass RLS with a service-role key in application code.
- **`beta_signups` table**: The `/beta` signup form requires a migration applied to the real production database. See `docs/Beta_Launch_Owner_Checklist.md`.
- **Connection management**: The dev server holds 1–3 live DB connections. If you see `FATAL: 53300: remaining connection slots reserved for superuser`, stop the dev server and wait ~20 seconds. See `docs/62_Supabase_Local_Connection_Troubleshooting.md` for full diagnosis.

---

## Data Reset — Local/Dev Only

> **NEVER run destructive SQL on the production database.**

When testing locally, you may need a clean slate for a test user — especially after schema migrations that add new columns (like `merchant_name`/`merchant_category`). Old imports will not have these fields populated, so a reset and fresh import is required for accurate results.

Reset script: `docs/sql/reset_test_user_app_data.sql`

To use it:
1. Find your test user's UUID in Supabase → Authentication → Users
2. Open the SQL file and replace `PASTE_USER_UUID_HERE` with that UUID
3. Run in Supabase SQL Editor or psql — **local project only**
4. Verify with the verification queries at the bottom of the file

---

## Merchant Persistence Note

As of migration `0004_merchant_fields` (2026-04-28), T212 Card debit transactions carry three additional fields:
- `merchant_name` — raw merchant name from the CSV (e.g. `DIRK VDBROEK FIL4103`)
- `merchant_category` — T212 merchant category code (e.g. `RETAIL_STORES`)
- `normalized_merchant_name` — lowercase + trimmed form for grouping (e.g. `dirk vdbroek fil4103`)

Transactions imported before this migration have these fields as `null`. For accurate merchant insights on the dashboard, reset test data and re-import your CSVs after confirming the migration has been applied.

See `docs/70_Merchant_Mapping_Registry.md` for the full merchant mapping registry and import-time behaviour.

---

## Fresh Local QA Steps

Full manual QA checklist: `docs/61_Localhost_E2E_QA_Checklist.md`

Quick reference for a clean test run:
1. Reset test user data — `docs/sql/reset_test_user_app_data.sql`
2. Start dev server: `pnpm web:dev`
3. Sign in with magic link
4. Complete onboarding (payday, income, investing, accounts)
5. Import ING CSV — check row count and no errors
6. Import T212 CSV — check row count and no errors
7. Try re-importing the same file — expect duplicate detection
8. Navigate to `/transactions` — filter by description
9. Bulk set intent + category → Apply to selected
10. Bulk confirm selected rows
11. Navigate to `/dashboard` — verify safe-to-spend number, category breakdown, merchant insights
12. Navigate to `/why` — verify assumption drill-down matches dashboard number
13. Navigate to `/settings` — verify theme toggle and account info
14. SQL check: `SELECT merchant_name, merchant_category, normalized_merchant_name FROM transactions WHERE user_id = '<your-uuid>' AND source = 't212_csv' LIMIT 10;`

---

## Scope Freeze — V1

The following are out of scope for V1 and must not be added:

- Bank sync / open banking
- CSV providers beyond ING and Trading 212
- AI / chat assistant surface
- Forecast / what-if simulations
- Household / shared accounts
- Rabobank, DeGiro, or other provider support
- Billing activation before beta hardening is complete
- Mobile (Expo) beta release

---

## Document Map

| Doc | Purpose |
|-----|---------|
| `docs/01_Product_Brief.md` | One-page product summary |
| `docs/21_Data_Model.md` | Full DB schema spec |
| `docs/23_Safe_To_Spend_Engine_Spec.md` | Engine policy and calculations |
| `docs/50_Current_Status_2026-04-27.md` | Phase status and full go/no-go |
| `docs/61_Localhost_E2E_QA_Checklist.md` | Manual QA script |
| `docs/62_Supabase_Local_Connection_Troubleshooting.md` | DB connection debugging |
| `docs/70_Merchant_Mapping_Registry.md` | Merchant name/category mapping registry |
| `docs/Dart_Finance_Execution_Lock_v1_3.md` | Locked product decisions — read before any scope change |
| `docs/sql/reset_test_user_app_data.sql` | Local dev data reset script |
| `CLAUDE.md` | AI agent rules — read before any code change |
