-- Rename existing enum and create a new one with uppercase values
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'AttendanceType') THEN
    ALTER TYPE "AttendanceType" RENAME TO "AttendanceType_old";
  END IF;
END
$$;

DO $$
BEGIN
  CREATE TYPE "AttendanceType" AS ENUM ('EVALUATION', 'EVOLUTION');
EXCEPTION
  WHEN duplicate_object THEN null;
END
$$;

ALTER TABLE "Attendance"
  ALTER COLUMN "type" DROP DEFAULT;

ALTER TABLE "Attendance"
  ALTER COLUMN "type" TYPE "AttendanceType"
  USING UPPER("type"::text)::"AttendanceType";

ALTER TABLE "transactions"
  ALTER COLUMN "attendance_type" TYPE "AttendanceType"
  USING UPPER("attendance_type"::text)::"AttendanceType";

ALTER TABLE "Attendance"
  ALTER COLUMN "type" SET DEFAULT 'EVALUATION';

DO $$ BEGIN
  DROP TYPE IF EXISTS "AttendanceType_old";
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;
