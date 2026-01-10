"use client"

import { z } from "zod";

export const treatmentPlanFormSchema = z.object({
  patientId: z.string().min(1, "Selecione um paciente"),
  attendanceId: z.string().min(1, "Selecione uma avaliação"),
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

export type TreatmentPlanFormSchema = z.infer<typeof treatmentPlanFormSchema>;
