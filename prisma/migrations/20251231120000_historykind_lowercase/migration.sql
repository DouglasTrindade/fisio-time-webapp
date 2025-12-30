-- Rename existing enum and recreate it with lowercase mapped values
ALTER TABLE "PatientHistory" ALTER COLUMN "kind" DROP DEFAULT;

ALTER TYPE "HistoryKind" RENAME TO "HistoryKind_old";

CREATE TYPE "HistoryKind" AS ENUM ('evolution', 'assessment');

ALTER TABLE "PatientHistory"
ALTER COLUMN "kind" TYPE "HistoryKind"
USING (
  CASE
    WHEN "kind"::TEXT = 'EVOLUTION' THEN 'evolution'::"HistoryKind"
    ELSE 'assessment'::"HistoryKind"
  END
);

ALTER TABLE "PatientHistory" ALTER COLUMN "kind" SET DEFAULT 'evolution';

DROP TYPE "HistoryKind_old";
