import type { AppRole } from "@/types/user"

const ADMIN: AppRole = "ADMIN"
const PROFESSIONAL: AppRole = "PROFESSIONAL"
const ASSISTANT: AppRole = "ASSISTANT"

const hasFullAccess = (role?: AppRole | null) =>
  role === ADMIN || role === PROFESSIONAL

const hasAssistantAccess = (role?: AppRole | null) =>
  hasFullAccess(role) || role === ASSISTANT

export const canInviteUsers = (role?: AppRole | null) => role === ADMIN

export const canManageSettings = (role?: AppRole | null) => hasFullAccess(role)

export const canManageFinance = (role?: AppRole | null) => hasFullAccess(role)

export const canManageClinical = (role?: AppRole | null) => hasFullAccess(role)

export const canCreateAppointments = (role?: AppRole | null) =>
  hasAssistantAccess(role)

export const canManagePatients = (role?: AppRole | null) =>
  hasAssistantAccess(role)

export const canDeletePatients = (role?: AppRole | null) => hasFullAccess(role)
