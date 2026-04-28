-- =============================================================================
-- reset_test_user_app_data.sql
--
-- LOCAL / DEV ONLY — NEVER RUN AGAINST PRODUCTION
--
-- Purpose: Delete all app data for a single test user, then reset their
--          onboarding state. The auth.users row is preserved. This gives
--          a clean slate for re-importing ING / T212 CSVs.
--
-- Usage:
--   1. Replace PASTE_USER_UUID_HERE with the test user's UUID.
--      (Find it in Supabase → Authentication → Users)
--   2. Run in Supabase SQL Editor (local project) or psql against your
--      LOCAL Supabase Postgres instance.
--   3. Run the verification queries at the bottom to confirm the reset.
--
-- When is this needed?
--   After schema migrations that add new columns (e.g. 0004_merchant_fields
--   added merchant_name, merchant_category, normalized_merchant_name), old
--   imported transactions will not have those fields populated. Reset and
--   re-import to get accurate data in merchant insights and category analysis.
-- =============================================================================

-- Set the target user ID here (replace this placeholder):
-- Replace PASTE_USER_UUID_HERE with a real UUID, e.g.:
--   '550e8400-e29b-41d4-a716-446655440000'

DO $$
DECLARE
  target_user_id UUID := 'PASTE_USER_UUID_HERE';
BEGIN

  -- -------------------------------------------------------------------------
  -- Step 1: Delete audit logs (references transactions and other user data)
  -- -------------------------------------------------------------------------
  DELETE FROM audit_logs
  WHERE user_id = target_user_id;

  -- -------------------------------------------------------------------------
  -- Step 2: Delete transfer links (FK → transactions)
  --         Must be deleted before transactions.
  -- -------------------------------------------------------------------------
  DELETE FROM transfer_links
  WHERE user_id = target_user_id;

  -- -------------------------------------------------------------------------
  -- Step 3: Delete reimbursement links (FK → transactions)
  --         Must be deleted before transactions.
  -- -------------------------------------------------------------------------
  DELETE FROM reimbursement_links
  WHERE user_id = target_user_id;

  -- -------------------------------------------------------------------------
  -- Step 4: Delete import rows (FK → transactions and import_batches)
  --         Must be deleted before transactions and import_batches.
  -- -------------------------------------------------------------------------
  DELETE FROM import_rows
  WHERE user_id = target_user_id;

  -- -------------------------------------------------------------------------
  -- Step 5: Delete safe-to-spend snapshots (audit cache, FK → users)
  -- -------------------------------------------------------------------------
  DELETE FROM safe_to_spend_snapshots
  WHERE user_id = target_user_id;

  -- -------------------------------------------------------------------------
  -- Step 6: Delete transactions (FK → accounts and import_batches)
  --         Must be deleted before import_batches and accounts.
  -- -------------------------------------------------------------------------
  DELETE FROM transactions
  WHERE user_id = target_user_id;

  -- -------------------------------------------------------------------------
  -- Step 7: Delete import batches (FK → accounts)
  --         Must be deleted before accounts.
  -- -------------------------------------------------------------------------
  DELETE FROM import_batches
  WHERE user_id = target_user_id;

  -- -------------------------------------------------------------------------
  -- Step 8: Delete budget periods (FK → users)
  -- -------------------------------------------------------------------------
  DELETE FROM budget_periods
  WHERE user_id = target_user_id;

  -- -------------------------------------------------------------------------
  -- Step 9: Delete sinking funds (FK → users)
  -- -------------------------------------------------------------------------
  DELETE FROM sinking_funds
  WHERE user_id = target_user_id;

  -- -------------------------------------------------------------------------
  -- Step 10: Delete recurring series (FK → users)
  -- -------------------------------------------------------------------------
  DELETE FROM recurring_series
  WHERE user_id = target_user_id;

  -- -------------------------------------------------------------------------
  -- Step 11: Delete user-defined rules (FK → users)
  -- -------------------------------------------------------------------------
  DELETE FROM rules
  WHERE user_id = target_user_id;

  -- -------------------------------------------------------------------------
  -- Step 12: Delete user-defined categories (system categories have
  --          user_id = NULL and are shared — do not delete those)
  -- -------------------------------------------------------------------------
  DELETE FROM categories
  WHERE user_id = target_user_id;

  -- -------------------------------------------------------------------------
  -- Step 13: Delete accounts (FK → users)
  --          Any remaining transactions cascade-delete at this point
  --          (account_id FK has onDelete: cascade), but step 6 already
  --          cleared them explicitly.
  -- -------------------------------------------------------------------------
  DELETE FROM accounts
  WHERE user_id = target_user_id;

  -- -------------------------------------------------------------------------
  -- Step 14: Reset user onboarding state
  --          Does NOT delete the auth.users row — the user can still sign in.
  -- -------------------------------------------------------------------------
  UPDATE users
  SET
    payday_day                  = NULL,
    payday_type                 = NULL,
    expected_monthly_income     = NULL,
    minimum_cash_buffer         = 0,
    planned_investing_protected = TRUE,
    onboarding_completed        = FALSE,
    updated_at                  = now()
  WHERE id = target_user_id;

  RAISE NOTICE 'Reset complete for user %', target_user_id;

END $$;

-- =============================================================================
-- Verification queries — run these after the DO block to confirm the reset
-- =============================================================================

-- Count of remaining transactions (expect 0)
SELECT count(*) AS transactions_remaining
FROM transactions
WHERE user_id = 'PASTE_USER_UUID_HERE';

-- Count of remaining accounts (expect 0)
SELECT count(*) AS accounts_remaining
FROM accounts
WHERE user_id = 'PASTE_USER_UUID_HERE';

-- Count of remaining import batches (expect 0)
SELECT count(*) AS import_batches_remaining
FROM import_batches
WHERE user_id = 'PASTE_USER_UUID_HERE';

-- Count of remaining budget periods (expect 0)
SELECT count(*) AS budget_periods_remaining
FROM budget_periods
WHERE user_id = 'PASTE_USER_UUID_HERE';

-- Onboarding state (expect payday_day = NULL, onboarding_completed = false)
SELECT id, payday_day, expected_monthly_income, planned_investing_protected, onboarding_completed
FROM users
WHERE id = 'PASTE_USER_UUID_HERE';

-- Spot check: confirm merchant fields are present in schema (expect column list)
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'transactions'
  AND column_name IN ('merchant_name', 'merchant_category', 'normalized_merchant_name')
ORDER BY column_name;
