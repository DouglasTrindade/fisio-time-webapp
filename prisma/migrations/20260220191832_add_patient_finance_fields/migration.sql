/*
  Warnings:

  - The values [PIX,BANK_SLIP,CREDIT_CARD] on the enum `PaymentMethod` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
-- Normalize existing enum values before type change (defensive for table/column names)
DO $$
DECLARE
  attendance_table text := CASE
    WHEN to_regclass('public.attendances') IS NOT NULL THEN 'attendances'
    WHEN to_regclass('public."Attendance"') IS NOT NULL THEN 'Attendance'
    ELSE NULL
  END;
  attendance_column_exists boolean := false;
BEGIN
  IF attendance_table IS NOT NULL THEN
    SELECT EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = attendance_table
        AND column_name = 'finance_payment_method'
    ) INTO attendance_column_exists;

    IF attendance_column_exists THEN
      EXECUTE format(
        'UPDATE public.%I SET "finance_payment_method" = ''pix'' WHERE "finance_payment_method"::text = ''PIX''',
        attendance_table
      );
      EXECUTE format(
        'UPDATE public.%I SET "finance_payment_method" = ''bank_slip'' WHERE "finance_payment_method"::text = ''BANK_SLIP''',
        attendance_table
      );
      EXECUTE format(
        'UPDATE public.%I SET "finance_payment_method" = ''credit_card'' WHERE "finance_payment_method"::text = ''CREDIT_CARD''',
        attendance_table
      );
    END IF;
  END IF;
END $$;

DO $$
BEGIN
  IF to_regclass('public.transactions') IS NOT NULL THEN
    UPDATE "transactions"
    SET "payment_method" = 'pix'
    WHERE "payment_method"::text = 'PIX';
    UPDATE "transactions"
    SET "payment_method" = 'bank_slip'
    WHERE "payment_method"::text = 'BANK_SLIP';
    UPDATE "transactions"
    SET "payment_method" = 'credit_card'
    WHERE "payment_method"::text = 'CREDIT_CARD';
  END IF;
END $$;

CREATE TYPE "PaymentMethod_new" AS ENUM ('pix', 'bank_slip', 'credit_card');

DO $$
DECLARE
  attendance_table text := CASE
    WHEN to_regclass('public.attendances') IS NOT NULL THEN 'attendances'
    WHEN to_regclass('public."Attendance"') IS NOT NULL THEN 'Attendance'
    ELSE NULL
  END;
  attendance_column_exists boolean := false;
BEGIN
  IF attendance_table IS NOT NULL THEN
    SELECT EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = attendance_table
        AND column_name = 'finance_payment_method'
    ) INTO attendance_column_exists;

    IF attendance_column_exists THEN
      EXECUTE format(
        'ALTER TABLE public.%I ALTER COLUMN "finance_payment_method" TYPE "PaymentMethod_new" USING ("finance_payment_method"::text::"PaymentMethod_new")',
        attendance_table
      );
    END IF;
  END IF;
END $$;

DO $$
BEGIN
  IF to_regclass('public.transactions') IS NOT NULL THEN
    ALTER TABLE "transactions"
      ALTER COLUMN "payment_method" TYPE "PaymentMethod_new" USING ("payment_method"::text::"PaymentMethod_new");
  END IF;
END $$;

ALTER TYPE "PaymentMethod" RENAME TO "PaymentMethod_old";
ALTER TYPE "PaymentMethod_new" RENAME TO "PaymentMethod";
DROP TYPE "public"."PaymentMethod_old";
COMMIT;

-- AlterTable
DO $$
DECLARE
  patient_table text := CASE
    WHEN to_regclass('public.patients') IS NOT NULL THEN 'patients'
    WHEN to_regclass('public."Patient"') IS NOT NULL THEN 'Patient'
    ELSE NULL
  END;
BEGIN
  IF patient_table IS NULL THEN
    RAISE EXCEPTION 'Tabela de pacientes não encontrada';
  END IF;

  EXECUTE format(
    'ALTER TABLE public.%I ADD COLUMN IF NOT EXISTS "financial_plan" TEXT',
    patient_table
  );
  EXECUTE format(
    'ALTER TABLE public.%I ADD COLUMN IF NOT EXISTS "insurance_card_number" TEXT',
    patient_table
  );
  EXECUTE format(
    'ALTER TABLE public.%I ADD COLUMN IF NOT EXISTS "insurance_issued_at" TIMESTAMP(3)',
    patient_table
  );
  EXECUTE format(
    'ALTER TABLE public.%I ADD COLUMN IF NOT EXISTS "insurance_name" TEXT',
    patient_table
  );
  EXECUTE format(
    'ALTER TABLE public.%I ADD COLUMN IF NOT EXISTS "insurance_payment_days" INTEGER',
    patient_table
  );
  EXECUTE format(
    'ALTER TABLE public.%I ADD COLUMN IF NOT EXISTS "insurance_repasse_type" TEXT',
    patient_table
  );
  EXECUTE format(
    'ALTER TABLE public.%I ADD COLUMN IF NOT EXISTS "insurance_repasse_value" DECIMAL(65,30)',
    patient_table
  );
END $$;
