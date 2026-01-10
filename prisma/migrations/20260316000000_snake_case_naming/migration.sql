-- Users
ALTER TABLE "User" RENAME COLUMN "emailVerified" TO "email_verified";
ALTER TABLE "User" RENAME COLUMN "createdAt" TO "created_at";
ALTER TABLE "User" RENAME COLUMN "updatedAt" TO "updated_at";
ALTER TABLE "User" RENAME TO "users";

-- Patients
ALTER TABLE "Patient" RENAME COLUMN "birthDate" TO "birth_date";
ALTER TABLE "Patient" RENAME COLUMN "maritalStatus" TO "marital_status";
ALTER TABLE "Patient" RENAME COLUMN "companyName" TO "company_name";
ALTER TABLE "Patient" RENAME COLUMN "createdAt" TO "created_at";
ALTER TABLE "Patient" RENAME COLUMN "updatedAt" TO "updated_at";
ALTER TABLE "Patient" RENAME TO "patients";

-- Appointments
ALTER TABLE "Appointment" RENAME COLUMN "professionalId" TO "professional_id";
ALTER TABLE "Appointment" RENAME COLUMN "patientId" TO "patient_id";
ALTER TABLE "Appointment" RENAME COLUMN "createdAt" TO "created_at";
ALTER TABLE "Appointment" RENAME COLUMN "updatedAt" TO "updated_at";
ALTER TABLE "Appointment" RENAME TO "appointments";

-- Attendances
ALTER TABLE "Attendance" RENAME COLUMN "patientId" TO "patient_id";
ALTER TABLE "Attendance" RENAME COLUMN "professionalId" TO "professional_id";
ALTER TABLE "Attendance" RENAME COLUMN "mainComplaint" TO "main_complaint";
ALTER TABLE "Attendance" RENAME COLUMN "currentIllnessHistory" TO "current_illness_history";
ALTER TABLE "Attendance" RENAME COLUMN "pastMedicalHistory" TO "past_medical_history";
ALTER TABLE "Attendance" RENAME COLUMN "familyHistory" TO "family_history";
ALTER TABLE "Attendance" RENAME COLUMN "cidCode" TO "cid_code";
ALTER TABLE "Attendance" RENAME COLUMN "cidDescription" TO "cid_description";
ALTER TABLE "Attendance" RENAME COLUMN "cifCode" TO "cif_code";
ALTER TABLE "Attendance" RENAME COLUMN "cifDescription" TO "cif_description";
ALTER TABLE "Attendance" RENAME COLUMN "evolutionNotes" TO "evolution_notes";
ALTER TABLE "Attendance" RENAME COLUMN "createdAt" TO "created_at";
ALTER TABLE "Attendance" RENAME COLUMN "updatedAt" TO "updated_at";
ALTER TABLE "Attendance" RENAME TO "attendances";

-- Treatment plans
ALTER TABLE "TreatmentPlan" RENAME COLUMN "patientId" TO "patient_id";
ALTER TABLE "TreatmentPlan" RENAME COLUMN "attendanceId" TO "attendance_id";
ALTER TABLE "TreatmentPlan" RENAME COLUMN "sessionQuantity" TO "session_quantity";
ALTER TABLE "TreatmentPlan" RENAME COLUMN "createdAt" TO "created_at";
ALTER TABLE "TreatmentPlan" RENAME COLUMN "updatedAt" TO "updated_at";
ALTER TABLE "TreatmentPlan" RENAME TO "treatment_plans";

-- Accounts
ALTER TABLE "Account" RENAME COLUMN "userId" TO "user_id";
ALTER TABLE "Account" RENAME COLUMN "providerAccountId" TO "provider_account_id";
ALTER TABLE "Account" RENAME COLUMN "createdAt" TO "created_at";
ALTER TABLE "Account" RENAME COLUMN "updatedAt" TO "updated_at";
ALTER TABLE "Account" RENAME TO "accounts";

-- Sessions
ALTER TABLE "Session" RENAME COLUMN "sessionToken" TO "session_token";
ALTER TABLE "Session" RENAME COLUMN "userId" TO "user_id";
ALTER TABLE "Session" RENAME COLUMN "createdAt" TO "created_at";
ALTER TABLE "Session" RENAME COLUMN "updatedAt" TO "updated_at";
ALTER TABLE "Session" RENAME TO "sessions";

-- Verification tokens
ALTER TABLE "VerificationToken" RENAME TO "verification_tokens";

-- Enum values
ALTER TYPE "AttendanceType" RENAME VALUE 'EVALUATION' TO 'evaluation';
ALTER TYPE "AttendanceType" RENAME VALUE 'EVOLUTION' TO 'evolution';
