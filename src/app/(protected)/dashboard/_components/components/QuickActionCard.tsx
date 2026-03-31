"use client"

import Link from "next/link"
import type { ComponentType } from "react"
import { Card, CardHeader } from "@/components/ui/card"

interface QuickActionCardProps {
  title: string
  description: string
  href: string
  badge: string
  icon: ComponentType<{ className?: string }>
}

export const QuickActionCard = ({
  title,
  description,
  href,
  badge,
  icon: Icon,
}: QuickActionCardProps) => (
  <Link
    href={href}
    className="block rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
  >
    <Card className="h-full rounded-2xl border-border/60 bg-card/80 transition hover:border-primary/60 hover:shadow-md">
      <CardHeader className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-base font-semibold">{title}</p>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Icon className="h-5 w-5" />
          </span>
        </div>
        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {badge}
        </span>
      </CardHeader>
    </Card>
  </Link>
)
