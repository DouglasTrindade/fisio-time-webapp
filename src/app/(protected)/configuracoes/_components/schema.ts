import { z } from "zod";

export const userSettingsSchema = z
  .object({
    name: z.string().min(2, "Informe seu nome completo"),
    email: z.string().email("E-mail inválido"),
    image: z.string().url("Informe uma URL válida").or(z.literal("")).optional(),
    currentPassword: z.string().min(1, "Informe a senha atual").optional(),
    newPassword: z.string().min(8, "A nova senha precisa ter ao menos 8 caracteres").optional(),
    confirmPassword: z.string().min(8, "Confirme a nova senha").optional(),
  })
  .refine((data) => {
    const anyPasswordField = data.currentPassword || data.newPassword || data.confirmPassword;
    if (!anyPasswordField) return true;
    return Boolean(data.currentPassword && data.newPassword && data.confirmPassword);
  }, {
    message: "Preencha a senha atual e a nova senha",
    path: ["newPassword"],
  })
  .refine((data) => {
    if (!data.newPassword && !data.confirmPassword) return true;
    return data.newPassword === data.confirmPassword;
  }, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  });

export type UserSettingsValues = z.infer<typeof userSettingsSchema>;
