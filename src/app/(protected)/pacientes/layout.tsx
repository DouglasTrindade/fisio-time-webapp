import type { ReactNode } from "react"
import { PatientsProvider } from "@/contexts/PatientsContext"

const PacientesLayout = ({ children }: { children: ReactNode }) => {
  return <PatientsProvider>{children}</PatientsProvider>
}

export default PacientesLayout
