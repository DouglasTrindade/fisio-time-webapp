-- CreateEnum
CREATE TYPE "AttendanceType" AS ENUM ('evaluation', 'evolution');

-- CreateTable
CREATE TABLE "Attendance" (
    "id" TEXT NOT NULL,
    "type" "AttendanceType" NOT NULL DEFAULT 'evaluation',
    "date" TIMESTAMP(3) NOT NULL,
    "patientId" TEXT NOT NULL,
    "professionalId" TEXT NOT NULL,
    "mainComplaint" TEXT,
    "currentIllnessHistory" TEXT,
    "pastMedicalHistory" TEXT,
    "familyHistory" TEXT,
    "observations" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Attendance_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Attendance" ADD CONSTRAINT "Attendance_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attendance" ADD CONSTRAINT "Attendance_professionalId_fkey" FOREIGN KEY ("professionalId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
