"use client"

import Link from "next/link"
import { Bell } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import type { Appointment } from "@/types/appointment"
import { formatTime } from "../dashboardUtils"
import { STATUS_STYLE } from "../dashboardConstants"

interface TodayAgendaSectionProps {
  appointments: Appointment[]
  isLoading: boolean
}

export const TodayAgendaSection = ({
  appointments,
  isLoading,
}: TodayAgendaSectionProps) => (
  <Card className="lg:col-span-2">
    <CardHeader className="flex flex-wrap items-center justify-between gap-4">
      <div>
        <CardTitle className="flex items-center gap-2">
          Agenda de hoje
          <Badge variant="secondary" className="text-xs font-medium">
            {appointments.length} compromisso{appointments.length === 1 ? "" : "s"}
          </Badge>
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Inclui todos os profissionais conectados
        </p>
      </div>
      <Button asChild size="sm" variant="outline">
        <Link href="/agendamentos">
          <Bell className="mr-2 h-4 w-4" />
          Ver agenda completa
        </Link>
      </Button>
    </CardHeader>
    <CardContent>
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, idx) => (
            <Skeleton key={idx} className="h-12 w-full" />
          ))}
        </div>
      ) : appointments.length === 0 ? (
        <div className="py-6 text-center text-sm text-muted-foreground">
          Nenhum agendamento para hoje.
        </div>
      ) : (
        <div className="space-y-4">
          {appointments.map((appointment) => (
            <div
              key={appointment.id}
              className="flex items-center justify-between rounded-lg border px-4 py-3"
            >
              <div>
                <p className="font-medium">{appointment.name}</p>
                <p className="text-xs text-muted-foreground">{appointment.phone}</p>
              </div>
              <div className="space-y-1 text-right">
                <p className="text-sm font-semibold">{formatTime(appointment.date)}</p>
                <Badge
                  className={`text-xs ${STATUS_STYLE[appointment.status]?.badgeClass ??
                    "bg-muted text-foreground"
                    }`}
                >
                  {STATUS_STYLE[appointment.status]?.label ?? "Status"}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      )}
    </CardContent>
  </Card>
)
