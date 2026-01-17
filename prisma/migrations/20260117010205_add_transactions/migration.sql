/*
  Warnings:

  - The values [EVALUATION,EVOLUTION] on the enum `AttendanceType` will be removed. If these variants are still used in the database, this will fail.
  - The values [PIX,BANK_SLIP,CREDIT_CARD] on the enum `PaymentMethod` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "AttendanceType_new" AS ENUM ('evaluation', 'evolution');
ALTER TABLE "public"."attendances" ALTER COLUMN "type" DROP DEFAULT;
ALTER TABLE "attendances" ALTER COLUMN "type" TYPE "AttendanceType_new" USING ("type"::text::"AttendanceType_new");
ALTER TABLE "transactions" ALTER COLUMN "attendance_type" TYPE "AttendanceType_new" USING ("attendance_type"::text::"AttendanceType_new");
ALTER TYPE "AttendanceType" RENAME TO "AttendanceType_old";
ALTER TYPE "AttendanceType_new" RENAME TO "AttendanceType";
DROP TYPE "public"."AttendanceType_old";
ALTER TABLE "attendances" ALTER COLUMN "type" SET DEFAULT 'evaluation';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "PaymentMethod_new" AS ENUM ('pix', 'bank_slip', 'credit_card');
ALTER TABLE "attendances" ALTER COLUMN "finance_payment_method" TYPE "PaymentMethod_new" USING ("finance_payment_method"::text::"PaymentMethod_new");
ALTER TABLE "transactions" ALTER COLUMN "payment_method" TYPE "PaymentMethod_new" USING ("payment_method"::text::"PaymentMethod_new");
ALTER TYPE "PaymentMethod" RENAME TO "PaymentMethod_old";
ALTER TYPE "PaymentMethod_new" RENAME TO "PaymentMethod";
DROP TYPE "public"."PaymentMethod_old";
COMMIT;

-- AlterTable
ALTER TABLE "attendances" ALTER COLUMN "type" SET DEFAULT 'evaluation';

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_recipient_id_fkey" FOREIGN KEY ("recipient_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
