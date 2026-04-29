CREATE TABLE IF NOT EXISTS "transaction_matches" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" uuid NOT NULL,
  "manual_transaction_id" uuid NOT NULL,
  "imported_transaction_id" uuid NOT NULL,
  "match_status" text DEFAULT 'suggested' NOT NULL,
  "match_confidence" integer NOT NULL,
  "match_reason" text NOT NULL,
  "created_at" timestamptz DEFAULT now() NOT NULL,
  "updated_at" timestamptz DEFAULT now() NOT NULL,
  CONSTRAINT "transaction_matches_match_status_check"
    CHECK ("match_status" IN ('suggested', 'confirmed', 'rejected')),
  CONSTRAINT "transaction_matches_manual_imported_unique"
    UNIQUE ("manual_transaction_id", "imported_transaction_id"),
  CONSTRAINT "transaction_matches_user_id_users_id_fk"
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE cascade,
  CONSTRAINT "transaction_matches_manual_transaction_id_transactions_id_fk"
    FOREIGN KEY ("manual_transaction_id") REFERENCES "transactions"("id") ON DELETE cascade,
  CONSTRAINT "transaction_matches_imported_transaction_id_transactions_id_fk"
    FOREIGN KEY ("imported_transaction_id") REFERENCES "transactions"("id") ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_transaction_matches_user_id"
  ON "transaction_matches" ("user_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_transaction_matches_match_status"
  ON "transaction_matches" ("match_status");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_transaction_matches_manual_transaction_id"
  ON "transaction_matches" ("manual_transaction_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_transaction_matches_imported_transaction_id"
  ON "transaction_matches" ("imported_transaction_id");
--> statement-breakpoint
ALTER TABLE "transaction_matches" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
DROP POLICY IF EXISTS "transaction_matches_belong_to_user" ON "transaction_matches";
CREATE POLICY "transaction_matches_belong_to_user"
ON "transaction_matches"
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
