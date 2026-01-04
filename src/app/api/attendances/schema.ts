import { z } from "zod";
const optionalText = z
  .string()
  .optional()
  .or(z.literal(""))
  .or(z.null())
  .transform((value) => {
    if (!value) return null;
    const trimmed = value.trim();
    return trimmed.length ? trimmed : null;
  });

export const createAttendanceSchema = z.object({
  patientId: z.string().min(1, "Paciente é obrigatório"),
  professionalId: z.string().min(1, "Profissional é obrigatório"),
  type: z
    .enum(["evaluation", "evolution"])
    .default("evaluation"),
  date: z
    .union([
      z.string().datetime("Data inválida"),
      z.date(),
    ])
    .transform((value) => {
      if (value instanceof Date) return value.toISOString();
      return value;
    }),
  mainComplaint: optionalText,
  currentIllnessHistory: optionalText,
  pastMedicalHistory: optionalText,
  familyHistory: optionalText,
  observations: optionalText,
});

export const updateAttendanceSchema = createAttendanceSchema.partial();

export const attendanceParamsSchema = z.object({
  id: z.string().min(1, "ID inválido"),
});

export type CreateAttendanceInput = z.infer<typeof createAttendanceSchema>;
export type UpdateAttendanceInput = z.infer<typeof updateAttendanceSchema>;
