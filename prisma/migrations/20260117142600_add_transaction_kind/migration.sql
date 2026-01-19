-- Add TransactionKind enum if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'TransactionKind') THEN
    CREATE TYPE "TransactionKind" AS ENUM ('income', 'expense');
  END IF;
END
$$;

-- Add new columns for kind and expense_category
ALTER TABLE "transactions"
  ADD COLUMN IF NOT EXISTS "expense_category" TEXT,
  ADD COLUMN IF NOT EXISTS "kind" "TransactionKind" NOT NULL DEFAULT 'income';

-- Ensure category can be null (expenses don't use the income categories)
ALTER TABLE "transactions"
  ALTER COLUMN "category" DROP NOT NULL;

-- Backfill kind for existing rows
UPDATE "transactions"
SET "kind" = 'income'
WHERE "kind" IS NULL;
