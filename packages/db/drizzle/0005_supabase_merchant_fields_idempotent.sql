ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS merchant_category text;--> statement-breakpoint
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS normalized_merchant_name text;
