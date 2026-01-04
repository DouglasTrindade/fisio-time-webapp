import type { Attendance } from "@/app/types/attendance";
import { AttendanceType } from "@prisma/client";

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
  value?: string | null
): AttendanceType | undefined => {
  if (!value) return undefined;
  const normalized = value.toUpperCase();
  if (normalized in AttendanceType) {
    return AttendanceType[normalized as keyof typeof AttendanceType];
  }
  return undefined;
};

export const formatAttendance = (
  attendance: AttendanceWithRelations
): Attendance => ({
  ...attendance,
  type: attendance.type,
  date: attendance.date.toISOString(),
  createdAt: attendance.createdAt.toISOString(),
  updatedAt: attendance.updatedAt.toISOString(),
});
