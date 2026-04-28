# 61 — Localhost End-to-End QA Checklist

**Last updated**: 2026-04-28  
**Owner**: Seungjae  
**Purpose**: Manual QA script for verifying the full beta flow locally before any private beta release.

---

## Prerequisites

- Local Supabase project configured in `.env.local` with real `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `DATABASE_URL` set to the real Supabase Postgres connection string
- A real test user account (magic link sign-in)
- A sample ING CSV and/or Trading 212 CSV ready to upload

---

## 0. Reset test user data (required after merchant persistence migration; recommended between all test runs)

**Why reset is required after merchant persistence changes**: Migration `0004_merchant_fields` added
`merchant_name`, `merchant_category`, and `normalized_merchant_name` to the `transactions` table.
Transactions imported before this migration was applied have these fields as `null`. To get accurate
merchant insights on the dashboard and correct merchant names under transaction descriptions, you must
reset and re-import your ING and T212 CSVs using the steps below.

Use the full reset script for a clean slate:

```
docs/sql/reset_test_user_app_data.sql
```

Steps:
1. Find your test user's UUID in Supabase → Authentication → Users
2. Open `docs/sql/reset_test_user_app_data.sql` in a text editor
3. Replace both occurrences of `PASTE_USER_UUID_HERE` with your UUID
4. Run the entire file in Supabase SQL Editor (local project only) or psql
5. Run the verification queries at the bottom of the file — expect all counts = 0 and `onboarding_completed = false`

> **LOCAL / DEV ONLY — NEVER RUN AGAINST PRODUCTION**

After reset:
- Re-import a fresh ING CSV and/or T212 CSV (steps 6 onward)
- Run the SQL check below to verify merchant fields are populated after the fresh T212 import

**SQL check — verify merchant fields after fresh T212 import**:

```sql
-- Confirm merchant_name and merchant_category are populated on Card debit rows
SELECT
  raw_description,
  merchant_name,
  merchant_category,
  normalized_merchant_name
FROM transactions
WHERE user_id = 'PASTE_YOUR_UUID_HERE'
  AND source = 't212_csv'
  AND raw_description = 'Card debit'
LIMIT 10;
```

Expected: `merchant_name` and `merchant_category` are not null for Card debit rows.
If they are null, migration `0004_merchant_fields` has not been applied to your database.

---

## 1. Start dev server

```bash
pnpm web:dev
```

Expected: server starts on `http://localhost:3000`. No TypeScript errors in terminal.

Do NOT use `pnpm dev` from monorepo root — causes stale `.next` chunk errors.

---

## 2. Sign in

1. Open `http://localhost:3000`
2. You should be redirected to `/sign-in`
3. Enter your test email and submit
4. Check your email for the magic link
5. Click the magic link — you should be redirected to `/dashboard` or `/onboarding/payday`

**Expected**: Authenticated session is established. Sidebar is visible. No auth error.

**Failure symptoms**:
- Stuck on `/sign-in` after clicking magic link → check Supabase callback URL registration
- "AUTH_REQUIRED" or redirect loop → check cookie storage in browser

---

## 3. Complete onboarding

Navigate to `http://localhost:3000/onboarding/payday` if not redirected automatically.

### Step 1 — Payday
- Enter a payday day (e.g., `25`)
- Click "Continue to income"
- **Expected**: URL changes to `/onboarding/income?payday=25`

### Step 2 — Income
- Enter expected monthly income in EUR cents (e.g., `350000` for €3,500)
- Click "Continue to investing"
- **Expected**: URL changes to `/onboarding/investing?payday=25&income=350000`

### Step 3 — Investing
- Enter planned investing in EUR cents (e.g., `80000` for €800)
- Leave protection ON (default)
- Click "Continue to accounts"
- **Expected**: URL changes to `/onboarding/accounts?payday=25&income=350000&investing=80000&protection=on`

### Step 4 — Accounts
- Review the setup summary: payday 25, income 350000 cents, investing 80000 cents, protection On
- Click "Finish onboarding"
- **Expected**: Redirected to `/dashboard`

---

## 4. Verify DB persistence

Run in Supabase SQL editor:

