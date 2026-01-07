import type {
  TreatmentPlan as PrismaTreatmentPlan,
  Prisma,
  AttendanceType,
} from "@prisma/client";

export interface TreatmentPlan extends PrismaTreatmentPlan {
  patient?: {
    id: string;
    name: string | null;
  } | null;
  attendance?: {
    id: string;
    date: string | Date;
    type: AttendanceType;
    patientId: string;
    mainComplaint?: string | null;
  } | null;
}

export interface TreatmentPlanCreateInput {
  patientId: string;
  attendanceId: string;
  procedure: string;
  sessionQuantity: number;
  resource?: string | null;
  conducts?: string | null;
  objectives?: string | null;
  prognosis?: string | null;
}

export type TreatmentPlanUpdateInput = Partial<TreatmentPlanCreateInput>;

export interface TreatmentPlanFilters extends Record<string, unknown> {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: "createdAt" | "updatedAt" | "procedure" | "sessionQuantity";
  sortOrder?: "asc" | "desc";
  patientId?: string;
  attendanceId?: string;
}

export type TreatmentPlanWhereInput = Prisma.TreatmentPlanWhereInput;
