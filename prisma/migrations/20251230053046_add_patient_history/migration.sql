-- CreateEnum
CREATE TYPE "HistoryKind" AS ENUM ('EVOLUTION', 'ASSESSMENT');

-- CreateTable
CREATE TABLE "PatientHistory" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "kind" "HistoryKind" NOT NULL DEFAULT 'EVOLUTION',
    "cidCode" TEXT,
    "cidDescription" TEXT,
    "content" TEXT NOT NULL,
    "attachmentUrl" TEXT,
    "attachmentPath" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PatientHistory_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "PatientHistory" ADD CONSTRAINT "PatientHistory_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE CASCADE ON UPDATE CASCADE;
