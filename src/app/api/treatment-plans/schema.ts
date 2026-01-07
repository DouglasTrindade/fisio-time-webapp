import { z } from "zod";

export const createTreatmentPlanSchema = z.object({
  patientId: z.string().cuid("Paciente inválido"),
  attendanceId: z.string().cuid("Avaliação inválida"),
  procedure: z.string().min(3, "Procedimento é obrigatório"),
  sessionQuantity: z.coerce
    .number()
    .int("Quantidade deve ser um número inteiro")
    .positive("Quantidade deve ser maior que zero"),
  resource: z.string().optional().or(z.literal("")),
  conducts: z.string().optional().or(z.literal("")),
  objectives: z.string().optional().or(z.literal("")),
  prognosis: z.string().optional().or(z.literal("")),
});

export const updateTreatmentPlanSchema = createTreatmentPlanSchema.partial();

export const treatmentPlanParamsSchema = z.object({
  id: z.string().cuid("ID inválido"),
});

export type CreateTreatmentPlanInput = z.infer<typeof createTreatmentPlanSchema>;
export type UpdateTreatmentPlanInput = z.infer<typeof updateTreatmentPlanSchema>;
