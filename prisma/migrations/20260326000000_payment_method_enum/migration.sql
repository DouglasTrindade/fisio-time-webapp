-- Create enum and migrate finance_payment_method column
CREATE TYPE "PaymentMethod" AS ENUM ('pix', 'bank_slip', 'credit_card');

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
