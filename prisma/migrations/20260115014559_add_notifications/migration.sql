/*
  Warnings:

  - The values [EVALUATION,EVOLUTION] on the enum `AttendanceType` will be removed. If these variants are still used in the database, this will fail.
  - The values [PIX,BANK_SLIP,CREDIT_CARD] on the enum `PaymentMethod` will be removed. If these variants are still used in the database, this will fail.

*/
-- CreateEnum
CREATE TYPE "NotificationCategory" AS ENUM ('system', 'finance', 'attendance', 'message');

-- CreateEnum
CREATE TYPE "NotificationStatus" AS ENUM ('unread', 'read');

-- CreateEnum
CREATE TYPE "NotificationPriority" AS ENUM ('low', 'normal', 'high');

-- CreateEnum
CREATE TYPE "NotificationSendMode" AS ENUM ('now', 'scheduled');

-- AlterEnum
BEGIN;
CREATE TYPE "AttendanceType_new" AS ENUM ('evaluation', 'evolution');
ALTER TABLE "public"."attendances" ALTER COLUMN "type" DROP DEFAULT;
ALTER TABLE "attendances" ALTER COLUMN "type" TYPE "AttendanceType_new" USING ("type"::text::"AttendanceType_new");
ALTER TYPE "AttendanceType" RENAME TO "AttendanceType_old";
ALTER TYPE "AttendanceType_new" RENAME TO "AttendanceType";
DROP TYPE "public"."AttendanceType_old";
ALTER TABLE "attendances" ALTER COLUMN "type" SET DEFAULT 'evaluation';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "PaymentMethod_new" AS ENUM ('pix', 'bank_slip', 'credit_card');
ALTER TABLE "attendances" ALTER COLUMN "finance_payment_method" TYPE "PaymentMethod_new" USING ("finance_payment_method"::text::"PaymentMethod_new");
ALTER TYPE "PaymentMethod" RENAME TO "PaymentMethod_old";
ALTER TYPE "PaymentMethod_new" RENAME TO "PaymentMethod";
DROP TYPE "public"."PaymentMethod_old";
COMMIT;

-- AlterTable
ALTER TABLE "attendances" ALTER COLUMN "type" SET DEFAULT 'evaluation';

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "category" "NotificationCategory" NOT NULL DEFAULT 'message',
    "status" "NotificationStatus" NOT NULL DEFAULT 'unread',
    "priority" "NotificationPriority" NOT NULL DEFAULT 'normal',
    "channel" TEXT,
    "highlight" BOOLEAN NOT NULL DEFAULT false,
    "include_email" BOOLEAN NOT NULL DEFAULT false,
    "send_mode" "NotificationSendMode" NOT NULL DEFAULT 'now',
    "scheduled_for" TIMESTAMP(3),
    "sent_at" TIMESTAMP(3),
    "read_at" TIMESTAMP(3),
    "recipient_id" TEXT NOT NULL,
    "sender_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_recipient_id_fkey" FOREIGN KEY ("recipient_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
