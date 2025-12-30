import { z } from "zod";

export const historyKindSchema = z.enum(["EVOLUTION", "ASSESSMENT"]);

export const baseHistorySchema = z.object({
  kind: historyKindSchema.default("EVOLUTION"),
  cidCode: z.string().optional(),
  cidDescription: z.string().optional(),
  content: z.string().min(3, "Descreva a evolução"),
});

export const historyRefinement = (
  data: z.infer<typeof baseHistorySchema>,
  ctx: z.RefinementCtx,
) => {
  if (data.kind === "EVOLUTION") {
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

export type CreateHistoryInput = z.infer<typeof createHistorySchema>;
export type UpdateHistoryInput = z.infer<typeof updateHistorySchema>;
