-- Rename existing enum and create a new one with uppercase values
ALTER TYPE "AttendanceType" RENAME TO "AttendanceType_old";

CREATE TYPE "AttendanceType" AS ENUM ('EVALUATION', 'EVOLUTION');

-- Update column to use new enum, converting existing data to uppercase
ALTER TABLE "Attendance"
  ALTER COLUMN "type" DROP DEFAULT;

ALTER TABLE "Attendance"
  ALTER COLUMN "type" TYPE "AttendanceType"
  USING UPPER("type"::text)::"AttendanceType";

ALTER TABLE "Attendance"
  ALTER COLUMN "type" SET DEFAULT 'EVALUATION';

-- Drop old enum
DROP TYPE "AttendanceType_old";
