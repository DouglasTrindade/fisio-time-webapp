import type { ReactNode } from "react"
import { AttendancesProvider } from "@/contexts/AttendancesContext"

const AtendimentosLayout = ({ children }: { children: ReactNode }) => {
  return <AttendancesProvider>{children}</AttendancesProvider>
}

export default AtendimentosLayout
