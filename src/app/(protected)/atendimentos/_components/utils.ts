"use client";

import type { AttendanceType } from "@/app/types/attendance";

const typeLabels: Record<string, string> = {
  evaluation: "Avaliação",
  evolution: "Evolução",
};

const safeDate = (isoDate: string) => {
  const date = new Date(isoDate);
  return Number.isNaN(date.getTime()) ? null : date;
};

export const getAttendanceTypeLabel = (type: AttendanceType) => {
  const key = type.toLowerCase();
  return typeLabels[key] ?? "Atendimento";
};

export const formatAttendanceDate = (isoDate: string) => {
  const date = safeDate(isoDate);
  if (!date) return "-";

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
};

export const formatAttendanceTime = (isoDate: string) => {
  const date = safeDate(isoDate);
  if (!date) return "-";

  return new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};
