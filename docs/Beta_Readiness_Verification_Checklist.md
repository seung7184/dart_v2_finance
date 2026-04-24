# Beta Readiness Verification Checklist

Version 1.0 · 2026-04-22
Owner: Seungjae
Status: Verification checklist for private beta go/no-go

## Purpose

Use this checklist to verify the end-to-end private beta experience across the current V1 web-first flow and confirm what still blocks launch.

## 1. Wiring Audit Snapshot

### Auth

- Current state: app routes require valid Supabase access/refresh token cookies and resolve the user through the Supabase Auth `/user` endpoint.
- Current state: web auth start uses a Supabase-compatible magic link request and `/auth/callback` token handoff.
- Verification note: start local web auth checks with `pnpm run web:dev` so the app runs on `http://localhost:3000`.
- Blocker: a real Supabase project, anon key, and registered callback URL are still required.

### Observability

- Current state: the app shell installs lightweight env-aware `window.posthog.capture` and `window.Sentry.captureException` shims when public keys/DSNs exist.
- Current state: server exceptions fall back to direct Sentry envelope delivery when `SENTRY_DSN` or `NEXT_PUBLIC_SENTRY_DSN` is configured.
- Blocker: owner env values still need to be provided and real ingest must be verified in the target beta environment.

### Billing

- Current state: web billing can create a live Stripe Checkout session when the selected plan price ID and server secret key are configured.
- Current state: mobile billing exposes a shared RevenueCat contract for offering `default`, entitlement `premium`, and packages `$rc_monthly` / `$rc_annual`, with Apple and Google availability tracked separately.
- Blocker: Stripe webhook handling and real RevenueCat SDK installation are not present.

## 2. Core Web Flow Verification

### Onboarding

- [ ] Visit `/onboarding/payday`.
- [ ] Complete payday, income, investing, and accounts steps.
- [ ] Confirm the finish action routes to `/dashboard`.
- [ ] Confirm the onboarding completion event fires in the browser instrumentation path.

### Import Review

- [ ] Visit `/import` with an authenticated session.
- [ ] Confirm preview fails when `accountId` is blank.
- [ ] Confirm preview fails when the session user does not own the target account.
- [ ] Confirm an ING CSV preview works.
- [ ] Confirm a Trading 212 CSV preview works.
- [ ] Confirm successful import emits `csv_import_completed`.
- [ ] Confirm first successful import emits `first_import` once only.
- [ ] Confirm import errors are routed to Sentry through the configured bootstrap path.

### Transactions Review

- [ ] Visit `/transactions`.
- [ ] Change at least one transaction intent.
- [ ] Bulk mark transactions as reviewed.
- [ ] Confirm `transaction_reviewed` is emitted for both single-row and bulk actions.

### Why This Number

- [ ] Visit `/why`.
- [ ] Confirm the “trusted number” view loads without errors.
- [ ] Confirm `first_trusted_number` is emitted once only.

### Observability Bootstrap

- [ ] Load an app page with no observability env values and confirm the app still runs without client errors.
- [ ] Set `NEXT_PUBLIC_POSTHOG_KEY` and confirm browser events reach the target PostHog project.
- [ ] Set `NEXT_PUBLIC_SENTRY_DSN` and confirm browser-side exceptions arrive in Sentry.
- [ ] Set `SENTRY_DSN` in the server runtime if server-only reporting is required and confirm API-route exceptions arrive in Sentry.

## 3. Beta Ops Verification

- [ ] Visit `/beta`.
- [ ] Submit a valid request using `ING` and `Trading 212`.
- [ ] Confirm the API returns a durable `beta-...` ticket.
- [ ] Confirm a row is written to the `beta_signups` table in the target database.
- [ ] Submit the same email twice and confirm the API returns the existing ticket instead of creating a duplicate signup row.
- [ ] Submit an invalid request and confirm validation blocks unsupported bank/broker combinations.
- [ ] Confirm beta signup failures are captured through the observability exception path.
- [ ] Visit `/privacy` and confirm all unresolved legal details are explicitly marked `TODO(owner)`.
- [ ] Visit `/terms` and confirm all unresolved legal details are explicitly marked `TODO(owner)`.

## 4. Billing Verification

### Web

- [ ] Visit `/billing`.
- [ ] Confirm Stripe public key status reflects env presence.
- [ ] Confirm monthly checkout is unavailable when `NEXT_PUBLIC_STRIPE_PRICE_ID_MONTHLY` is absent.
- [ ] Confirm annual checkout is unavailable when `NEXT_PUBLIC_STRIPE_PRICE_ID_ANNUAL` is absent.
- [ ] Submit a valid billing email for a configured plan and confirm a Stripe Checkout URL/session is returned.
- [ ] Submit a valid billing email for an unconfigured plan and confirm the request fails safely.
- [ ] Submit an invalid billing email and confirm validation blocks the request.

### Mobile

- [ ] Open the mobile home screen.
- [ ] Confirm the RevenueCat billing card renders.
- [ ] Confirm offering `default` and entitlement `premium` are displayed.
- [ ] Confirm package identifiers `$rc_monthly` and `$rc_annual` are displayed.
- [ ] Confirm Apple billing stays unavailable when `EXPO_PUBLIC_REVENUECAT_APPLE_PUBLIC_KEY` is absent.
- [ ] Confirm Google billing stays unavailable when `EXPO_PUBLIC_REVENUECAT_GOOGLE_PUBLIC_KEY` is absent.
- [ ] Confirm the status still reports `SDK missing` until the real RevenueCat SDK is installed.

## 5. Required Validation Commands

- [ ] Run `pnpm tsc --noEmit`
- [ ] Run `pnpm build`

## 6. Go / No-Go Blockers

Launch remains **NO-GO** until these are resolved:

- [ ] Real Supabase auth env values and callback registration are configured in the target environment.
- [ ] PostHog ingest is verified with the chosen beta bootstrap approach.
- [ ] Sentry ingest is verified with the chosen beta bootstrap approach.
- [ ] Stripe live keys, both price IDs, webhook registration, and post-checkout subscription handling are implemented.
- [ ] RevenueCat Apple and Google public keys, SDK installation, and live entitlement/offering fetch are implemented.
- [ ] Owner legal details and contact channels replace all `TODO(owner)` placeholders.
- [ ] The owner invite/review workflow for rows in `beta_signups` is defined and tested.
