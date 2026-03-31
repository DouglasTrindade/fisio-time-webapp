"use client"

import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import type { Appointment } from "@/types/appointment"
import { formatDate, formatTime } from "../dashboardUtils"
import { STATUS_STYLE } from "../dashboardConstants"

interface UpcomingAppointmentsSectionProps {
  appointments: Appointment[]
  isLoading: boolean
}

export const UpcomingAppointmentsSection = ({
  appointments,
  isLoading,
}: UpcomingAppointmentsSectionProps) => (
  <Card>
    <CardHeader className="flex flex-wrap items-center justify-between gap-4">
      <div>
        <CardTitle>Próximos agendamentos</CardTitle>
        <p className="text-sm text-muted-foreground">
          Visão rápida dos próximos dias
        </p>
      </div>
      <Button asChild size="sm" variant="ghost">
        <Link href="/agendamentos" className="text-primary">
          Ver calendário
        </Link>
      </Button>
    </CardHeader>
    <CardContent>
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, idx) => (
            <Skeleton key={idx} className="h-12 w-full" />
          ))}
        </div>
      ) : appointments.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Nenhum compromisso futuro encontrado.
        </p>
      ) : (
        <div className="space-y-4">
          {appointments.map((appointment) => (
            <div key={appointment.id} className="flex items-center justify-between">
              <div>
                <p className="font-medium">{appointment.name}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>
                    {new Date(appointment.date).toLocaleDateString("pt-BR", {
                      day: "2-digit",
                      month: "short",
                    })}{" "}
                    às {formatTime(appointment.date)}
                  </span>
                  <Badge variant="outline" className="text-[10px] uppercase">
                    {STATUS_STYLE[appointment.status]?.label ?? "Status"}
                  </Badge>
                </div>
              </div>
              <span className="text-sm font-semibold">
                {formatDate(new Date(appointment.date))}
              </span>
            </div>
          ))}
        </div>
      )}
    </CardContent>
  </Card>
)
