"use client"

import { QUICK_ACTIONS } from "../dashboardConstants"
import { QuickActionCard } from "../components/QuickActionCard"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"

export const QuickActionsSection = () => (
  <section className="space-y-3">
    <div className="flex flex-col gap-1">
      <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        Acesso rápido
      </p>
      <p className="text-sm text-muted-foreground">
        Principais módulos para o fluxo diário da clínica
      </p>
    </div>
    <div className="md:hidden">
      <ScrollArea className="-mx-4">
        <div className="flex gap-4 px-4 py-1">
          {QUICK_ACTIONS.map((action) => (
            <div key={action.title} className="min-w-60 flex-1">
              <QuickActionCard {...action} />
            </div>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
    <div className="hidden gap-4 md:grid md:grid-cols-2 xl:grid-cols-4">
      {QUICK_ACTIONS.map((action) => (
        <QuickActionCard key={action.title} {...action} />
      ))}
    </div>
  </section>
)
