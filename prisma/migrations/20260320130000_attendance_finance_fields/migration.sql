ALTER TABLE "attendances"
  ADD COLUMN "launch_to_finance" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "finance_amount" DECIMAL(12,2),
  ADD COLUMN "finance_payment_method" TEXT,
  ADD COLUMN "finance_account" TEXT,
  ADD COLUMN "finance_paid" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "finance_paid_at" TIMESTAMP;
