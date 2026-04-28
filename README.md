# Dart Finance

Dart Finance is a pnpm/Turborepo monorepo for the Dart Finance web app and shared packages.

## Local Validation

```bash
pnpm tsc --noEmit
pnpm --dir apps/web test
pnpm test
pnpm build
```

## Supabase Merchant Field Fix

The production Supabase `public.transactions` table must include the merchant columns used by the Trading 212 import flow:

```sql
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS merchant_category text;
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS normalized_merchant_name text;
```

After applying the migration, reset the test user's imported app data and perform a fresh Trading 212 import. Old imports can keep `merchant_name`, `merchant_category`, and `normalized_merchant_name` as `null`; no data is deleted or backfilled automatically.

Verify fresh Card debit rows with:

```sql
SELECT
  id,
  raw_description,
  merchant_name,
  merchant_category,
  normalized_merchant_name,
  source,
  occurred_at
FROM public.transactions
WHERE user_id = '<your-test-user-id>'
  AND source = 't212_csv'
  AND raw_description = 'Card debit'
ORDER BY occurred_at DESC
LIMIT 20;
```

## Reset Local Test User Data

Use `docs/sql/reset_test_user_app_data.sql` to reset one local/dev test user's app data. Replace `PASTE_USER_UUID_HERE` with the test user's UUID before running it.

The script is local/dev only, keeps `auth.users`, and includes verification queries.
