-- AlterTable
ALTER TABLE "accounts" RENAME CONSTRAINT "Account_pkey" TO "accounts_pkey";

-- AlterTable
ALTER TABLE "appointments" RENAME CONSTRAINT "Appointment_pkey" TO "appointments_pkey";

-- AlterTable
ALTER TABLE "attendances" RENAME CONSTRAINT "Attendance_pkey" TO "attendances_pkey";

-- AlterTable
ALTER TABLE "patients" RENAME CONSTRAINT "Patient_pkey" TO "patients_pkey";

-- AlterTable
ALTER TABLE "treatment_plans" RENAME CONSTRAINT "TreatmentPlan_pkey" TO "treatment_plans_pkey";

-- AlterTable
ALTER TABLE "users" RENAME CONSTRAINT "User_pkey" TO "users_pkey";

-- AlterTable
ALTER TABLE "verification_tokens" RENAME CONSTRAINT "VerificationToken_pkey" TO "verification_tokens_pkey";

-- RenameForeignKey
ALTER TABLE "accounts" RENAME CONSTRAINT "Account_userId_fkey" TO "accounts_user_id_fkey";

-- RenameForeignKey
ALTER TABLE "appointments" RENAME CONSTRAINT "Appointment_patientId_fkey" TO "appointments_patient_id_fkey";

-- RenameForeignKey
ALTER TABLE "appointments" RENAME CONSTRAINT "Appointment_professionalId_fkey" TO "appointments_professional_id_fkey";

-- RenameForeignKey
ALTER TABLE "attendances" RENAME CONSTRAINT "Attendance_patientId_fkey" TO "attendances_patient_id_fkey";

-- RenameForeignKey
ALTER TABLE "attendances" RENAME CONSTRAINT "Attendance_professionalId_fkey" TO "attendances_professional_id_fkey";

-- RenameForeignKey
ALTER TABLE "sessions" RENAME CONSTRAINT "Session_userId_fkey" TO "sessions_user_id_fkey";

-- RenameForeignKey
ALTER TABLE "treatment_plans" RENAME CONSTRAINT "TreatmentPlan_attendanceId_fkey" TO "treatment_plans_attendance_id_fkey";

-- RenameForeignKey
ALTER TABLE "treatment_plans" RENAME CONSTRAINT "TreatmentPlan_patientId_fkey" TO "treatment_plans_patient_id_fkey";

-- RenameIndex
ALTER INDEX "Session_sessionToken_key" RENAME TO "sessions_session_token_key";

-- RenameIndex
ALTER INDEX "TreatmentPlan_attendanceId_key" RENAME TO "treatment_plans_attendance_id_key";

-- RenameIndex
ALTER INDEX "User_email_key" RENAME TO "users_email_key";
