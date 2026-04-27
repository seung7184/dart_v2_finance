# Dart Finance — Current Status

**Last updated**: 2026-04-27  
**Owner**: Seungjae  
**Status**: Conditional GO — private beta with 3–5 users

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
| `/dashboard` | ✅ Live | Safe-to-spend hero, stat cards, next bills, quick links |
| `/import` | ✅ Live | ING + T212 upload, auth-gated, account ownership check |
| `/transactions` | ✅ Live | DB-backed, read-only, session-filtered |
| `/why` | ✅ Live | Full assumption drill-down |
| `/onboarding/*` | ✅ Live | Payday, income, investing, accounts steps |
| `/settings` | ✅ Live | Theme toggle, account info, data section, legal links |
| `/readiness` | ✅ Live | 5 groups with real status (Auth/Data/Telemetry/Legal/Ops) |
| `/privacy` | ✅ Live | EU/GDPR pills, 4 stat cards, prose sections |
| `/terms` | ✅ Live | Plain-language summary, 7 sections |
| `/beta` | ✅ Live | Signup form, writes to `beta_signups` table |
| `/sign-in` | ✅ Live | Magic link send only — full state machine not yet implemented |
| `/billing` | ✅ Scaffolded | Stripe + RevenueCat wired, not live for beta |

### Design System
- Dark mode (default) + light mode with localStorage persistence
- Theme flash prevention via inline `<script>` in `<head>` + `suppressHydrationWarning`
- All CSS custom properties in `packages/ui/src/tokens/colors.css`
- Sidebar: dark surface with active-link detection (client component `SidebarNav`)
- Full token set: surfaces, borders, text, accent, semantic, spacing, radius, motion

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

## What Is Still Missing (Before Beta)

### Must Do — Auth State Machine
The sign-in page only handles idle/loading/sent states. The design specifies 6 full states that need wiring to real Supabase responses:

| State | Route | Status |
|-------|-------|--------|
| Sending (disabled button + spinner) | `/sign-in` | Partial |
| Magic link sent (email card + resend countdown) | `/sign-in` | Partial |
| Callback processing (3-step checklist) | `/auth/callback/processing` | ❌ Missing |
| Callback success (auto-redirect + Continue) | `/auth/callback/success` | ❌ Missing |
| Callback error (reason + ref code + two CTAs) | `/auth/callback/error` | ❌ Missing |
| Rate limit (countdown + inbox framing) | `/auth/callback/rate-limit` | ❌ Missing |

### Must Do — Transactions
- Needs-review row treatment (4% warning tint background + per-row Confirm button)
- Read-only beta notice banner already exists but not styled per final design

### Must Do — Import Edge States
- `/import/blocked` — wrong format screen
- `/import/duplicates` — per-row skip reason
- `/import/processing` — progress checklist for long imports

### Nice to Have
- Local-only mode toggle in Settings
- Auth callback processing checklist (vs bare spinner)
- Per-row Confirm in needs-review transactions

### Owner Decision Required (Not Code)
- [ ] Apply `beta_signups` migration to real Supabase database
- [ ] Define invite/review workflow (Supabase Table Editor, Drizzle Studio, or other)
- [ ] Confirm PostHog dashboard ownership — verify events arrive
- [ ] Confirm Sentry dashboard ownership — verify exceptions arrive
- [ ] Replace `TODO(owner)` placeholders in `/privacy` and `/terms` with real legal details

---

## How to Run

```bash
# Dev server (always use this, not pnpm dev)
pnpm web:dev
# → http://localhost:3000

# Type check
pnpm tsc --noEmit

# Build
pnpm build
```

**Common mistake**: running `pnpm dev` from the monorepo root causes stale `.next` chunk errors. Always use `pnpm web:dev`.

---

## Go / No-Go Summary

| Area | Status |
|------|--------|
| Core engine + CSV parsers | ✅ GO |
| Web import + transactions + why | ✅ GO |
| Auth (basic flow) | ✅ GO |
| Design system + light/dark mode | ✅ GO |
| Observability (keys configured) | ⚠️ Partial — ingest unverified |
| Auth state machine (6 states) | ❌ Incomplete |
| Import edge states | ❌ Incomplete |
| Legal copy | ❌ TODO(owner) placeholders remain |
| Billing | ⏸ Intentionally off for beta |
| beta_signups migration on real DB | ⏸ Owner action required |

**Recommendation**: Conditional GO for first cohort of 3–5 trusted users on the basic sign-in flow. Full public beta blocked on auth state machine + legal copy.
