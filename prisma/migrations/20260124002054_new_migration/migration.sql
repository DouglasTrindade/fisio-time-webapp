/*
  Warnings:

  - The values [PIX,BANK_SLIP,CREDIT_CARD] on the enum `PaymentMethod` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "PaymentMethod_new" AS ENUM ('pix', 'bank_slip', 'credit_card');

DO $$
DECLARE
  attendance_table text := CASE
    WHEN to_regclass('public.attendances') IS NOT NULL THEN 'attendances'
    WHEN to_regclass('public."Attendance"') IS NOT NULL THEN 'Attendance'
    ELSE NULL
  END;
  column_exists boolean;
BEGIN
  IF attendance_table IS NULL THEN
    RETURN;
  END IF;

  SELECT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = attendance_table
      AND column_name = 'finance_payment_method'
  ) INTO column_exists;

  IF column_exists THEN
    EXECUTE format(
      'ALTER TABLE public.%I ALTER COLUMN "finance_payment_method" TYPE "PaymentMethod_new" USING ("finance_payment_method"::text::"PaymentMethod_new")',
      attendance_table
    );
  END IF;
END $$;

ALTER TABLE "transactions" ALTER COLUMN "payment_method" TYPE "PaymentMethod_new" USING ("payment_method"::text::"PaymentMethod_new");
ALTER TYPE "PaymentMethod" RENAME TO "PaymentMethod_old";
ALTER TYPE "PaymentMethod_new" RENAME TO "PaymentMethod";
DROP TYPE "public"."PaymentMethod_old";
COMMIT;
