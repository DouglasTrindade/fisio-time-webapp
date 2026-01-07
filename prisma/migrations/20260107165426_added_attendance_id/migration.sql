/*
  Warnings:

  - A unique constraint covering the columns `[attendanceId]` on the table `TreatmentPlan` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `attendanceId` to the `TreatmentPlan` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "TreatmentPlan" ADD COLUMN     "attendanceId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "TreatmentPlan_attendanceId_key" ON "TreatmentPlan"("attendanceId");

-- AddForeignKey
ALTER TABLE "TreatmentPlan" ADD CONSTRAINT "TreatmentPlan_attendanceId_fkey" FOREIGN KEY ("attendanceId") REFERENCES "Attendance"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
