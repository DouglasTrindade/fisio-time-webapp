import { z } from "zod"

export const inviteFormSchema = z.object({
  email: z.string().email("Informe um e-mail válido"),
  role: z.enum(["ADMIN", "PROFESSIONAL", "ASSISTANT"], {
    required_error: "Selecione uma função",
  }),
})

export type InviteFormValues = z.infer<typeof inviteFormSchema>
