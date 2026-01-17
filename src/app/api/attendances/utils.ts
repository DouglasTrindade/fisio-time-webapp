import type { Attendance } from "@/types/attendance";
import {
  AttendanceType,
  PaymentMethod,
  Prisma,
  TransactionCategory,
  TransactionSource,
  TransactionStatus,
} from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { toNullablePrismaEnumValue, toPrismaEnumValue } from "@/lib/prisma/enum-helpers";

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
  financePaymentMethod: PaymentMethod | null;
  financeAccount: string | null;
  financePaid: boolean;
  financePaidAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  patient: { id: string; name: string | null } | null;
  professional: { id: string; name: string | null } | null;
  treatmentPlan: { id: string } | null;
};

export const attendanceInclude = {
  patient: { select: { id: true, name: true } },
  professional: { select: { id: true, name: true } },
  treatmentPlan: { select: { id: true } },
} as const;

export const toPrismaAttendanceType = (
  value?: string | AttendanceType | null
): AttendanceType | undefined => {
  if (!value) return undefined;

  const normalized =
    typeof value === "string"
      ? value.trim().replace(/[\s-]/g, "_").toUpperCase()
      : value;

  if (normalized === "EVOLUTION") {
    return "EVOLUTION" as unknown as AttendanceType;
  }

  if (normalized === "EVALUATION") {
    return "EVALUATION" as unknown as AttendanceType;
  }

  if (normalized === AttendanceType.EVOLUTION) {
    return AttendanceType.EVOLUTION;
  }

  if (normalized === AttendanceType.EVALUATION) {
    return AttendanceType.EVALUATION;
  }

  return undefined;
};

const resolvePaymentMethod = (
  value?: string | PaymentMethod | null
): PaymentMethod | null => {
  if (!value) {
    return null;
  }

  const normalizedKey = value
    .toString()
    .trim()
    .replace(/[\s-]/g, "_")
    .toUpperCase();

  switch (normalizedKey) {
    case "PIX":
      return "PIX" as unknown as PaymentMethod;
    case "BANK_SLIP":
      return "BANK_SLIP" as unknown as PaymentMethod;
    case "CREDIT_CARD":
      return "CREDIT_CARD" as unknown as PaymentMethod;
    default:
      return null;
  }
};

const formatPaymentMethod = (
  method: PaymentMethod | null
): Attendance["financePaymentMethod"] | null => {
  if (!method) return null;

  const normalized = method.toString().toLowerCase();

  switch (normalized) {
    case "pix":
      return "pix";
    case "credit_card":
      return "credit_card";
    case "bank_slip":
      return "bank_slip";
    default:
      return null;
  }
};

export const formatAttendance = (
  attendance: AttendanceWithRelations
): Attendance => {
  const normalizedType = `${attendance.type}`.toLowerCase()
  const isEvolution = normalizedType === "evolution"

  return {
    ...attendance,
    treatmentPlan: attendance.treatmentPlan,
    cifCode: attendance.cifCode,
    cifDescription: attendance.cifDescription,
    type: isEvolution ? "evolution" : "evaluation",
    launchToFinance: attendance.launchToFinance,
    financeAmount: attendance.financeAmount ? attendance.financeAmount.toString() : null,
    financePaymentMethod: formatPaymentMethod(attendance.financePaymentMethod),
    financeAccount: attendance.financeAccount,
    financePaid: attendance.financePaid,
    financePaidAt: attendance.financePaidAt
      ? attendance.financePaidAt.toISOString()
      : null,
    date: attendance.date.toISOString(),
    createdAt: attendance.createdAt.toISOString(),
    updatedAt: attendance.updatedAt.toISOString(),
    attachments: attendance.attachments ?? null,
  }
};

type FinanceInput = {
  launchToFinance?: boolean;
  financeAmount?: string | number | null;
  financePaymentMethod?: PaymentMethod | string | null;
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
  financePaymentMethod: resolvePaymentMethod(input.financePaymentMethod),
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
      ? resolvePaymentMethod(input.financePaymentMethod)
      : undefined,
  financeAccount:
    input.financeAccount !== undefined ? input.financeAccount ?? null : undefined,
  financePaid: input.financePaid !== undefined ? input.financePaid : undefined,
  financePaidAt:
    input.financePaidAt !== undefined
      ? parseFinanceDate(input.financePaidAt)
      : undefined,
});

const buildAttendanceTransactionDescription = (
  attendance: AttendanceWithRelations,
) => {
  const typeLabel =
    `${attendance.type}`.toLowerCase() === "evolution" ? "Evolução" : "Avaliação"
  const patientName = attendance.patient?.name ?? "Paciente"
  return `${typeLabel} • ${patientName}`
}

const buildTransactionDates = (attendance: AttendanceWithRelations) => {
  const reference = attendance.financePaidAt ?? attendance.date
  return {
    dueDate: attendance.date,
    competenceDate: attendance.date,
    paidAt: attendance.financePaid ? reference : null,
  }
}

const findAttendanceTransaction = (attendanceId: string) =>
  prisma.transaction.findFirst({
    where: {
      referenceId: attendanceId,
      source: toPrismaEnumValue(TransactionSource.ATTENDANCE) as TransactionSource,
    },
  })

export const syncAttendanceTransaction = async (
  attendance: AttendanceWithRelations,
) => {
  const existing = await findAttendanceTransaction(attendance.id)

  if (!attendance.launchToFinance || !attendance.financeAmount) {
    if (existing) {
      await prisma.transaction.delete({ where: { id: existing.id } })
    }
    return
  }

  const dates = buildTransactionDates(attendance)
  const data = {
    description: buildAttendanceTransactionDescription(attendance),
    amount: attendance.financeAmount,
    account: attendance.financeAccount ?? null,
    category: toPrismaEnumValue(TransactionCategory.ATTENDANCE) as TransactionCategory,
    paymentMethod: toNullablePrismaEnumValue(attendance.financePaymentMethod) as PaymentMethod | null,
    status: toPrismaEnumValue(
      attendance.financePaid ? TransactionStatus.PAID : TransactionStatus.PENDING,
    ) as TransactionStatus,
    source: toPrismaEnumValue(TransactionSource.ATTENDANCE) as TransactionSource,
    referenceId: attendance.id,
    attendanceType: toPrismaEnumValue(attendance.type) as AttendanceType,
    dueDate: dates.dueDate,
    competenceDate: dates.competenceDate,
    paidAt: dates.paidAt,
    notes: attendance.observations ?? null,
  }

  if (existing) {
    await prisma.transaction.update({
      where: { id: existing.id },
      data,
    })
  } else {
    await prisma.transaction.create({ data })
  }
}

export const deleteAttendanceTransaction = async (attendanceId: string) => {
  await prisma.transaction.deleteMany({
    where: {
      referenceId: attendanceId,
      source: toPrismaEnumValue(TransactionSource.ATTENDANCE) as TransactionSource,
    },
  })
}
