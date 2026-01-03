import { z } from "zod";

export const userSettingsSchema = z.object({
  name: z.string().min(2, "Informe seu nome completo"),
  email: z.string().email("E-mail inválido"),
  image: z.string().url("Informe uma URL válida").or(z.literal("")).optional(),
});

export type UserSettingsValues = z.infer<typeof userSettingsSchema>;
