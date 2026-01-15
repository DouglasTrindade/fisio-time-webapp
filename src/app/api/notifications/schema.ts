import { z } from "zod"

export const createNotificationSchema = z
  .object({
    recipientId: z.string().min(1, "Selecione o destinatário"),
    message: z.string().min(5, "Mensagem muito curta"),
    sendMode: z.enum(["now", "scheduled"]).default("now"),
    scheduledFor: z.string().optional(),
    includeEmail: z.boolean().optional().default(false),
    title: z.string().optional(),
  })
  .superRefine((values, ctx) => {
    if (values.sendMode === "scheduled") {
      if (!values.scheduledFor) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Informe a data agendada",
          path: ["scheduledFor"],
        })
        return
      }

      const date = new Date(values.scheduledFor)
      if (Number.isNaN(date.getTime())) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Data inválida",
          path: ["scheduledFor"],
        })
      }
    }
  })
