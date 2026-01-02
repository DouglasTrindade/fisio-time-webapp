import type { ReactNode } from "react"
import { AppointmentsProvider } from "@/context/AppointmentsContext"

const AgendamentosLayout = ({ children }: { children: ReactNode }) => {
  return <AppointmentsProvider>{children}</AppointmentsProvider>
}

export default AgendamentosLayout
