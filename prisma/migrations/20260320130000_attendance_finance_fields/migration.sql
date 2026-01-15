-- Add finance-related columns to attendances (idempotent for resets)
ALTER TABLE "attendances"
  ADD COLUMN IF NOT EXISTS "launch_to_finance" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "finance_amount" DECIMAL(65,30),
  ADD COLUMN IF NOT EXISTS "finance_payment_method" TEXT,
  ADD COLUMN IF NOT EXISTS "finance_account" TEXT,
  ADD COLUMN IF NOT EXISTS "finance_paid" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "finance_paid_at" TIMESTAMP(3);