```sql
SELECT id, payday_day, expected_monthly_income, planned_investing_protected, onboarding_completed
FROM users
WHERE id = '<your-test-user-id>';
```

**Expected**:
- `payday_day = 25`
- `expected_monthly_income = 350000`
- `planned_investing_protected = true`
- `onboarding_completed = true`

```sql
SELECT year, month, planned_investing, investing_protected
FROM budget_periods
WHERE user_id = '<your-test-user-id>';
```

**Expected**: One row for the current year/month with `planned_investing = 80000` and `investing_protected = true`.

**Failure symptom**: Any of these fields are NULL → the server action failed silently or the user profile row does not exist. Check server logs.

---

## 5. Verify dashboard state after onboarding (before import)

Navigate to `http://localhost:3000/dashboard`.

**Expected**: Dashboard shows one of:
- "Import data is required" (honest next step — no import yet) with a link to `/import`
- NOT "Set your payday first" (this would mean onboarding persistence failed)

**Failure symptom**: "Set your payday first" → `payday_day` is still NULL in DB. Go to step 4 to debug.

---

## 6. Import ING or Trading 212 CSV

1. Navigate to `/import`
2. Select an ING CSV file and the ING account type, then submit
3. Watch the import checklist complete
4. **Expected**: Import completes with a row count. Redirected or shown review state.

For Trading 212:
- Select a T212 CSV and the Trading 212 account type
- **Expected**: Same import flow

**Failure symptoms**:
- "Unsupported format" → wrong file format or account type mismatch
- 0 rows imported → check CSV column headers match expected ING/T212 format
- Server error → check console for DB connection issues

---

## 7. Review and confirm transactions

Navigate to `http://localhost:3000/transactions`.

**Expected**:
- Imported transactions appear in the table
- Rows with `pending` or `needs_attention` status are highlighted in amber
- Each unreviewed row has a "Confirm" button
- The warning banner shows unreviewed count with "Confirm all pending" button

### Per-row confirm:
1. Click "Confirm" on one pending row
2. **Expected**: Page reloads, that row now shows "Reviewed" status in green

### Bulk confirm:
1. Click "Confirm all pending"
2. **Expected**: Page reloads, all previously pending rows now show "Reviewed" status
3. Warning banner is gone

**Failure symptoms**:
- Clicking Confirm has no effect → check `/api/transactions/confirm` returns 303 not 401/403
- "Confirm all pending" button missing → unreviewed count is 0 (banner only shows when count > 0)

---

## 8. Verify dashboard shows real safe-to-spend

Navigate to `http://localhost:3000/dashboard`.

**Expected** (after import + review):
- Safe-to-spend hero shows a real EUR number
- "Available cash", "Protected obligations", "Investing protected" stat cards are populated
- "Days until payday" is shown in the subtitle
- No "Setup needed" banner

**If still showing empty state**: Check which state it is:
- "Set your payday first" → step 4 persistence failed
- "Connect the cash picture" → no accounts created during import (check import service)
- "Import data is required" → import batch not recorded; check `import_batches` table

---

## 9. Verify /why shows the same breakdown

Navigate to `http://localhost:3000/why`.

**Expected**:
- The same safe-to-spend number as `/dashboard`
- "Available Cash" section lists all accounts with balances
- "Protected Obligations" section shows bills, sinking funds, buffer, investing, unreviewed reserve
- "How this becomes €X" formula section at the bottom
- Warnings (if any) are shown inline

**Failure symptom**: Number differs from dashboard → both pages call `loadSafeToSpendSourceData` independently. If they differ, there's a time-of-read discrepancy (normal if transaction confirmed between page loads) or a view model bug.

---

## 10. Verify import edge states

### Duplicate file re-upload:
1. Upload the same ING CSV again
2. **Expected**: "You've already imported this file" or 0 new rows (duplicate detection via file hash)

### Unsupported format:
1. Upload a Rabobank or unrecognized CSV
2. **Expected**: "Unsupported format" error message naming ING and Trading 212 as the only supported formats

