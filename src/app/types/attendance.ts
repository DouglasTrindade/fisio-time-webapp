import type { Attendance as PrismaAttendance, AttendanceType as PrismaAttendanceType } from "@prisma/client";
export type AttendanceType = PrismaAttendanceType;

export interface Attendance
  extends Omit<PrismaAttendance, "date" | "createdAt" | "updatedAt" | "type"> {
  type: AttendanceType;
  date: string;
  createdAt: string;
  updatedAt: string;
  patient?: {
    id: string;
    name: string | null;
  } | null;
  professional?: {
    id: string;
    name: string | null;
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
}

export type AttendanceUpdateInput = Partial<AttendanceCreateInput>;

export interface AttendanceFilters extends Record<string, unknown> {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: "date" | "createdAt" | "type";
  sortOrder?: "asc" | "desc";
  type?: AttendanceType | string;
}
