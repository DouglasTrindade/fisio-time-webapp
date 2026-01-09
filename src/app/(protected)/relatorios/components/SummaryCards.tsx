"use client"

import { DashboardCard } from "./DashboardCard"

export type SummaryCardData = {
  label: string
  value: number | string
  helper: string
}

interface SummaryCardsProps {
  cards: Array<SummaryCardData | null>
}

export const SummaryCards = ({ cards }: SummaryCardsProps) => {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {cards.map((card, index) => (
        <DashboardCard key={index} label={card?.label} value={card?.value ?? null} helper={card?.helper} />
      ))}
    </div>
  )
}
