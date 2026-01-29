"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { BellRing, CreditCard, UserRound } from "lucide-react"

import { cn } from "@/lib/utils"

const NAV_ITEMS = [
  {
    title: "Perfil",
    description: "Dados do responsável e da conta",
    href: "/configuracoes/perfil",
    icon: UserRound,
  },
  {
    title: "Cobrança",
    description: "Planos, pagamento e histórico",
    href: "/configuracoes/cobranca",
    icon: CreditCard,
  },
  {
    title: "Notificações",
    description: "Alertas e preferências",
    href: "/configuracoes/notificacoes",
    icon: BellRing,
  },
] as const

export const SettingsSidebar = () => {
  const pathname = usePathname()

  return (
    <aside className="space-y-3">
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon
        const isActive = pathname === item.href

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-start gap-3 rounded-2xl border px-4 py-3 transition",
              "border-border/60 bg-background/70 hover:border-border",
              isActive && "border-primary/70 bg-primary/5 text-primary",
            )}
          >
            <span
              className={cn(
                "mt-1 rounded-full p-2",
                isActive ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground",
              )}
            >
              <Icon className="h-4 w-4" />
            </span>
            <span>
              <p className="text-sm font-semibold leading-tight">{item.title}</p>
              <p className="text-xs text-muted-foreground">{item.description}</p>
            </span>
          </Link>
        )
      })}
    </aside>
  )
}
