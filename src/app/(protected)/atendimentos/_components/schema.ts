"use client"

import { z } from "zod"

const optionalText = z.string().optional().or(z.literal(""))

export const attendanceFormSchema = z.object({
  patientId: z.string().min(1, "Paciente é obrigatório"),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data é obrigatória"),
  time: z.string().regex(/^\d{2}:\d{2}$/, "Horário é obrigatório"),
  mainComplaint: optionalText,
  currentIllnessHistory: optionalText,
  pastMedicalHistory: optionalText,
  familyHistory: optionalText,
  observations: optionalText,
})

export type AttendanceFormSchema = z.infer<typeof attendanceFormSchema>
