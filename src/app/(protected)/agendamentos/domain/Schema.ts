import { z } from "zod";

export const appointmentSchema = z.object({
  name: z.string().min(3),
  phone: z.string().min(8),
  date: z.date(),
});
