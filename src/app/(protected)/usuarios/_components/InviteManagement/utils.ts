import type { AppRole } from "@/types/user"

export const roleLabels: Record<AppRole, string> = {
  ADMIN: "Administrador(a)",
  PROFESSIONAL: "Profissional",
  ASSISTANT: "Assistente",
}

export const roleDescriptions: Record<AppRole, string> = {
  ADMIN: "Acesso total a configurações e finanças.",
  PROFESSIONAL: "Atua em pacientes, planos e finanças.",
  ASSISTANT: "Suporte administrativo e agenda.",
}