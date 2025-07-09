import { z } from "zod";

export const appointmentSchema = z.object({
  name: z.string().min(3, "Nome obrigatório"),
  phone: z.string().min(10, "Telefone inválido"),
  date: z.string(),
  time: z.string()
});