### Partially reviewed state:
1. After import, confirm only some rows
2. Check `/dashboard` — safe-to-spend reserve should reflect unreviewed transactions
3. Confirm remaining rows
4. Check `/dashboard` again — reserve should drop to €0

---

## Commands summary

```bash
# Start dev server
pnpm web:dev

# Type check (must pass before any commit)
pnpm tsc --noEmit

# Run all tests
pnpm test

# Run web tests only
pnpm --dir apps/web test

# Full build check
pnpm build
```

---

## Supabase connection slots

If you see `FATAL: 53300: remaining connection slots are reserved for roles with the SUPERUSER attribute`:

1. **Stop the dev server** (`Ctrl+C`) — idle connections are released within ~20 seconds.
2. **Avoid running** `pnpm web:dev` and Supabase Table Editor in intensive use at the same time.
3. If connections remain stuck: terminate them via `SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE state = 'idle';` in the SQL editor.
4. Last resort: `supabase stop && supabase start`.

See `docs/62_Supabase_Local_Connection_Troubleshooting.md` for full diagnosis steps.

---

## GO / NO-GO interpretation

| Result | Interpretation |
|--------|---------------|
| All 10 steps pass | GO for local private beta |
| Step 4 fails (DB not persisted) | NO-GO — onboarding persistence broken |
| Step 8 shows "Set your payday first" | NO-GO — root cause in step 4 |
| Step 6 import fails consistently | NO-GO — import pipeline broken |
| Step 7 confirm fails | NO-GO — review API broken |
| Minor display issues | CONDITIONAL GO — document and continue |

---

## Phase 1.5 Beta Polish — Additional QA Scenarios

### 11. Monthly dashboard slicer

1. Navigate to `/dashboard`
2. **Expected**: A month selector dropdown appears in the header (shows current month by default)
3. Import at least 1 transaction from a previous month
4. Select a past month from the dropdown
5. **Expected**: Dashboard shows monthly overview card for that month, with:
   - Reviewed spending total
   - Reviewed inflows
   - "Actual avg spend/day" = reviewed spending ÷ calendar days in that month
   - Note clearly labeled (not mixing with safe remaining/day)
6. Switch back to current month
7. **Expected**: Safe-to-spend hero reappears; monthly card shows "Actual spend/day so far" and elapsed days

**Failure symptom**: Dropdown not visible → no transactions or DB not connected.

---

### 12. Days-until-payday explanation on /why

1. Navigate to `/why`
2. **Expected**: In the formula section, a line reads: "Based on payday day X, there are Y days until next payday (DD Mon)."
3. Verify the payday day matches what was entered in onboarding
4. Verify the days count is correct relative to today's date

---

### 13. Per-row intent editing on /transactions

1. Navigate to `/transactions`
2. **Expected**: Each row has an intent select dropdown and a "Save" button
3. Change the intent on any row and click "Save"
4. **Expected**: Page reloads, the row now shows the updated intent badge
5. Optionally confirm the row after editing
6. **Expected**: Row status changes to "Reviewed"

**Failure symptom**: Save has no effect → check `/api/transactions/update-intent` returns 303 not 401/403.

---

### 14. Import auto-selects account

1. Complete onboarding (creates ING Checking and Trading 212 Portfolio accounts automatically)
2. Navigate to `/import`
3. **Expected**: "Target account" section shows the account name (e.g., "ING Checking") with "Account auto-selected from onboarding"
4. No UUID input field visible
5. Switch source to T212 — **Expected**: T212 account auto-selected
6. Switch back to ING — **Expected**: ING account auto-selected

**Failure symptom**: "No ING account found" warning → onboarding did not create accounts (check if `createDefaultAccountsIfMissing` ran). If user onboarded before Phase 1.5, they may need to re-onboard or accounts need to be manually created.

---

### 15. T212 intent policy

1. Import a T212 CSV that includes:
   - Deposit rows (ING → T212 transfers)
   - Market buy rows
   - Market sell rows
   - Dividend rows
   - Card debit rows (if available)
2. Navigate to `/transactions`
3. **Expected**:
   - Deposit → intent badge shows "Transfer" (not "Investing")
   - Market buy → intent badge shows "Buy"
   - Market sell → intent badge shows "Sell"
   - Dividend → intent badge shows "Dividend"
   - Card debit → intent badge shows "Living"
