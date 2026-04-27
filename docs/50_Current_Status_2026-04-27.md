# Dart Finance — Current Status

**Last updated**: 2026-04-27  
**Owner**: Seungjae  
**Phase 1 status**: COMPLETE — Minimal Beta Level  
**Private Beta status**: NOT YET GO — next step is Beta Readiness Hardening

---

## Phase 1 — COMPLETE

The Phase 1 trusted product loop is complete at minimal beta level. A real authenticated user can:

1. Sign in via magic link
2. Import an ING or Trading 212 CSV
3. Review imported transactions with warning treatment and confirm each row
4. See the safe-to-spend number on `/dashboard` computed from real account data
5. Drill down into the full assumption breakdown on `/why`

**Phase 1 completion does not mean Private Beta is GO.** See the Beta Readiness Hardening section below.

### Phase 1 Completed Capabilities

- Real dashboard data — safe-to-spend computed from authenticated user accounts, transactions, and assumptions
- Real why breakdown — full assumption drill-down sharing the same view model as `/dashboard`
- Shared safe-to-spend view model between `/dashboard` and `/why`
- Import preview and review states — parsed rows shown with review status
- Needs-attention transaction treatment — warning tint, review badges, per-row Confirm buttons
- Confirm action persistence — persists `review_status = reviewed`, updates `updatedAt`, requires auth, checks ownership
- Auth and ownership checks on all `(app)` routes and confirm API
- Blocked unsupported CSV handling — returns a clear message naming ING + Trading 212 as the only supported formats
- Duplicate/skipped/error row reasons — shown next to each row where parser/dedup logic provides them
- Staged processing checklist — shown during long imports
- Validation passed: `pnpm tsc --noEmit`, `pnpm --dir apps/web test` (50 tests), `pnpm test` (100 tests total), `pnpm build`

---

## What Is Built and Working

### Core Engine
- Safe-to-spend engine (`packages/core/src/safe-to-spend/engine.ts`)
- ING CSV parser + Trading 212 CSV parser (`packages/csv-parsers/`)
- All amounts stored as INTEGER cents, never floats
- 393-row ING smoke test: 0 parser errors, 0 duplicates

### Web App (apps/web)

| Route | Status | Notes |
|-------|--------|-------|
| `/dashboard` | ✅ Live | Safe-to-spend hero computed from real user data, stat cards, next bills, quick links |
| `/import` | ✅ Live | ING + T212 upload, auth-gated, account ownership check, review preview, blocked/skipped-row states, staged checklist |
| `/transactions` | ✅ Live | DB-backed, session-filtered, needs-review treatment, per-row Confirm with ownership check |
| `/why` | ✅ Live | Full real-data assumption drill-down, shared view model with `/dashboard` |
| `/onboarding/*` | ✅ Live | Payday, income, investing, accounts steps |
| `/settings` | ✅ Live | Theme toggle, account info, data section, legal links |
| `/readiness` | ✅ Live | 5 groups with real status (Auth/Data/Telemetry/Legal/Ops) |
| `/privacy` | ✅ Live | EU/GDPR pills, 4 stat cards, prose sections |
| `/terms` | ✅ Live | Plain-language summary, 7 sections |
| `/beta` | ✅ Live | Signup form, writes to `beta_signups` table |
| `/sign-in` | ✅ Live | Magic link send — full callback state machine not yet implemented |
| `/billing` | ✅ Scaffolded | Stripe + RevenueCat wired, intentionally not live for beta |

### Design System
- Dark mode (default) + light mode with localStorage persistence
- Theme flash prevention via inline `<script>` in `<head>` + `suppressHydrationWarning`
- All CSS custom properties in `packages/ui/src/tokens/colors.css`
- Sidebar with active-link detection (client component `SidebarNav`)

### Auth
- Supabase magic link flow wired end-to-end
- `/auth/callback` token handoff working
- Real Supabase env values configured ✅
- Callback URL registered in Supabase dashboard ✅
- All `(app)` routes deny unauthenticated access

### Observability
- PostHog key provided ✅ — ingest not yet confirmed in dashboard
- Sentry DSN provided ✅ — ingest not yet confirmed in dashboard
- Lightweight bootstrap shims installed (no-op fallback when keys absent)

### Billing (Inactive)
- Stripe scaffold: monthly + annual checkout wired, intentionally disabled for beta
- RevenueCat scaffold: Apple + Google contract wired, SDK not installed
- Billing is free for all beta users

---

## What Remains Outside Phase 1

These items are explicitly deferred and do not block Phase 1 completion:

- Full inline category/intent editing during transaction review
- Rule creation (auto-classification rules engine)
- Auth callback state machine polish (processing, success, error, rate-limit routes)
- Legal placeholders — `TODO(owner)` copy in `/privacy` and `/terms`
- Observability dashboard verification (keys configured, ingest not confirmed)
- Mobile (Expo — not yet in beta)
- Billing activation
- Bank sync / open banking
- AI / chat surface
- Extra CSV providers (Rabobank, DeGiro, others)

---

## Private Beta Is Not Automatically GO

Phase 1 completion proves the core product loop works. It does not mean the app is ready for real users.

**Next workstream: Beta Readiness Hardening**

See `docs/60_Beta_Readiness_Hardening_Prompt.md` for the exact prompt to use.

Beta hardening covers:
- Auth callback state machine (4 missing routes)
- Observability ingest verification
- User-facing error copy quality
- Empty/error/loading state polish
- Import/review/confirm end-to-end UX pass
- Legal `TODO(owner)` placeholders resolved by owner

---

## Go / No-Go Summary

| Area | Status |
|------|--------|
| Core engine + CSV parsers | ✅ GO |
| Web import + review loop | ✅ GO |
| Transactions confirm flow | ✅ GO |
| Dashboard + why (real data) | ✅ GO |
| Auth (basic flow) | ✅ GO |
| Design system + light/dark mode | ✅ GO |
| Observability keys configured | ⚠️ Partial — ingest unverified |
| Auth callback state machine | ❌ 4 routes missing |
| Legal copy | ❌ TODO(owner) placeholders remain |
| Billing | ⏸ Intentionally off for beta |
| beta_signups migration on real DB | ⏸ Owner action required |

**Recommendation**: Phase 1 COMPLETE. Private Beta requires Beta Readiness Hardening pass before GO.

---

## How to Run

```bash
pnpm web:dev          # always use this — runs on localhost:3000
pnpm tsc --noEmit     # must pass before any commit
pnpm build            # full production build
```

Do **not** use `pnpm dev` from the monorepo root — causes stale `.next` chunk errors.
