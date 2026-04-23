# Beta Launch Owner Checklist

Version 1.0 · 2026-04-22
Owner: Seungjae
Status: Owner input required before private beta launch

## Purpose

This checklist captures the owner-provided legal details, provider keys, and external-account decisions still required before Dart Finance can move from scaffolded beta readiness to an actual inviteable private beta.

## 1. Legal And Contact Details

- [ ] Confirm legal entity name for the beta terms and privacy notice.
- [ ] Confirm registered business address or official contact address.
- [ ] Confirm the primary privacy contact email.
- [ ] Confirm the beta support inbox.
- [ ] Confirm the feedback intake destination.
- [ ] Confirm the effective date to display on the privacy and terms pages.
- [ ] Confirm governing law and jurisdiction language for the beta terms.
- [ ] Confirm whether the beta needs an explicit invite revocation clause.
- [ ] Confirm whether the beta needs an explicit sunset / shutdown notice clause.
- [ ] Confirm whether data export and deletion rights should be described in the beta terms in addition to the privacy notice.

## 2. Retention And Data Handling Decisions

- [ ] Set the retention window for uploaded CSV files.
- [ ] Set the retention window for transaction review metadata.
- [ ] Set the retention window for waitlist submissions.
- [ ] Set the retention window for support and feedback conversations.
- [ ] Define the manual deletion workflow for beta users.
- [ ] Define who is responsible for handling deletion/export requests.

## 3. Auth / Session Provider Inputs

- [ ] Confirm the real Supabase project to use for beta auth.
- [ ] Provide the Supabase URL and anon key through the approved env path.
- [ ] Confirm the production callback / redirect URLs.
- [ ] Register `/auth/callback` as the web auth redirect URL in Supabase.
- [ ] Verify the web app receives real Supabase access/refresh tokens after callback.
- [ ] Verify that the users table is created/managed from real Supabase Auth identities.
- [ ] Verify RLS policy rollout against the real beta database, not only migration scaffolds.

## 4. Observability Provider Inputs

- [ ] Provide `NEXT_PUBLIC_POSTHOG_KEY`.
- [ ] Decide whether the built-in lightweight PostHog bootstrap is sufficient for beta, or whether the full PostHog SDK must replace it before launch.
- [ ] Confirm `NEXT_PUBLIC_POSTHOG_HOST` if the beta does not use the default EU PostHog ingest host.
- [ ] Confirm where the first beta dashboards live and who reviews them.
- [ ] Provide `NEXT_PUBLIC_SENTRY_DSN`.
- [ ] Provide `SENTRY_DSN` too if the deployment uses a server-only runtime env split.
- [ ] Decide whether the built-in lightweight Sentry bootstrap is sufficient for beta, or whether the full Sentry SDK must replace it before launch.
- [ ] Verify that captured exceptions from import/beta/billing flows arrive in Sentry.

## 5. Billing Provider Inputs

- [ ] Provide `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`.
- [ ] Provide `NEXT_PUBLIC_STRIPE_PRICE_ID_MONTHLY`.
- [ ] Provide `NEXT_PUBLIC_STRIPE_PRICE_ID_ANNUAL`.
- [ ] Provide `STRIPE_SECRET_KEY`.
- [ ] Provide `STRIPE_WEBHOOK_SECRET`.
- [ ] Define the real Stripe product and price IDs for both beta billing cadences.
- [ ] Register the Stripe webhook endpoint for checkout/subscription events in the target environment.
- [ ] Verify that monthly and annual plans each stay hidden or unavailable when their own price IDs are absent.
- [ ] Provide `EXPO_PUBLIC_REVENUECAT_APPLE_PUBLIC_KEY`.
- [ ] Provide `EXPO_PUBLIC_REVENUECAT_GOOGLE_PUBLIC_KEY`.
- [ ] Confirm the shared RevenueCat offering identifier is `default`.
- [ ] Confirm the shared RevenueCat entitlement identifier is `premium`.
- [ ] Confirm the shared RevenueCat package identifiers are `$rc_monthly` and `$rc_annual`.
- [ ] Install and configure `react-native-purchases` in an Expo development build before claiming mobile billing is live.
- [ ] Verify each platform stays unavailable when its own public key is absent.

## 6. Beta Operations Decisions

- [ ] Apply the `beta_signups` table migration in the real beta database.
- [ ] Confirm the deployment has `DATABASE_URL` available for the beta signup API route.
- [ ] Decide whether beta signups are reviewed in Supabase Table Editor, Drizzle Studio, or another existing DB admin path.
- [ ] Decide how invites are sent and tracked.
- [ ] Decide the support SLA or expected response window for beta users.
- [ ] Decide how “trusted number” feedback is collected and reviewed.
- [ ] Confirm the first wave invite size and selection criteria.

## Current Blocking Summary

- Supabase auth is now wired to a real callback/token path, but it still needs a real project, env values, and redirect URL registration.
- PostHog and Sentry now have env-aware lightweight bootstrap wiring, but they still need real keys/DSNs and ingest verification.
- Stripe checkout now has a live-ready session creation path, but it still needs real keys, both price IDs, webhook registration, and downstream subscription handling.
- RevenueCat now has a live-ready cross-store config contract, but it still needs both public keys, SDK installation, and entitlement/offering verification in a development build.
- Beta signup now writes to the app database, but the owner still needs the real DB migration applied and an operational review/send-invite workflow.
- Privacy/terms copy still contains explicit `TODO(owner)` placeholders.
