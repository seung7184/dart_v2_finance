# Beta Readiness Verification Checklist

**Last updated**: 2026-04-27  
**Owner**: Seungjae  
**Purpose**: End-to-end verification of the private beta experience

✅ = verified | [ ] = still needs verification | ❌ = known gap

---

## 1. Environment and Build

- ✅ `pnpm tsc --noEmit` passes (zero errors)
- ✅ `pnpm build` passes
- ✅ `pnpm web:dev` starts on `localhost:3000`
- ✅ Supabase env values configured (URL, anon key, callback URL registered)
- ✅ PostHog key configured
- ✅ Sentry DSN configured

---

## 2. Auth Flow

- ✅ `/sign-in` renders and accepts email input
- ✅ Magic link email is sent via Supabase
- ✅ `/auth/callback` receives and exchanges tokens
- ✅ Authenticated session correctly gates all `(app)` routes
- [ ] Unauthenticated visit to `(app)` routes redirects to `/sign-in`
- ❌ `/auth/callback/processing` — checklist screen not implemented
- ❌ `/auth/callback/success` — confirmation screen not implemented
- ❌ `/auth/callback/error` — error detail screen not implemented
- ❌ `/auth/callback/rate-limit` — countdown screen not implemented

---

## 3. Import Flow

- ✅ `/import` requires authenticated session
- ✅ Preview fails when `accountId` is blank
- ✅ Preview fails when session user does not own the target account
- ✅ ING CSV preview and import works
- ✅ Trading 212 CSV preview and import works (including `Currency (Total)` column)
- ✅ Successful import emits `csv_import_completed`
- ✅ 393-row ING smoke: 0 errors, 0 duplicates
- [ ] First import emits `first_import` once only — verify in PostHog
- [ ] Import errors reach Sentry — verify in Sentry dashboard
- ❌ `/import/blocked` screen — wrong format error state not implemented
- ❌ `/import/duplicates` screen — per-row skip reason not implemented
- ❌ `/import/processing` screen — long-import progress not implemented

---

## 4. Transactions

- ✅ `/transactions` loads DB-backed rows for the authenticated user
- ✅ Read-only mode — no editing in V1 beta
- [ ] Read-only beta notice banner matches final design spec
- [ ] Needs-review rows show warning tint (4% background) — not yet implemented
- [ ] `transaction_reviewed` event fires for single and bulk actions

---

## 5. Why This Number

- ✅ `/why` loads without errors
- ✅ Assumption trail is visible and navigable
- [ ] `first_trusted_number` event fires once only — verify in PostHog

---

## 6. Dashboard and Settings

- ✅ `/dashboard` shows safe-to-spend hero, stat cards, next bills, quick links
- ✅ `/settings` shows theme toggle, account info, data section, legal links
- ✅ Light mode / dark mode toggle works and persists via localStorage
- ✅ No theme flash on page load

---

## 7. Operational Pages

- ✅ `/readiness` renders 5 groups with per-item status
- ✅ `/privacy` renders EU/GDPR pills and 4 stat cards
- ✅ `/terms` renders plain-language summary and 7 sections
- [ ] Replace all `TODO(owner)` placeholders in `/privacy` and `/terms`

---

## 8. Beta Signup

- [ ] Visit `/beta` and submit a valid request (ING + Trading 212)
- [ ] Confirm API returns a durable `beta-...` ticket
- [ ] Confirm a row is written to `beta_signups` in the target database
- [ ] Submit the same email twice — confirm existing ticket is returned (no duplicate)
- [ ] Submit an invalid combination — confirm validation blocks it

---

## 9. Observability Bootstrap

- [ ] Load an app page with no observability env values — confirm no client errors
- [ ] Set `NEXT_PUBLIC_POSTHOG_KEY` — confirm browser events arrive in PostHog
- [ ] Set `NEXT_PUBLIC_SENTRY_DSN` — confirm browser exceptions arrive in Sentry

---

## Go / No-Go Blockers

**First cohort (3–5 users) — Conditional GO**  
The basic sign-in → import → transactions → why flow works end-to-end. Proceed with first cohort while resolving items below.

**Full private beta launch — still blocked by**:
- Auth callback state machine (4 missing routes)
- Import edge states (3 missing screens)
- Legal `TODO(owner)` placeholders in `/privacy` and `/terms`
- `beta_signups` migration applied to real database
- Observability ingest confirmed in dashboards
