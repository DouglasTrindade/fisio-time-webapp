/*
  Warnings:

  - The values [EVALUATION,EVOLUTION] on the enum `AttendanceType` will be removed. If these variants are still used in the database, this will fail.
  - The values [PIX,BANK_SLIP,CREDIT_CARD] on the enum `PaymentMethod` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "AttendanceType_new" AS ENUM ('evaluation', 'evolution');

DO $$
DECLARE
  attendance_table text := CASE
    WHEN to_regclass('public.attendances') IS NOT NULL THEN 'attendances'
    WHEN to_regclass('public."Attendance"') IS NOT NULL THEN 'Attendance'
    ELSE NULL
  END;
BEGIN
  IF attendance_table IS NULL THEN
    RAISE EXCEPTION 'Tabela de atendimentos não encontrada';
  END IF;

  EXECUTE format('ALTER TABLE public.%I ALTER COLUMN "type" DROP DEFAULT', attendance_table);
  EXECUTE format(
    'ALTER TABLE public.%I ALTER COLUMN "type" TYPE "AttendanceType_new" USING ("type"::text::"AttendanceType_new")',
    attendance_table
  );
  EXECUTE format(
    'ALTER TABLE public.%I ALTER COLUMN "type" SET DEFAULT ''evaluation''',
    attendance_table
  );
END $$;

ALTER TABLE "transactions"
  ALTER COLUMN "attendance_type" TYPE "AttendanceType_new" USING ("attendance_type"::text::"AttendanceType_new");

ALTER TYPE "AttendanceType" RENAME TO "AttendanceType_old";
ALTER TYPE "AttendanceType_new" RENAME TO "AttendanceType";
DROP TYPE "public"."AttendanceType_old";
COMMIT;

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
    RAISE EXCEPTION 'Tabela de atendimentos não encontrada';
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

ALTER TABLE "transactions"
  ALTER COLUMN "payment_method" TYPE "PaymentMethod_new" USING ("payment_method"::text::"PaymentMethod_new");
ALTER TYPE "PaymentMethod" RENAME TO "PaymentMethod_old";
ALTER TYPE "PaymentMethod_new" RENAME TO "PaymentMethod";
DROP TYPE "public"."PaymentMethod_old";
COMMIT;

-- AlterTable
DO $$
DECLARE
  attendance_table text := CASE
    WHEN to_regclass('public.attendances') IS NOT NULL THEN 'attendances'
    WHEN to_regclass('public."Attendance"') IS NOT NULL THEN 'Attendance'
    ELSE NULL
  END;
BEGIN
  IF attendance_table IS NULL THEN
    RAISE EXCEPTION 'Tabela de atendimentos não encontrada';
  END IF;

  EXECUTE format('ALTER TABLE public.%I ALTER COLUMN "type" SET DEFAULT ''evaluation''', attendance_table);
END $$;

-- AddForeignKey
DO $$
DECLARE
  user_table text := CASE
    WHEN to_regclass('public.users') IS NOT NULL THEN 'users'
    WHEN to_regclass('public."User"') IS NOT NULL THEN 'User'
    ELSE NULL
  END;
BEGIN
  IF user_table IS NULL THEN
    RAISE EXCEPTION 'Tabela de usuários não encontrada';
  END IF;

  EXECUTE format(
    'ALTER TABLE public.notifications ADD CONSTRAINT notifications_recipient_id_fkey FOREIGN KEY ("recipient_id") REFERENCES public.%I("id") ON DELETE RESTRICT ON UPDATE CASCADE',
    user_table
  );
END $$;

-- AddForeignKey
DO $$
DECLARE
  user_table text := CASE
    WHEN to_regclass('public.users') IS NOT NULL THEN 'users'
    WHEN to_regclass('public."User"') IS NOT NULL THEN 'User'
    ELSE NULL
  END;
BEGIN
  IF user_table IS NULL THEN
    RAISE EXCEPTION 'Tabela de usuários não encontrada';
  END IF;

  EXECUTE format(
    'ALTER TABLE public.notifications ADD CONSTRAINT notifications_sender_id_fkey FOREIGN KEY ("sender_id") REFERENCES public.%I("id") ON DELETE SET NULL ON UPDATE CASCADE',
    user_table
  );
END $$;
