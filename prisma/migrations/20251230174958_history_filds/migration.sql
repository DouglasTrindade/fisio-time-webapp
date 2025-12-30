/*
  Warnings:

  - The values [EVOLUTION,ASSESSMENT] on the enum `HistoryKind` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "HistoryKind_new" AS ENUM ('evolution', 'assessment');
ALTER TABLE "public"."PatientHistory" ALTER COLUMN "kind" DROP DEFAULT;
ALTER TABLE "PatientHistory" ALTER COLUMN "kind" TYPE "HistoryKind_new" USING ("kind"::text::"HistoryKind_new");
ALTER TYPE "HistoryKind" RENAME TO "HistoryKind_old";
ALTER TYPE "HistoryKind_new" RENAME TO "HistoryKind";
DROP TYPE "public"."HistoryKind_old";
ALTER TABLE "PatientHistory" ALTER COLUMN "kind" SET DEFAULT 'evolution';
COMMIT;

-- AlterTable
ALTER TABLE "PatientHistory" ALTER COLUMN "kind" SET DEFAULT 'evolution';