4. Navigate to `/why`
5. **Expected**: Formula note mentions T212 context (card spending = living expense, deposits = transfer)

---

### 16. Duplicate re-upload shows readable reason

1. Import an ING CSV
2. Import the exact same ING CSV again
3. **Expected**: "File already imported" message OR skipped rows section shows human-readable reason
4. Import a modified ING CSV with some overlapping rows
5. **Expected**: Skipped rows section shows "Already imported (matched by date, amount, and description)" for the duplicate rows

---

## Updated GO / NO-GO for Phase 1.5

| Area | Status |
|------|--------|
| Monthly slicer (Criteria A) | ✅ Implemented — test with step 11 |
| Days-until-payday explanation (Criteria B) | ✅ Implemented — test with step 12 |
| Per-row intent editing (Criteria C) | ✅ Implemented — test with step 13 |
| Import auto-account selection (Criteria D) | ✅ Implemented — test with step 14 |
| T212 intent policy (Criteria E) | ✅ Implemented — test with step 15 |
| Duplicate dedup messaging (Criteria F) | ✅ Improved — test with step 16 |

---

## Phase 1.6 Review Productivity + Basic Category Analysis — Additional QA Scenarios

### 17. Filter by description (Criteria A)

1. Navigate to `/transactions`
2. Click any description cell (e.g., "Spending cashback")
3. **Expected**: Filter chip appears at the top: *"Filtered: Spending cashback · N rows"*
4. Only rows with that exact description are visible
5. Other rows are hidden
6. Click "✕ Clear filter"
7. **Expected**: All rows reappear, filter chip is gone
8. Click a different description
9. **Expected**: Filter resets to the new description immediately

**Failure symptom**: All rows still visible after clicking → `filterDesc` state not set. Check `TransactionsClient.tsx`.

---

### 18. Row checkboxes and select all (Criteria B)

1. Navigate to `/transactions`
2. Click the checkbox on any row
3. **Expected**: Row highlights with accent tint, checkbox checked, selection count bar appears: *"1 selected"*
4. Click the header checkbox (select all visible)
5. **Expected**: All visible rows are selected, count updates
6. Filter by a description (step 17), then use select all
7. **Expected**: Only filtered rows are selected — hidden rows untouched
8. Click "Clear selection"
9. **Expected**: All checkboxes unchecked, bulk bar disappears

---

### 19. Bulk set intent + category (Criteria C + D)

1. Filter by a description (e.g., "Card debit")
2. Click header checkbox to select all visible
3. In the bulk action bar, set intent to "Living expense"
4. Set category to "Groceries"
5. Click "Apply to selected"
6. **Expected**: All selected rows now show:
   - Intent badge: "Living"
   - Category column: "Groceries"
   - Rows remain visible (no page reload)
7. Repeat with intent = "Transfer" and category = "Transfer"
8. **Expected**: Intent and category update in place
9. Set category to "— Clear category —" with any intent
10. **Expected**: Category column reverts to "—" for selected rows

**Failure symptom**: "Apply to selected" does nothing → check `/api/transactions/bulk-update` returns 200 with `{ status: "updated" }`.

---

### 20. Bulk confirm selected rows (Criteria C)

1. Filter by a description that has unreviewed rows
2. Select all filtered rows
3. Click "Confirm selected"
4. **Expected**: Selected rows status changes from "Ready to confirm" to "Reviewed" (no page reload)
5. Warning banner count decreases by the confirmed count
6. If all unreviewed rows were confirmed, banner disappears

---

### 21. Confirm all pending (from banner) — client-side (Criteria G)

1. Import a fresh CSV to get unreviewed rows
2. Navigate to `/transactions`
3. **Expected**: Warning banner shows unreviewed count with "Confirm all pending" button
4. Click "Confirm all pending"
5. **Expected**: All rows in current view transition to "Reviewed" without page reload
6. Warning banner disappears

---

### 22. Category analysis on Dashboard (Criteria E)

