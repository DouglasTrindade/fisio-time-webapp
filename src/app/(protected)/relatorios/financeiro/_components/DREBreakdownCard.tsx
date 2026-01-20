"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { FinanceDRESection } from "@/types/reports"

interface DREBreakdownCardProps {
  dre?: FinanceDRESection
  isLoading: boolean
}

const currency = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
})

type RowDescriptor = {
  key: keyof FinanceDRESection
  label: string
  prefix?: string
  highlight?: boolean
}

const rows: RowDescriptor[] = [
  { key: "grossRevenue", label: "Receita bruta" },
  { key: "deductions", label: "(-) Deduções e pendências", prefix: "-" },
  { key: "netRevenue", label: "= Receita líquida", highlight: true },
  { key: "operationalExpenses", label: "(-) Despesas operacionais", prefix: "-" },
  { key: "operationalResult", label: "= Resultado operacional", highlight: true },
  { key: "netIncome", label: "Resultado líquido", highlight: true },
]

export const DREBreakdownCard = ({ dre, isLoading }: DREBreakdownCardProps) => {
  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle>Estrutura do DRE</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {isLoading && !dre ? (
          <div className="h-[260px] animate-pulse rounded-lg border border-dashed border-border/60 bg-background/40" />
        ) : null}
        {!isLoading && !dre ? (
          <p className="text-sm text-muted-foreground">
            Nenhum lançamento disponível para gerar o demonstrativo.
          </p>
        ) : null}
        {dre ? (
          <div className="space-y-2 text-sm">
            {rows.map((row) => (
              <div
                key={row.key}
                className={`flex items-center justify-between rounded-lg border border-border/40 px-4 py-2 ${
                  row.highlight ? "bg-primary/5 font-medium text-primary" : "text-foreground"
                }`}
              >
                <span>{row.label}</span>
                <span>
                  {row.prefix ? `${row.prefix} ` : ""}
                  {currency.format(dre[row.key as keyof FinanceDRESection])}
                </span>
              </div>
            ))}
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}
