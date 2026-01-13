DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_enum e
    JOIN pg_type t ON e.enumtypid = t.oid
    WHERE t.typname = 'AttendanceType' AND e.enumlabel = 'EVALUATION'
  ) THEN
    ALTER TYPE "AttendanceType" RENAME VALUE 'EVALUATION' TO 'evaluation';
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_enum e
    JOIN pg_type t ON e.enumtypid = t.oid
    WHERE t.typname = 'AttendanceType' AND e.enumlabel = 'EVOLUTION'
  ) THEN
    ALTER TYPE "AttendanceType" RENAME VALUE 'EVOLUTION' TO 'evolution';
  END IF;
END$$;
