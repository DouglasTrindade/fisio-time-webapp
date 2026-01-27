"use client"

import Link from "next/link"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { getBillingStatusConfig } from "@/lib/billing/status"
import { cn } from "@/lib/utils"
import type { BillingSummary } from "@/types/billing"

import { currencyFormatter, formatBillingDate } from "../utils"
import { CancelSubscriptionButton } from "../dialogs/CancelSubscriptionButton"
import { ResumeSubscriptionButton } from "../dialogs/ResumeSubscriptionButton"

interface SummaryCardProps {
  summary?: BillingSummary
  isLoading: boolean
}

export const SummaryCard = ({ summary, isLoading }: SummaryCardProps) => (
  <Card className="border-border/70 bg-card/85 shadow-lg">
    <CardHeader className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <CardTitle>{summary?.planName ?? "Plano não encontrado"}</CardTitle>
        <CardDescription>
          {summary ? (
            summary.status === "inactive" ? (
              "Nenhuma assinatura ativa"
            ) : (
              <span>
                {(() => {
                  const config = getBillingStatusConfig(summary.status)
                  return (
                    <>
                      Status:
                      <span
                        className={cn(
                          "ml-2 inline-flex items-center rounded-full px-2 py-0.5 text-xs",
                          config.badgeClass,
                        )}
                      >
                        {config.label}
                      </span>
                    </>
                  )
                })()}
                <span className="ml-2">
                  Próxima cobrança em {formatBillingDate(summary.periodEndsAt)} •{" "}
                  {currencyFormatter.format(summary.amount)} / mês
                </span>
              </span>
            )
          ) : isLoading ? (
            <Skeleton className="h-4 w-48" />
          ) : (
            "Não foi possível carregar sua assinatura."
          )}
        </CardDescription>
      </div>
      {summary?.status === "inactive" ? (
        <Button asChild variant="outline">
          <Link href="/upgrade">Contratar plano</Link>
        </Button>
      ) : summary?.subscriptionId ? (
        <div className="flex flex-wrap gap-2">
          {summary.cancelAtPeriodEnd ? (
            <ResumeSubscriptionButton subscriptionId={summary.subscriptionId} />
          ) : (
            <CancelSubscriptionButton subscriptionId={summary.subscriptionId} />
          )}
          <Button asChild variant="outline">
            <Link href="/upgrade">Alterar plano</Link>
          </Button>
        </div>
      ) : null}
    </CardHeader>
    <CardContent />
  </Card>
)
