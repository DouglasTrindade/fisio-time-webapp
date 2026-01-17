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
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'AttendanceType') THEN
    ALTER TYPE "AttendanceType" RENAME TO "AttendanceType_old";
  END IF;
END
$$;

DO $$
BEGIN
  CREATE TYPE "AttendanceType" AS ENUM ('evaluation', 'evolution');
EXCEPTION
  WHEN duplicate_object THEN null;
END
$$;

ALTER TABLE "Attendance" ALTER COLUMN "type" DROP DEFAULT;
ALTER TABLE "Attendance" ALTER COLUMN "type" TYPE "AttendanceType" USING ("type"::text::"AttendanceType");
ALTER TABLE "Attendance" ALTER COLUMN "type" SET DEFAULT 'evaluation';

DO $$ BEGIN
  DROP TYPE IF EXISTS "AttendanceType_old";
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;

-- AlterTable
ALTER TABLE "Attendance" ALTER COLUMN "type" SET DEFAULT 'evaluation';

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
