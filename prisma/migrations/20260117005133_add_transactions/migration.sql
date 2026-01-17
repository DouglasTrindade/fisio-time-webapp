-- Transactions schema
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'TransactionCategory') THEN
    CREATE TYPE "TransactionCategory" AS ENUM ('attendance', 'deposit');
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'TransactionStatus') THEN
    CREATE TYPE "TransactionStatus" AS ENUM ('pending', 'paid');
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'TransactionSource') THEN
    CREATE TYPE "TransactionSource" AS ENUM ('attendance', 'manual');
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'PaymentMethod') THEN
    CREATE TYPE "PaymentMethod" AS ENUM ('pix', 'bank_slip', 'credit_card');
  END IF;
END
$$;

-- CreateTable
CREATE TABLE "transactions" (
    "id" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "account" TEXT,
    "category" "TransactionCategory" NOT NULL,
    "payment_method" "PaymentMethod",
    "status" "TransactionStatus" NOT NULL DEFAULT 'pending',
    "source" "TransactionSource" NOT NULL,
    "reference_id" TEXT,
    "attendance_type" "AttendanceType",
    "due_date" TIMESTAMP(3),
    "competence_date" TIMESTAMP(3),
    "paid_at" TIMESTAMP(3),
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "transactions_pkey" PRIMARY KEY ("id")
);
