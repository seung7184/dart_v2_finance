# 61 — Localhost End-to-End QA Checklist

**Last updated**: 2026-04-27  
**Owner**: Seungjae  
**Purpose**: Manual QA script for verifying the full beta flow locally before any private beta release.

---

## Prerequisites

- Local Supabase project configured in `.env.local` with real `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `DATABASE_URL` set to the real Supabase Postgres connection string
- A real test user account (magic link sign-in)
- A sample ING CSV and/or Trading 212 CSV ready to upload

---

## 0. Reset test user data (optional but recommended between test runs)

If you want a clean slate for a specific user:

```sql
-- Run in Supabase SQL editor or psql
DELETE FROM transactions WHERE user_id = '<your-test-user-id>';
DELETE FROM import_rows WHERE user_id = '<your-test-user-id>';
DELETE FROM import_batches WHERE user_id = '<your-test-user-id>';
DELETE FROM accounts WHERE user_id = '<your-test-user-id>';
UPDATE users
  SET payday_day = NULL,
      expected_monthly_income = NULL,
      planned_investing_protected = TRUE,
      onboarding_completed = FALSE,
      updated_at = now()
  WHERE id = '<your-test-user-id>';
DELETE FROM budget_periods WHERE user_id = '<your-test-user-id>';
```

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
