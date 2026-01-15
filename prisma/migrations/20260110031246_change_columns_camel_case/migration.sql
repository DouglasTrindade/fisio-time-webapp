-- AlterTable
ALTER TABLE IF EXISTS "accounts" RENAME CONSTRAINT "Account_pkey" TO "accounts_pkey";
ALTER TABLE IF EXISTS "Account" RENAME CONSTRAINT "Account_pkey" TO "accounts_pkey";

-- AlterTable
ALTER TABLE IF EXISTS "appointments" RENAME CONSTRAINT "Appointment_pkey" TO "appointments_pkey";
ALTER TABLE IF EXISTS "Appointment" RENAME CONSTRAINT "Appointment_pkey" TO "appointments_pkey";

-- AlterTable
ALTER TABLE IF EXISTS "attendances" RENAME CONSTRAINT "Attendance_pkey" TO "attendances_pkey";
ALTER TABLE IF EXISTS "Attendance" RENAME CONSTRAINT "Attendance_pkey" TO "attendances_pkey";

-- AlterTable
ALTER TABLE IF EXISTS "patients" RENAME CONSTRAINT "Patient_pkey" TO "patients_pkey";
ALTER TABLE IF EXISTS "Patient" RENAME CONSTRAINT "Patient_pkey" TO "patients_pkey";

-- AlterTable
ALTER TABLE IF EXISTS "treatment_plans" RENAME CONSTRAINT "TreatmentPlan_pkey" TO "treatment_plans_pkey";
ALTER TABLE IF EXISTS "TreatmentPlan" RENAME CONSTRAINT "TreatmentPlan_pkey" TO "treatment_plans_pkey";

-- AlterTable
ALTER TABLE IF EXISTS "users" RENAME CONSTRAINT "User_pkey" TO "users_pkey";
ALTER TABLE IF EXISTS "User" RENAME CONSTRAINT "User_pkey" TO "users_pkey";

-- AlterTable
ALTER TABLE IF EXISTS "verification_tokens" RENAME CONSTRAINT "VerificationToken_pkey" TO "verification_tokens_pkey";
ALTER TABLE IF EXISTS "VerificationToken" RENAME CONSTRAINT "VerificationToken_pkey" TO "verification_tokens_pkey";

-- RenameForeignKey
ALTER TABLE IF EXISTS "accounts" RENAME CONSTRAINT "Account_userId_fkey" TO "accounts_user_id_fkey";
ALTER TABLE IF EXISTS "Account" RENAME CONSTRAINT "Account_userId_fkey" TO "accounts_user_id_fkey";

-- RenameForeignKey
ALTER TABLE IF EXISTS "appointments" RENAME CONSTRAINT "Appointment_patientId_fkey" TO "appointments_patient_id_fkey";
ALTER TABLE IF EXISTS "Appointment" RENAME CONSTRAINT "Appointment_patientId_fkey" TO "appointments_patient_id_fkey";

-- RenameForeignKey
ALTER TABLE IF EXISTS "appointments" RENAME CONSTRAINT "Appointment_professionalId_fkey" TO "appointments_professional_id_fkey";
ALTER TABLE IF EXISTS "Appointment" RENAME CONSTRAINT "Appointment_professionalId_fkey" TO "appointments_professional_id_fkey";

-- RenameForeignKey
ALTER TABLE IF EXISTS "attendances" RENAME CONSTRAINT "Attendance_patientId_fkey" TO "attendances_patient_id_fkey";
ALTER TABLE IF EXISTS "Attendance" RENAME CONSTRAINT "Attendance_patientId_fkey" TO "attendances_patient_id_fkey";

-- RenameForeignKey
ALTER TABLE IF EXISTS "attendances" RENAME CONSTRAINT "Attendance_professionalId_fkey" TO "attendances_professional_id_fkey";
ALTER TABLE IF EXISTS "Attendance" RENAME CONSTRAINT "Attendance_professionalId_fkey" TO "attendances_professional_id_fkey";

-- RenameForeignKey
ALTER TABLE IF EXISTS "sessions" RENAME CONSTRAINT "Session_userId_fkey" TO "sessions_user_id_fkey";
ALTER TABLE IF EXISTS "Session" RENAME CONSTRAINT "Session_userId_fkey" TO "sessions_user_id_fkey";

-- RenameForeignKey
ALTER TABLE IF EXISTS "treatment_plans" RENAME CONSTRAINT "TreatmentPlan_attendanceId_fkey" TO "treatment_plans_attendance_id_fkey";
ALTER TABLE IF EXISTS "TreatmentPlan" RENAME CONSTRAINT "TreatmentPlan_attendanceId_fkey" TO "treatment_plans_attendance_id_fkey";

-- RenameForeignKey
ALTER TABLE IF EXISTS "treatment_plans" RENAME CONSTRAINT "TreatmentPlan_patientId_fkey" TO "treatment_plans_patient_id_fkey";
ALTER TABLE IF EXISTS "TreatmentPlan" RENAME CONSTRAINT "TreatmentPlan_patientId_fkey" TO "treatment_plans_patient_id_fkey";

-- RenameIndex
ALTER INDEX IF EXISTS "Session_sessionToken_key" RENAME TO "sessions_session_token_key";

-- RenameIndex
ALTER INDEX IF EXISTS "TreatmentPlan_attendanceId_key" RENAME TO "treatment_plans_attendance_id_key";

-- RenameIndex
ALTER INDEX IF EXISTS "User_email_key" RENAME TO "users_email_key";
