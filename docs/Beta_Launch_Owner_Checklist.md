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
- [ ] Replace the temporary `dart_auth_uid` cookie contract with the real Supabase session flow.
- [ ] Verify that the users table is created/managed from real Supabase Auth identities.
- [ ] Verify RLS policy rollout against the real beta database, not only migration scaffolds.

## 4. Observability Provider Inputs

- [ ] Provide `NEXT_PUBLIC_POSTHOG_KEY`.
- [ ] Decide how PostHog is bootstrapped in the web client.
- [ ] Confirm where the first beta dashboards live and who reviews them.
- [ ] Provide `NEXT_PUBLIC_SENTRY_DSN`.
- [ ] Decide how Sentry is bootstrapped in the web client and server runtime.
- [ ] Verify that captured exceptions from import/beta/billing flows arrive in Sentry.

## 5. Billing Provider Inputs

- [ ] Provide `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`.
- [ ] Define the real Stripe product and price IDs for the beta paid plan.
- [ ] Decide whether the beta uses monthly only or both monthly and annual pricing.
- [ ] Implement real checkout session creation and webhook handling before enabling payment.
- [ ] Provide `EXPO_PUBLIC_REVENUECAT_APPLE_PUBLIC_KEY`.
- [ ] Confirm the final RevenueCat offering identifier.
- [ ] Confirm the final RevenueCat entitlement identifier.
- [ ] Decide how RevenueCat entitlements map to the paid beta plan.

## 6. Beta Operations Decisions

- [ ] Decide where accepted waitlist tickets are stored after the current mock handler.
- [ ] Decide how invites are sent and tracked.
- [ ] Decide the support SLA or expected response window for beta users.
- [ ] Decide how “trusted number” feedback is collected and reviewed.
- [ ] Confirm the first wave invite size and selection criteria.

## Current Blocking Summary

- Real provider SDK bootstrap is still missing for Supabase auth, PostHog, Sentry, Stripe, and RevenueCat.
- Current web billing is mock checkout only.
- Current beta signup is a mock local handler only.
- Privacy/terms copy still contains explicit `TODO(owner)` placeholders.

