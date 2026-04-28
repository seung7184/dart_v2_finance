-- Dart Finance local/dev test-user reset.
--
-- LOCAL / DEV ONLY. NEVER RUN AGAINST PRODUCTION.
-- This script deletes app-owned data for one test user and keeps auth.users intact.
--
-- Usage:
-- 1. Replace every PASTE_USER_UUID_HERE value with the public.users.id for your test user.
-- 2. Run against a local/dev Supabase database only.
-- 3. Sign in and complete onboarding again before importing fresh CSV data.

BEGIN;

-- App rows that reference transactions must be removed before transactions.
DELETE FROM public.transfer_links
WHERE user_id = 'PASTE_USER_UUID_HERE'::uuid;

DELETE FROM public.reimbursement_links
WHERE user_id = 'PASTE_USER_UUID_HERE'::uuid;

DELETE FROM public.import_rows
WHERE user_id = 'PASTE_USER_UUID_HERE'::uuid;

DELETE FROM public.transactions
WHERE user_id = 'PASTE_USER_UUID_HERE'::uuid;

DELETE FROM public.import_batches
WHERE user_id = 'PASTE_USER_UUID_HERE'::uuid;

-- User-scoped planning, rules, and cached/derived app data.
DELETE FROM public.safe_to_spend_snapshots
WHERE user_id = 'PASTE_USER_UUID_HERE'::uuid;

DELETE FROM public.recurring_series
WHERE user_id = 'PASTE_USER_UUID_HERE'::uuid;

DELETE FROM public.sinking_funds
WHERE user_id = 'PASTE_USER_UUID_HERE'::uuid;

DELETE FROM public.budget_periods
WHERE user_id = 'PASTE_USER_UUID_HERE'::uuid;

DELETE FROM public.rules
WHERE user_id = 'PASTE_USER_UUID_HERE'::uuid;

DELETE FROM public.audit_logs
WHERE user_id = 'PASTE_USER_UUID_HERE'::uuid;

-- Delete only user-owned categories. System categories have user_id = null and are kept.
DELETE FROM public.categories
WHERE user_id = 'PASTE_USER_UUID_HERE'::uuid;

-- Accounts are recreated by onboarding/import setup.
DELETE FROM public.accounts
WHERE user_id = 'PASTE_USER_UUID_HERE'::uuid;

-- Keep public.users and auth.users. Reset only app onboarding/profile fields.
UPDATE public.users
SET payday_day = NULL,
    payday_type = NULL,
    expected_monthly_income = NULL,
    minimum_cash_buffer = 0,
    planned_investing_protected = TRUE,
    locale = COALESCE(locale, 'en'),
    currency = COALESCE(currency, 'EUR'),
    onboarding_completed = FALSE,
    updated_at = now()
WHERE id = 'PASTE_USER_UUID_HERE'::uuid;

COMMIT;

-- Verification queries.
-- All app-data counts below should be 0 after the reset.
SELECT 'accounts' AS table_name, COUNT(*) AS row_count
FROM public.accounts
WHERE user_id = 'PASTE_USER_UUID_HERE'::uuid
UNION ALL
SELECT 'audit_logs', COUNT(*)
FROM public.audit_logs
WHERE user_id = 'PASTE_USER_UUID_HERE'::uuid
UNION ALL
SELECT 'budget_periods', COUNT(*)
FROM public.budget_periods
WHERE user_id = 'PASTE_USER_UUID_HERE'::uuid
UNION ALL
SELECT 'categories', COUNT(*)
FROM public.categories
WHERE user_id = 'PASTE_USER_UUID_HERE'::uuid
UNION ALL
SELECT 'import_batches', COUNT(*)
FROM public.import_batches
WHERE user_id = 'PASTE_USER_UUID_HERE'::uuid
UNION ALL
SELECT 'import_rows', COUNT(*)
FROM public.import_rows
WHERE user_id = 'PASTE_USER_UUID_HERE'::uuid
UNION ALL
SELECT 'recurring_series', COUNT(*)
FROM public.recurring_series
WHERE user_id = 'PASTE_USER_UUID_HERE'::uuid
UNION ALL
SELECT 'reimbursement_links', COUNT(*)
FROM public.reimbursement_links
WHERE user_id = 'PASTE_USER_UUID_HERE'::uuid
UNION ALL
SELECT 'rules', COUNT(*)
FROM public.rules
WHERE user_id = 'PASTE_USER_UUID_HERE'::uuid
UNION ALL
SELECT 'safe_to_spend_snapshots', COUNT(*)
FROM public.safe_to_spend_snapshots
WHERE user_id = 'PASTE_USER_UUID_HERE'::uuid
UNION ALL
SELECT 'sinking_funds', COUNT(*)
FROM public.sinking_funds
WHERE user_id = 'PASTE_USER_UUID_HERE'::uuid
UNION ALL
SELECT 'transactions', COUNT(*)
FROM public.transactions
WHERE user_id = 'PASTE_USER_UUID_HERE'::uuid
UNION ALL
SELECT 'transfer_links', COUNT(*)
FROM public.transfer_links
WHERE user_id = 'PASTE_USER_UUID_HERE'::uuid
ORDER BY table_name;

-- The app user row should still exist and be ready for onboarding.
SELECT id,
       email,
       payday_day,
       payday_type,
       expected_monthly_income,
       minimum_cash_buffer,
       planned_investing_protected,
       onboarding_completed,
       updated_at
FROM public.users
WHERE id = 'PASTE_USER_UUID_HERE'::uuid;

-- auth.users is intentionally untouched. This should still return the auth identity.
SELECT id, email, created_at, last_sign_in_at
FROM auth.users
WHERE id = 'PASTE_USER_UUID_HERE'::uuid;

-- System categories should still be present because user_id is null.
SELECT COUNT(*) AS system_category_count
FROM public.categories
WHERE user_id IS NULL;
