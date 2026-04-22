ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "accounts" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "categories" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "import_batches" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "transactions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "import_rows" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "transfer_links" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "reimbursement_links" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "rules" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "recurring_series" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "budget_periods" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "sinking_funds" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "safe_to_spend_snapshots" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "audit_logs" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
DROP POLICY IF EXISTS "users_manage_own_profile" ON "users";
CREATE POLICY "users_manage_own_profile"
ON "users"
FOR ALL
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);
--> statement-breakpoint
DROP POLICY IF EXISTS "accounts_belong_to_user" ON "accounts";
CREATE POLICY "accounts_belong_to_user"
ON "accounts"
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
--> statement-breakpoint
DROP POLICY IF EXISTS "categories_belong_to_user_or_system" ON "categories";
CREATE POLICY "categories_belong_to_user_or_system"
ON "categories"
FOR ALL
USING (user_id IS NULL OR auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
--> statement-breakpoint
DROP POLICY IF EXISTS "import_batches_belong_to_user" ON "import_batches";
CREATE POLICY "import_batches_belong_to_user"
ON "import_batches"
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
--> statement-breakpoint
DROP POLICY IF EXISTS "transactions_belong_to_user" ON "transactions";
CREATE POLICY "transactions_belong_to_user"
ON "transactions"
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
--> statement-breakpoint
DROP POLICY IF EXISTS "import_rows_belong_to_user" ON "import_rows";
CREATE POLICY "import_rows_belong_to_user"
ON "import_rows"
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
--> statement-breakpoint
DROP POLICY IF EXISTS "transfer_links_belong_to_user" ON "transfer_links";
CREATE POLICY "transfer_links_belong_to_user"
ON "transfer_links"
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
--> statement-breakpoint
DROP POLICY IF EXISTS "reimbursement_links_belong_to_user" ON "reimbursement_links";
CREATE POLICY "reimbursement_links_belong_to_user"
ON "reimbursement_links"
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
--> statement-breakpoint
DROP POLICY IF EXISTS "rules_belong_to_user" ON "rules";
CREATE POLICY "rules_belong_to_user"
ON "rules"
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
--> statement-breakpoint
DROP POLICY IF EXISTS "recurring_series_belong_to_user" ON "recurring_series";
CREATE POLICY "recurring_series_belong_to_user"
ON "recurring_series"
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
--> statement-breakpoint
DROP POLICY IF EXISTS "budget_periods_belong_to_user" ON "budget_periods";
CREATE POLICY "budget_periods_belong_to_user"
ON "budget_periods"
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
--> statement-breakpoint
DROP POLICY IF EXISTS "sinking_funds_belong_to_user" ON "sinking_funds";
CREATE POLICY "sinking_funds_belong_to_user"
ON "sinking_funds"
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
--> statement-breakpoint
DROP POLICY IF EXISTS "safe_to_spend_snapshots_belong_to_user" ON "safe_to_spend_snapshots";
CREATE POLICY "safe_to_spend_snapshots_belong_to_user"
ON "safe_to_spend_snapshots"
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
--> statement-breakpoint
DROP POLICY IF EXISTS "audit_logs_belong_to_user" ON "audit_logs";
CREATE POLICY "audit_logs_belong_to_user"
ON "audit_logs"
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

