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

type FinanceInput = {
  launchToFinance?: boolean;
  financeAmount?: string | number | null;
  financePaymentMethod?: string | null;
  financeAccount?: string | null;
  financePaid?: boolean;
  financePaidAt?: string | Date | null;
};

const parseFinanceAmount = (
  value?: FinanceInput["financeAmount"],
): Prisma.Decimal | null => {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  const normalized =
    typeof value === "number" ? value.toString() : value.trim();
  if (!normalized) return null;

  try {
    return new Prisma.Decimal(normalized);
  } catch {
    return null;
  }
};

const parseFinanceDate = (
  value?: FinanceInput["financePaidAt"],
): Date | null => {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

export const buildCreateFinanceData = (input: FinanceInput) => ({
  launchToFinance: input.launchToFinance ?? false,
  financeAmount: parseFinanceAmount(input.financeAmount),
  financePaymentMethod: input.financePaymentMethod ?? null,
  financeAccount: input.financeAccount ?? null,
  financePaid: input.financePaid ?? false,
  financePaidAt: parseFinanceDate(input.financePaidAt),
});

export const buildUpdateFinanceData = (input: FinanceInput) => ({
  launchToFinance:
    input.launchToFinance !== undefined ? input.launchToFinance : undefined,
  financeAmount:
    input.financeAmount !== undefined
      ? parseFinanceAmount(input.financeAmount)
      : undefined,
  financePaymentMethod:
    input.financePaymentMethod !== undefined
      ? input.financePaymentMethod ?? null
      : undefined,
  financeAccount:
    input.financeAccount !== undefined ? input.financeAccount ?? null : undefined,
  financePaid: input.financePaid !== undefined ? input.financePaid : undefined,
  financePaidAt:
    input.financePaidAt !== undefined
      ? parseFinanceDate(input.financePaidAt)
      : undefined,
});
