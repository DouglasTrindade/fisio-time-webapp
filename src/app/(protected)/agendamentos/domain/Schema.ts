import { z } from "zod";

export const appointmentSchema = z.object({
  phone: z.string().min(1, "Telefone é obrigatório"),
  date: z.string().min(1, "Data é obrigatória"),
  status: z.enum([
    "waiting",
    "attended",
    "confirmed",
    "canceled",
    "rescheduled",
  ]),
  patientId: z.string().optional(),
  notes: z.string().nullable().optional(),
});

export type AppointmentForm = z.infer<typeof appointmentSchema>;
