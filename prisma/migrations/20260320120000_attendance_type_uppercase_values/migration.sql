-- Rename enum values back to uppercase identifiers expected by Prisma
ALTER TYPE "AttendanceType" RENAME VALUE 'evaluation' TO 'EVALUATION';
ALTER TYPE "AttendanceType" RENAME VALUE 'evolution' TO 'EVOLUTION';
