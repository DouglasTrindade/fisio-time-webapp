"use client"

import Link from "next/link"
import { Gift } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { BIRTHDAY_WINDOW_DAYS } from "../dashboardConstants"
import type { UpcomingBirthday } from "../dashboardUtils"
import { formatDate } from "../dashboardUtils"

interface UpcomingBirthdaysSectionProps {
  patients: UpcomingBirthday[]
  isLoading: boolean
}

export const UpcomingBirthdaysSection = ({
  patients,
  isLoading,
}: UpcomingBirthdaysSectionProps) => (
  <Card>
    <CardHeader className="flex flex-wrap items-center justify-between gap-4">
      <div>
        <CardTitle>Aniversários próximos</CardTitle>
        <p className="text-sm text-muted-foreground">
          Pacientes com aniversário nos próximos {BIRTHDAY_WINDOW_DAYS} dias
        </p>
      </div>
      <Button asChild size="sm" variant="outline">
        <Link href="/pacientes">Enviar felicitação</Link>
      </Button>
    </CardHeader>
    <CardContent>
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, idx) => (
            <Skeleton key={idx} className="h-10 w-full" />
          ))}
        </div>
      ) : patients.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Nenhum aniversário no radar.
        </p>
      ) : (
        <div className="space-y-4">
          {patients.map((patient) => (
            <div
              key={patient.id}
              className="flex items-center justify-between rounded-lg border px-4 py-3"
            >
              <div>
                <p className="font-medium">{patient.name}</p>
                <p className="flex items-center gap-1 text-xs text-muted-foreground">
                  {formatDate(patient.nextBirthday)} · em {patient.diffDays} dia
                  {patient.diffDays === 1 ? "" : "s"}
                </p>
              </div>
              <Badge className="bg-pink-100 text-[11px] text-pink-700">
                <Gift className="mr-1 h-3 w-3" />
                {patient.diffDays}d
              </Badge>
            </div>
          ))}
        </div>
      )}
    </CardContent>
  </Card>
)
