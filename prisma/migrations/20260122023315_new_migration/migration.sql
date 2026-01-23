/*
  Warnings:

  - The values [EVALUATION,EVOLUTION] on the enum `AttendanceType` will be removed. If these variants are still used in the database, this will fail.
  - The values [PIX,BANK_SLIP,CREDIT_CARD] on the enum `PaymentMethod` will be removed. If these variants are still used in the database, this will fail.

*/
-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'PROFESSIONAL', 'ASSISTANT');

-- AlterTable
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

  EXECUTE format('ALTER TABLE public.%I ADD COLUMN "role" "Role" NOT NULL DEFAULT ''PROFESSIONAL''', user_table);
END $$;

-- CreateTable
CREATE TABLE "user_invites" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'PROFESSIONAL',
    "created_by_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "accepted_at" TIMESTAMP(3),
    "invited_user_id" TEXT,

    CONSTRAINT "user_invites_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_invites_token_key" ON "user_invites"("token");

-- CreateIndex
CREATE INDEX "user_invites_email_idx" ON "user_invites"("email");

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
  'ALTER TABLE public."user_invites" ADD CONSTRAINT user_invites_created_by_id_fkey FOREIGN KEY ("created_by_id") REFERENCES public.%I("id") ON DELETE RESTRICT ON UPDATE CASCADE',
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
  'ALTER TABLE public."user_invites" ADD CONSTRAINT user_invites_invited_user_id_fkey FOREIGN KEY ("invited_user_id") REFERENCES public.%I("id") ON DELETE SET NULL ON UPDATE CASCADE',
  user_table
);
END $$;
