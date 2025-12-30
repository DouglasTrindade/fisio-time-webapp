import { z } from "zod";

export const historyKindSchema = z.enum(["evolution", "assessment"]);

export const baseHistorySchema = z.object({
  kind: historyKindSchema.default("evolution"),
  cidCode: z.string().optional(),
  cidDescription: z.string().optional(),
  content: z.string().optional(),
  assessmentMainComplaint: z.string().optional(),
  assessmentDiseaseHistory: z.string().optional(),
  assessmentMedicalHistory: z.string().optional(),
  assessmentFamilyHistory: z.string().optional(),
  assessmentObservations: z.string().optional(),
});

export const historyRefinement = (
  data: z.infer<typeof baseHistorySchema>,
  ctx: z.RefinementCtx,
) => {
  if (data.kind === "evolution") {
    if (!data.cidCode || data.cidCode.trim() === "") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Selecione um CID",
        path: ["cidCode"],
      });
    }
    if (!data.cidDescription || data.cidDescription.trim() === "") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Informe o nome da doença",
        path: ["cidDescription"],
      });
    }
    if (!data.content || data.content.trim().length < 3) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Descreva a evolução",
        path: ["content"],
      });
    }
  } else {
    const requiredFields: Array<[keyof typeof data, string]> = [
      ["assessmentMainComplaint", "Informe a queixa principal"],
      ["assessmentDiseaseHistory", "Descreva a história da doença atual"],
      ["assessmentMedicalHistory", "Preencha a história médica pregressa"],
      ["assessmentFamilyHistory", "Informe o histórico familiar"],
      ["assessmentObservations", "Inclua observações da avaliação"],
    ];

    requiredFields.forEach(([field, message]) => {
      const value = data[field];
      if (!value || (typeof value === "string" && value.trim().length < 3)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message,
          path: [field],
        });
      }
    });
  }
};

export const createHistorySchema = baseHistorySchema.superRefine(historyRefinement);

export const updateHistorySchema = baseHistorySchema
  .partial()
  .superRefine(historyRefinement);

export const historyParamsSchema = z.object({
  id: z.string().cuid("ID do paciente inválido"),
  historyId: z.string().cuid("ID do histórico inválido"),
});

export type HistoryKindValue = z.infer<typeof historyKindSchema>;
export type CreateHistoryInput = z.infer<typeof createHistorySchema>;
export type UpdateHistoryInput = z.infer<typeof updateHistorySchema>;
