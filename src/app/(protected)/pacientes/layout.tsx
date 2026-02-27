import type { ReactNode } from "react"
import { PatientsProvider } from "@/contexts/PatientsContext"
import { ModalProvider } from "@/contexts/ModalContext"

const PacientesLayout = ({ children }: { children: ReactNode }) => {
  return (
    <PatientsProvider>
      <ModalProvider>{children}</ModalProvider>
    </PatientsProvider>
  )
}

export default PacientesLayout
