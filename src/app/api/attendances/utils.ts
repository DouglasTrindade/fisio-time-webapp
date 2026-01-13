import type { Attendance } from "@/types/attendance";
import { AttendanceType, Prisma } from "@prisma/client";

import type { AttendanceAttachment } from "@/types/attendance";

export type AttendanceWithRelations = {
  id: string;
  type: AttendanceType;
  date: Date;
  patientId: string;
  professionalId: string;
  mainComplaint: string | null;
  currentIllnessHistory: string | null;
  pastMedicalHistory: string | null;
  familyHistory: string | null;
  observations: string | null;
  cidCode: string | null;
  cidDescription: string | null;
  cifCode: string | null;
  cifDescription: string | null;
  evolutionNotes: string | null;
  attachments: AttendanceAttachment[] | null;
  launchToFinance: boolean;
  financeAmount: Prisma.Decimal | null;
  financePaymentMethod: string | null;
  financeAccount: string | null;
  financePaid: boolean;
  financePaidAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  patient: { id: string; name: string | null } | null;
  professional: { id: string; name: string | null } | null;
};

export const attendanceInclude = {
  patient: { select: { id: true, name: true } },
  professional: { select: { id: true, name: true } },
} as const;

export const toPrismaAttendanceType = (
  value?: string | AttendanceType | null
): AttendanceType | undefined => {
  if (!value) return undefined;

  const normalized =
    typeof value === "string" ? value.trim().toUpperCase() : value;

  if (normalized === AttendanceType.EVOLUTION) {
    return AttendanceType.EVOLUTION;
  }

  if (normalized === AttendanceType.EVALUATION) {
    return AttendanceType.EVALUATION;
  }

  return undefined;
};

export const formatAttendance = (
  attendance: AttendanceWithRelations
): Attendance => ({
  ...attendance,
  cifCode: attendance.cifCode,
  cifDescription: attendance.cifDescription,
  type: attendance.type === AttendanceType.EVOLUTION ? "evolution" : "evaluation",
  launchToFinance: attendance.launchToFinance,
  financeAmount: attendance.financeAmount ? attendance.financeAmount.toString() : null,
  financePaymentMethod: attendance.financePaymentMethod,
  financeAccount: attendance.financeAccount,
  financePaid: attendance.financePaid,
  financePaidAt: attendance.financePaidAt
    ? attendance.financePaidAt.toISOString()
    : null,
  date: attendance.date.toISOString(),
  createdAt: attendance.createdAt.toISOString(),
  updatedAt: attendance.updatedAt.toISOString(),
  attachments: attendance.attachments ?? null,
});