1. Navigate to `/transactions`
2. Filter by description, select rows, set category (e.g., Groceries), apply
3. Navigate to `/dashboard`
4. **Expected**: A "Spending by category" card appears (below Monthly overview)
   - Shows reviewed transactions only
   - Lists categories with EUR total, transaction count, and progress bar
   - Rows with no category show as "Uncategorized" in italic
   - Transfers, investment buys/sells, income are excluded
5. Select a past month from the month selector
6. **Expected**: Category breakdown updates for that month
7. Confirm: total of all categories ≤ total reviewed spending (exact if all spending is categorized)

**Failure symptom**: Category card missing → no reviewed spending transactions in selected month, or `loadMonthlyCategoryBreakdown` returned empty array.

---

### 23. Description filter + bulk productivity flow (Criteria G — full flow)

Complete the full productivity loop:
1. Import a T212 CSV with "Card debit" rows
2. Navigate to `/transactions`
3. Click "Card debit" description
4. **Expected**: Only Card debit rows visible
5. Select all (header checkbox)
6. Set intent = "Living expense", category = "Shopping"
7. Apply to selected
8. Click "Confirm selected"
9. **Expected**: All Card debit rows are now Living / Shopping / Reviewed — in one workflow

For ING rows like "Spending cashback":
1. Click "Spending cashback" description
2. Select all, set intent + category, apply + confirm
3. **Expected**: Same one-workflow result

---

## Updated GO / NO-GO for Phase 1.6

| Area | Status |
|------|--------|
| Filter by description (Criteria A) | ✅ Implemented — test with step 17 |
| Row checkboxes + select all (Criteria B) | ✅ Implemented — test with step 18 |
| Bulk intent + category (Criteria C) | ✅ Implemented — test with step 19 |
| Minimal category taxonomy (Criteria D) | ✅ Implemented — system categories seeded on first load |
| Category analysis on dashboard (Criteria E) | ✅ Implemented — test with step 22 |
| Safe-to-spend engine unchanged (Criteria F) | ✅ Analysis is read-only — no engine changes |
| Productivity loop (Criteria G) | ✅ Implemented — test with step 23 |

---

## Phase 1.7 Merchant-Assisted Categorisation + Beta Hardening — Additional QA Scenarios

### 24. Merchant insights card on Dashboard

1. Import an ING or T212 CSV with multiple transactions from the same merchant
2. Review and confirm those transactions
3. Navigate to `/dashboard`
4. **Expected**: A "Merchant insights" card appears below category breakdown
   - Lists top merchants by reviewed spend with EUR total and % bar
   - Merchants with 2+ months of spend show a "Recurring" badge
5. Select a past month with reviewed spending
6. **Expected**: Merchant insights updates for that month

**Failure symptom**: Card not visible → no reviewed spending transactions in selected month, or fewer than 2 distinct merchants.

---

### 25. Merchant-assisted bulk categorisation (Criteria Phase 1.7)

1. Import a CSV with "Albert Heijn" or "NS" or similar recognisable Dutch merchants
2. Navigate to `/transactions`
3. **Expected**: A banner or button appears: "Apply merchant suggestions" (or similar)
4. Click the button
5. **Expected**: Rows with known merchant patterns are pre-filled with category (e.g., "Groceries" for Albert Heijn)
6. Review and confirm the auto-categorised rows
7. Navigate to `/dashboard`
8. **Expected**: Category breakdown shows the updated categories

**Failure symptom**: No suggestions applied → merchant mapping registry may not include the merchant patterns in your CSV. Check `apps/web/src/merchants/`.

---

### 26. Auth callback error states

1. Open the magic link callback URL but modify the token (e.g., append `x` to `access_token`)
2. **Expected**: `/auth/callback` shows "The sign-in link has expired or is no longer valid. Please request a new magic link." with a "Back to sign in" button
3. Clicking "Back to sign in" → returns to `/sign-in`

**Failure symptom**: Raw error like "Missing Supabase session tokens" → callback page not yet updated.

---

### 27. Fresh-user onboarding redirect

