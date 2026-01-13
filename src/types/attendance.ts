import type { Attendance as PrismaAttendance, AttendanceType as PrismaAttendanceType, Prisma } from "@prisma/client";
export type AttendanceType = PrismaAttendanceType;

export interface AttendanceAttachment {
  id: string;
  name: string;
  size: number;
  type: string;
  url?: string | null;
  content?: string | null;
}

type AttendanceBase = Omit<
  PrismaAttendance,
  | "date"
  | "createdAt"
  | "updatedAt"
  | "type"
  | "attachments"
  | "launchToFinance"
  | "financeAmount"
  | "financePaymentMethod"
  | "financeAccount"
  | "financePaid"
  | "financePaidAt"
>;

export interface Attendance extends AttendanceBase {
  type: AttendanceType;
  date: string;
  createdAt: string;
  updatedAt: string;
  attachments?: AttendanceAttachment[] | null;
  launchToFinance: boolean;
  financeAmount?: string | null;
  financePaymentMethod?: string | null;
  financeAccount?: string | null;
  financePaid: boolean;
  financePaidAt?: string | null;
  patient?: {
    id: string;
    name: string | null;
  } | null;
  professional?: {
    id: string;
    name: string | null;
  } | null;
  treatmentPlan?: {
    id: string;
  } | null;
}

export interface AttendanceCreateInput {
  patientId: string;
  professionalId: string;
  type: AttendanceType;
  date: string;
  mainComplaint?: string | null;
  currentIllnessHistory?: string | null;
  pastMedicalHistory?: string | null;
  familyHistory?: string | null;
  observations?: string | null;
  cidCode?: string | null;
  cidDescription?: string | null;
  cifCode?: string | null;
  cifDescription?: string | null;
  evolutionNotes?: string | null;
  attachments?: AttendanceAttachment[] | Prisma.JsonValue | null;
  launchToFinance?: boolean;
  financeAmount?: string | null;
  financePaymentMethod?: string | null;
  financeAccount?: string | null;
  financePaid?: boolean;
  financePaidAt?: string | null;
}

export type AttendanceUpdateInput = Partial<AttendanceCreateInput>;

export interface AttendanceFilters extends Record<string, unknown> {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: "date" | "createdAt" | "type";
  sortOrder?: "asc" | "desc";
  type?: AttendanceType | string;
  patientId?: string;
}
