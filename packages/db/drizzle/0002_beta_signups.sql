CREATE TABLE IF NOT EXISTS "beta_signups" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "email" text NOT NULL,
  "primary_bank" text NOT NULL,
  "broker" text NOT NULL,
  "reason" text NOT NULL,
  "ticket_id" text NOT NULL,
  "status" text DEFAULT 'pending' NOT NULL,
  "source" text DEFAULT 'beta_page' NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "beta_signups_email_unique" UNIQUE("email"),
  CONSTRAINT "beta_signups_ticket_id_unique" UNIQUE("ticket_id")
);
