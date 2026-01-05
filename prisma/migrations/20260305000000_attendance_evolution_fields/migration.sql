-- AlterTable
ALTER TABLE "Attendance"
ADD COLUMN "cidCode" TEXT,
ADD COLUMN "cidDescription" TEXT,
ADD COLUMN "evolutionNotes" TEXT,
ADD COLUMN "attachments" JSONB;
