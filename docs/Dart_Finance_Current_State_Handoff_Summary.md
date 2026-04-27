# Dart Finance — Handoff Summary

**Last updated**: 2026-04-27  
**Owner**: Seungjae  
**See also**: `50_Current_Status_2026-04-27.md` for full go/no-go detail

---

## Architecture

Turborepo + pnpm monorepo. Web is Next.js 15 App Router. Mobile is Expo (not yet shipping). Supabase + Drizzle ORM for data. CSS custom properties for all design tokens.

```
packages/core/         safe-to-spend engine, zero UI/DB imports
packages/db/           Drizzle schema only
packages/ui/           shared components + tokens
packages/csv-parsers/  ING + T212 parsers only
apps/web/              Next.js 15 — primary shipping surface
apps/mobile/           Expo — not yet in beta
```

---

## What Is Complete

**Engine + parsers**  
Safe-to-spend engine is implemented and tested. ING CSV (semicolon, nl-NL, DD-MM-YYYY) and Trading 212 CSV both parse correctly. 393-row smoke test: 0 errors, 0 duplicates. All amounts are INTEGER cents.

**Web app**  
All core routes are live: dashboard, import, transactions (DB-backed, auth-gated), why, onboarding, settings, readiness, privacy, terms, beta signup.

**Auth**  
Magic link flow works end-to-end. Real Supabase env values are configured. Callback URL is registered. All `(app)` routes require authentication.

**Design system**  
Dark mode (default) + light mode. Theme persists via localStorage. No flash on load. Full sidebar with active-link detection. All colors via CSS custom properties — no hardcoded hex in components.

**Observability**  
PostHog and Sentry keys are configured. Lightweight bootstrap shims installed. Ingest verification still required.

**Billing**  
Stripe and RevenueCat scaffolds are wired but intentionally inactive. Beta is free.

---

## What Is Incomplete

**Auth state machine** — only basic sign-in exists. The callback states (processing, success, error, rate-limit) are not implemented.

**Import edge states** — blocked format, duplicate skip reasons, and long-import progress screens are not implemented.

**Legal** — `TODO(owner)` placeholders remain in `/privacy` and `/terms`.

**Observability** — keys are configured but no one has verified events arrive in PostHog/Sentry dashboards.

**Owner actions pending**:
- Apply `beta_signups` migration to real Supabase database
- Define invite/review workflow
- Replace legal placeholders

---

## Dev Commands

```bash
pnpm web:dev          # always use this — runs on localhost:3000
pnpm tsc --noEmit     # must pass before any commit
pnpm build            # full production build
```

Do **not** use `pnpm dev` from the monorepo root — causes stale `.next` chunk errors.

---

## Key Constraints (Never Change Without Decision Log)

- Amounts: INTEGER cents only, never float
- CSS: custom properties only, never hardcode hex
- CSV: ING + T212 only in V1
- Auth: Supabase magic link only
- Imports: absolute `@/` paths only, no `../../` chains
- TypeScript: strict mode, no `any`, no `@ts-ignore` without comment
