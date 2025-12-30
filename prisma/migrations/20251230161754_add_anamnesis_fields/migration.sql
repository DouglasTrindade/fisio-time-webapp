-- AlterTable
ALTER TABLE "PatientHistory" ADD COLUMN     "assessmentDiseaseHistory" TEXT,
ADD COLUMN     "assessmentFamilyHistory" TEXT,
ADD COLUMN     "assessmentMainComplaint" TEXT,
ADD COLUMN     "assessmentMedicalHistory" TEXT,
ADD COLUMN     "assessmentObservations" TEXT;
