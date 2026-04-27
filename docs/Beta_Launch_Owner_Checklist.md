# Beta Launch Owner Checklist

**Last updated**: 2026-04-27  
**Owner**: Seungjae  
**Purpose**: Owner-provided inputs and decisions still required before public private beta

Items with ✅ are resolved. Items with [ ] still need action.

---

## 1. Legal and Contact

- [ ] Confirm legal entity name for terms and privacy notice
- [ ] Confirm registered business or contact address
- [ ] Confirm primary privacy contact email
- [ ] Confirm beta support inbox
- [ ] Confirm feedback intake destination
- [ ] Confirm effective date to display on privacy and terms pages
- [ ] Confirm governing law and jurisdiction language
- [ ] Confirm whether invite revocation clause is needed
- [ ] Confirm whether sunset/shutdown notice clause is needed
- [ ] Confirm whether data export/deletion rights belong in terms as well as privacy

---

## 2. Retention and Data Handling

- [ ] Set retention window for uploaded CSV files
- [ ] Set retention window for transaction review metadata
- [ ] Set retention window for waitlist submissions
- [ ] Set retention window for support/feedback conversations
- [ ] Define manual deletion workflow for beta users
- [ ] Define who handles deletion/export requests

---

## 3. Auth / Session

- ✅ Real Supabase project selected
- ✅ Supabase URL and anon key configured via env
- ✅ `/auth/callback` registered as redirect URL in Supabase dashboard
- ✅ Web app receives real access/refresh tokens after callback
- [ ] Verify RLS policy rollout against real beta database (not only migration scaffolds)
- [ ] Verify users table is managed from real Supabase Auth identities

---

## 4. Observability

- ✅ `NEXT_PUBLIC_POSTHOG_KEY` provided
- ✅ `NEXT_PUBLIC_SENTRY_DSN` provided
- [ ] Confirm PostHog dashboard — verify browser events are arriving
- [ ] Confirm Sentry dashboard — verify exceptions are arriving
- [ ] Confirm `NEXT_PUBLIC_POSTHOG_HOST` if not using default EU host
- [ ] Confirm who reviews the first beta dashboards

---

## 5. Billing (Intentionally Inactive for Beta)

Beta is free. Billing is scaffolded but not live. These are pre-paid-launch tasks only.

- [ ] Provide Stripe publishable key + secret key + both price IDs + webhook secret
- [ ] Register Stripe webhook endpoint
- [ ] Provide RevenueCat Apple and Google public keys
- [ ] Install `react-native-purchases` in Expo development build
- [ ] Verify each platform stays unavailable when its own key is absent

---

## 6. Beta Operations

- [ ] Apply `beta_signups` table migration in real beta database
- [ ] Confirm `DATABASE_URL` is available in the deployment environment
- [ ] Decide how signups are reviewed (Supabase Table Editor / Drizzle Studio / other)
- [ ] Decide how invites are sent and tracked
- [ ] Decide support SLA / expected response window for beta users
- [ ] Decide how "trusted number" feedback is collected and reviewed
- [ ] Confirm first wave invite size and selection criteria

---

## Blocking Summary (as of 2026-04-27)

**Blocks first cohort (3–5 users)**:
- Legal placeholder copy in `/privacy` and `/terms`
- RLS verification against real database
- `beta_signups` migration applied

**Blocks public private beta**:
- All of the above
- Observability ingest confirmed
- Auth state machine (callback processing/success/error/rate-limit routes)
- Import edge states (blocked, duplicates, long-process)
