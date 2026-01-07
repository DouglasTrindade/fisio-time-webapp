"use client"

import { z } from "zod"

const optionalText = z
  .string()
  .optional()
  .or(z.literal(""))

const optionalNullableString = z
  .union([z.string(), z.literal(""), z.null(), z.undefined()])
  .transform((value) => (value && value.length ? value : undefined))

const attachmentSchema = z.object({
  id: z.string(),
  name: z.string(),
  size: z.number().nonnegative(),
  type: z.string(),
  url: optionalNullableString,
  content: optionalNullableString,
})

export const attendanceFormSchema = z.object({
  patientId: z.string().min(1, "Paciente é obrigatório"),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data é obrigatória"),
  time: z.string().regex(/^\d{2}:\d{2}$/, "Horário é obrigatório"),
  mainComplaint: optionalText,
  currentIllnessHistory: optionalText,
  pastMedicalHistory: optionalText,
  familyHistory: optionalText,
  observations: optionalText,
  cidCode: optionalText,
  cidDescription: optionalText,
  cifCode: optionalText,
  cifDescription: optionalText,
  evolutionNotes: optionalText,
  attachments: z.array(attachmentSchema),
})

export type AttendanceFormSchema = z.input<typeof attendanceFormSchema>
