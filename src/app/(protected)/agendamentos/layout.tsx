import type { ReactNode } from "react"
import { AppointmentsProvider } from "@/contexts/AppointmentsContext"

const AgendamentosLayout = ({ children }: { children: ReactNode }) => {
  return <AppointmentsProvider>{children}</AppointmentsProvider>
}

export default AgendamentosLayout
