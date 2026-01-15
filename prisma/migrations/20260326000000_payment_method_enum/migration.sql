CREATE TYPE "PaymentMethod" AS ENUM ('pix', 'bank_slip', 'credit_card');

-- Ensure column name is consistent even on older databases
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'attendances' AND column_name = 'financePaymentMethod'
  ) THEN
    ALTER TABLE "attendances" RENAME COLUMN "financePaymentMethod" TO "finance_payment_method";
  ELSIF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'Attendance' AND column_name = 'financePaymentMethod'
  ) THEN
    ALTER TABLE "Attendance" RENAME COLUMN "financePaymentMethod" TO "finance_payment_method";
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'attendances' AND column_name = 'finance_payment_method'
  ) THEN
    ALTER TABLE "attendances"
      ALTER COLUMN "finance_payment_method"
      TYPE "PaymentMethod" USING (
        CASE
          WHEN "finance_payment_method" IS NULL THEN NULL
          WHEN "finance_payment_method" IN ('pix','PIX') THEN 'pix'::"PaymentMethod"
          WHEN "finance_payment_method" IN ('bank_slip','BANK_SLIP') THEN 'bank_slip'::"PaymentMethod"
          WHEN "finance_payment_method" IN ('credit_card','CREDIT_CARD') THEN 'credit_card'::"PaymentMethod"
          ELSE 'pix'::"PaymentMethod"
        END
      );
  ELSIF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'Attendance' AND column_name = 'finance_payment_method'
  ) THEN
    ALTER TABLE "Attendance"
      ALTER COLUMN "finance_payment_method"
      TYPE "PaymentMethod" USING (
        CASE
          WHEN "finance_payment_method" IS NULL THEN NULL
          WHEN "finance_payment_method" IN ('pix','PIX') THEN 'pix'::"PaymentMethod"
          WHEN "finance_payment_method" IN ('bank_slip','BANK_SLIP') THEN 'bank_slip'::"PaymentMethod"
          WHEN "finance_payment_method" IN ('credit_card','CREDIT_CARD') THEN 'credit_card'::"PaymentMethod"
          ELSE 'pix'::"PaymentMethod"
        END
      );
  END IF;
END $$;