1. Clear cookies for localhost (or use a fresh browser profile)
2. Request a magic link for a new account that has never completed onboarding
3. Click the magic link
4. **Expected**: After `/auth/callback` completes, user is redirected to `/onboarding/payday` (not `/dashboard`)
5. Complete onboarding
6. Sign out and sign back in
7. **Expected**: After `/auth/callback`, user is now redirected to `/dashboard`

**Failure symptom**: Always goes to `/dashboard` → `onboarding_completed` flag not being checked in `/api/auth/onboarding-status`.

---

### 28. No UUID in import "already imported" notice

1. Import a CSV once
2. Import the exact same CSV again
3. **Expected**: Notice reads: "This file was already imported. No new transactions were added."
4. **NOT expected**: Any UUID string like `550e8400-e29b-41d4-a716-446655440000` in the notice

---

### 29. Verify observability bootstrap in browser

1. Open the app in a browser after signing in
2. Open DevTools → Console
3. Type: `window.__dartObservabilityBootstrap`
4. **Expected**: `{ posthog: "configured", sentry: "configured" }` (if keys are set in `.env.local`)
5. Type: `window.__dartObservedEvents`
6. **Expected**: Array of events captured since page load (e.g., `csv_import_completed`, `onboarding_completed`)
7. Open Network tab, filter by `i.posthog.com` or `sentry.io`
8. Trigger an event (e.g., complete an import)
9. **Expected**: Network request to PostHog capture endpoint with status 200

---

---

### 30. Merchant persistence — T212 import

Requires a T212 CSV with Card debit rows (column headers include `Merchant name` and `Merchant category`).

1. Reset test data (step 0)
2. Import a fresh T212 CSV containing at least one Card debit row
3. Open Supabase Table Editor → `transactions` table
4. Locate a Card debit row
5. **Expected**:
   - `merchant_name` is not null (e.g. `DIRK VDBROEK FIL4103`)
   - `merchant_category` is not null (e.g. `RETAIL_STORES`)
   - `normalized_merchant_name` is lowercase + trimmed form of merchant_name (e.g. `dirk vdbroek fil4103`)
6. Navigate to `/transactions`
7. **Expected**: Card debit rows show merchant name below the description (e.g. `merchant: DIRK VDBROEK FIL4103`)

**Failure symptom**: `merchant_name` is null → migration 0004 not applied, or parser not extracting columns.

---

### 31. Merchant persistence — existing data note

Transactions imported before migration `0004_merchant_fields` was applied will have
`merchant_category = null` and `normalized_merchant_name = null`.
This is expected behaviour — no backfill is performed automatically.
A fresh re-import after a data reset will persist all merchant fields correctly.

---

### 32. Dashboard merchant insights use merchant names

After a fresh T212 import with Card debit rows, mark the relevant transactions as reviewed (intent: living_expense).

1. Navigate to `/dashboard`
2. Scroll to the Merchant Insights card (or the month in question)
3. **Expected**:
   - Top merchants list shows actual merchant names (not just null/blank rows)
   - Merchants that appear in ≥2 of the 3 rolling months are listed as recurring
4. If previous imports had no merchant names, re-import after a data reset for accurate results

**Failure symptom**: All top-merchant rows blank → `merchant_name` not persisted on new import.

---

## Updated GO / NO-GO for Phase 1.7 + Beta Hardening + Merchant Persistence Fix

| Area | Status |
|------|--------|
| Merchant insights on dashboard (Phase 1.7 A) | ✅ Implemented — test with step 24 |
| Merchant-assisted categorisation (Phase 1.7 B) | ✅ Implemented — test with step 25 |
| Auth callback error states (Hardening 1) | ✅ Implemented — test with step 26 |
| Fresh-user onboarding redirect (Hardening 2) | ✅ Implemented — test with step 27 |
| No UUID in UX (Hardening 3) | ✅ Implemented — test with step 28 |
| Observability verification path (Hardening 4) | ⚠️ Owner verification needed — test with step 29 |
| T212 merchant_name + merchant_category persisted | ✅ Implemented — test with step 30 |
| Transactions UI shows merchant under description | ✅ Implemented — test with step 30 |
| Dashboard merchant insights use persisted names | ✅ Implemented — test with step 32 |
