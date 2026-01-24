"use client"

import { useSession } from "next-auth/react"
import {
  canCreateAppointments,
  canDeletePatients,
  canManagePatients,
} from "@/lib/auth/permissions"
import type { AppRole } from "@/types/user"

export const useRolePermissions = () => {
  const { data } = useSession()
  const role = data?.user?.role as AppRole | undefined

  return {
    role,
    canCreateAppointments: canCreateAppointments(role),
    canManagePatients: canManagePatients(role),
    canDeletePatients: canDeletePatients(role),
  }
}
