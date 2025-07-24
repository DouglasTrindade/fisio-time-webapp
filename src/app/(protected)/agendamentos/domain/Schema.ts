import { z } from "zod";

export const appointmentSchema = z.object({
  name: z.string().optional(),
  phone: z.string().min(1, "Telefone é obrigatório"),
  date: z.string().min(1, "Data é obrigatória"),
  status: z.enum([
    "waiting",
    "attended",
    "confirmed",
    "canceled",
    "rescheduled",
  ]),
  patientId: z.string().min(1, "Paciente é obrigatório"),
  notes: z.string().nullable().optional(),
});

export type AppointmentForm = z.infer<typeof appointmentSchema>;
