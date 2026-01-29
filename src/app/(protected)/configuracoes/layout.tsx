import type { ReactNode } from "react"

import { SettingsSidebar } from "./_components/SettingsSidebar"

const ConfiguracoesLayout = ({ children }: { children: ReactNode }) => {
  return (
    <section className="space-y-8">
      <header className="space-y-2">
        <p className="text-sm uppercase tracking-wide text-muted-foreground">Configurações</p>
        <h1 className="text-3xl font-semibold">Central de preferências</h1>
        <p className="text-muted-foreground">
          Gerencie perfil, cobrança e notificações em um só lugar.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
        <SettingsSidebar />
        <div className="space-y-6">{children}</div>
      </div>
    </section>
  )
}

export default ConfiguracoesLayout
