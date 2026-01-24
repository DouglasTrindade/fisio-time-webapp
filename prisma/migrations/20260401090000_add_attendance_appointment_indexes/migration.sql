-- Add indexes to accelerate appointment queries by date and professional/patient filters
CREATE INDEX IF NOT EXISTS "appointments_date_idx" ON "appointments" ("date");
CREATE INDEX IF NOT EXISTS "appointments_professional_id_date_idx" ON "appointments" ("professional_id", "date");
CREATE INDEX IF NOT EXISTS "appointments_patient_id_date_idx" ON "appointments" ("patient_id", "date");

-- Add indexes to accelerate attendance queries by date and professional/patient filters
CREATE INDEX IF NOT EXISTS "attendances_date_idx" ON "attendances" ("date");
CREATE INDEX IF NOT EXISTS "attendances_patient_id_date_idx" ON "attendances" ("patient_id", "date");
CREATE INDEX IF NOT EXISTS "attendances_professional_id_date_idx" ON "attendances" ("professional_id", "date");
