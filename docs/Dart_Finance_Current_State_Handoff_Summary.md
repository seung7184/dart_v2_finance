# Dart Finance — Current State Handoff Summary

## 1. Architecture / Product Scope Completed
### Phase 1 (Web MVP Core)
Implemented and validated:
- Safe-to-spend engine
- Supabase connection readiness
- Web onboarding flow
- ING CSV parser
- Trading212 CSV parser
- Web CSV import UI
- Transactions UI
- “Why This Number?” explanation flow

Validation:
- pnpm test passed
- pnpm tsc --noEmit passed
- pnpm build passed

## 2. Phase 2 (Mobile V1)
Implemented:
- Home tab
- Quick Add (local-state only, no write layer)
- Read-only transactions tab
- Read-only recurring bills tab

Constraints:
- integer cents only
- no mobile write layer
- no scope expansion

## 3. Phase 3 (Beta Readiness)
Auth / RLS:
- deny-by-default protected routes
- auth start + callback routes
- RLS SQL scaffolds
- ownership checks in import route

Fixes:
- options.email_redirect_to
- root-token fallback
- better auth-start error surfacing

## 4. Observability
Implemented:
- PostHog event hooks
- Sentry client/server paths
- bootstrap no-op fallback

## 5. Billing (Non-Live)
Implemented scaffolds only:
- Stripe monthly + annual env contract
- RevenueCat Apple + Google readiness
- billing intentionally off for beta

## 6. Import / Data
Trading212 parser bug fixed:
- Currency (Total) supported

Exact CSV smoke:
- 393 imported rows
- 0 parser errors
- 0 duplicates

120-second timeout likely environment/test-harness related, not parser performance.

## 7. Transactions View Upgrade
Now:
- DB-backed
- authenticated
- read-only
- filters by transactions.userId = current session user

## 8. Dev / Runtime Stability Fix
Resolved:
Cannot find module './15.js'

Cause:
- build run while next dev active
- stale .next chunk mismatch

Use:
pnpm web:dev

NOT:
pnpm dev

## Remaining Critical Blockers
1. Real authenticated user/account smoke still missing
2. Supabase auth rate limit:
429 over_email_send_rate_limit
3. Provider dashboard confirmation still manual
4. Legal placeholders unresolved

## Current Recommendation
NO-GO for private beta today

Blocked by:
- real auth/account smoke
- provider verification
- legal placeholders

## What I want Claude to improve
1. Auth flow UX simplification
2. Transactions page design
3. Import flow robustness
4. Beta launch risk review
5. Architecture simplification

## Summary
Core product + mobile + auth + observability + import + DB-backed transactions are largely implemented.

Remaining blockers are mostly operational, not major missing code.
