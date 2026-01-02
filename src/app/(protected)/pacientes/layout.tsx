import type { ReactNode } from "react"
import { PatientsProvider } from "@/context/PatientsContext"

const PacientesLayout = ({ children }: { children: ReactNode }) => {
  return <PatientsProvider>{children}</PatientsProvider>
}

export default PacientesLayout
