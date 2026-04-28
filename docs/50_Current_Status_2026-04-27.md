# Dart Finance — Current Status

**Last updated**: 2026-04-28  
**Owner**: Seungjae  
**Phase 1 status**: COMPLETE — Minimal Beta Level  
**Phase 1.5 status**: COMPLETE — Beta Polish (monthly slicer, intent editing, T212 policy, import auto-select, dedup messaging)  
**Phase 1.6 status**: COMPLETE — Review Productivity + Basic Category Analysis  
**Phase 1.7 status**: COMPLETE — Merchant-Assisted Categorisation + Merchant Insights  
**Beta Readiness Hardening status**: COMPLETE — See below  
**Private Beta status**: CONDITIONAL GO — operational gates (telemetry ingest, beta_signups migration) require owner action before GO

---

## Phase 1.7 — COMPLETE

Merchant-assisted categorisation and merchant insights are live:

- Merchant mapping registry (`apps/web/src/merchants/`) — maps raw description patterns to clean merchant names + category hints
- Bulk merchant-assisted categorisation — "Apply merchant suggestions" action on `/transactions` pre-fills category for all matching rows
- Merchant insights card on `/dashboard` — top merchants by spend, recurring merchant detection
- Category analysis card on `/dashboard` — monthly breakdown by category, reviewed transactions only

---

## Beta Readiness Hardening — COMPLETE

All hardening items addressed in the 2026-04-28 session:

### Auth callback state polish
- Error messages are now user-facing: "The sign-in link has expired or is no longer valid" and "We couldn't complete your sign-in"
- "Back to sign in" link shown on all error states
- Fresh-user onboarding redirect: after successful sign-in, `/api/auth/onboarding-status` is called; if `onboarding_completed = false`, user is redirected to `/onboarding/payday` instead of `/dashboard`

### Privacy / Terms
- No placeholder text remains — both pages have real EU/GDPR-compliant content
- Privacy page: data storage, sub-processors, rights, contact
- Terms page: 7 plain-language sections, Netherlands law, effective date

### PostHog + Sentry verification path
- Both SDKs are wired via `BootstrapProviders` — custom lightweight shim sends events directly to EU endpoints
- Owner verification step: open DevTools → Console → `window.__dartObservabilityBootstrap` → should show `{ posthog: "configured", sentry: "configured" }`
- Ingest confirmation requires owner to trigger events (onboarding, import) and verify in PostHog/Sentry dashboards

### UX hygiene
- Raw `batchId` UUID removed from import "already imported" notice
- No demo data anywhere — all data flows are DB-backed and user-scoped
- No raw account UUID shown in normal UX — import form shows account name only

### Readiness page updated
- Phase 1.7 items added (merchant categorisation, merchant insights, category analysis)
- UX hygiene group added (no UUIDs, no demo data, onboarding redirect)
- Telemetry group includes browser verification instruction

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
| `/dashboard` | ✅ Live | Safe-to-spend hero, monthly slicer, category spending breakdown, merchant insights |
| `/import` | ✅ Live | ING + T212 upload, auth-gated, account ownership check, review preview, blocked/skipped-row states |
| `/transactions` | ✅ Live | Description filter, row checkboxes, bulk intent+category update, bulk confirm, category column, merchant-assisted categorisation |
| `/why` | ✅ Live | Full real-data assumption drill-down, payday explanation, T212 context |
| `/onboarding/*` | ✅ Live | Payday, income, investing, accounts steps |
| `/settings` | ✅ Live | Theme toggle, account info, data section, legal links |
| `/readiness` | ✅ Live | 6 groups with real status (Auth/Data/UX/Telemetry/Legal/Ops) |
| `/privacy` | ✅ Live | EU/GDPR pills, 4 stat cards, prose sections — no placeholders |
| `/terms` | ✅ Live | Plain-language summary, 7 sections — no placeholders |
| `/beta` | ✅ Live | Signup form, writes to `beta_signups` table |
| `/sign-in` | ✅ Live | Magic link send + polished callback state machine |
| `/billing` | ✅ Scaffolded | Stripe + RevenueCat wired, intentionally not live for beta |

### Auth
- Supabase magic link flow wired end-to-end
- `/auth/callback` token handoff working with user-friendly error states
- Fresh-user post-sign-in redirect to `/onboarding/payday` if not yet onboarded
- Real Supabase env values configured ✅
- Callback URL registered in Supabase dashboard ✅
- All `(app)` routes deny unauthenticated access

### Observability
- PostHog key provided ✅ — ingest not yet confirmed in dashboard (owner action needed)
- Sentry DSN provided ✅ — ingest not yet confirmed in dashboard (owner action needed)
- Lightweight bootstrap shims installed — send directly to EU endpoints, no SDK bundle overhead
- Verification: `window.__dartObservabilityBootstrap` shows configured state in DevTools console

---

## What Remains Outside Phase 1.7

- Telemetry ingest confirmation (owner: open app, trigger events, verify in PostHog + Sentry dashboards)
- `beta_signups` migration on real DB (owner: run migration against production Supabase)
- Invite workflow (owner: decide process)
- Mobile (Expo — not yet in beta)
- Billing activation
- Bank sync / open banking
- AI / chat surface
- Extra CSV providers (Rabobank, DeGiro, others)

---

## Go / No-Go Summary

| Area | Status |
|------|--------|
| Core engine + CSV parsers | ✅ GO |
| Web import + review loop | ✅ GO |
| Transactions confirm + bulk flow | ✅ GO |
| Dashboard + why (real data) | ✅ GO |
| Merchant insights + category analysis | ✅ GO |
| Auth (full state machine) | ✅ GO |
| Fresh-user onboarding redirect | ✅ GO |
| UX hygiene (no UUIDs, no demo data) | ✅ GO |
| Design system + light/dark mode | ✅ GO |
| Legal copy (privacy + terms) | ✅ GO |
| Observability keys configured | ⚠️ Partial — ingest unverified (owner action) |
| `beta_signups` migration on real DB | ⏸ Owner action required |
| Invite workflow | ⏸ Owner decision required |
| Billing | ⏸ Intentionally off for beta |

**Recommendation**: CONDITIONAL GO for external private beta invite.  
Blockers before GO: telemetry ingest confirmed + `beta_signups` migration applied.

---

## How to Run

```bash
pnpm web:dev          # always use this — runs on localhost:3000
pnpm tsc --noEmit     # must pass before any commit
pnpm build            # full production build
```

Do **not** use `pnpm dev` from the monorepo root — causes stale `.next` chunk errors.
