"use client"

import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { INACTIVE_THRESHOLD_DAYS } from "../dashboardConstants"
import type { InactivePatient } from "../dashboardUtils"

interface InactivePatientsSectionProps {
  patients: InactivePatient[]
  isLoading: boolean
}

export const InactivePatientsSection = ({
  patients,
  isLoading,
}: InactivePatientsSectionProps) => (
  <Card>
    <CardHeader className="flex flex-wrap items-center justify-between gap-4">
      <div>
        <CardTitle>Alertas de retorno</CardTitle>
        <p className="text-sm text-muted-foreground">
          Pacientes sem retorno há mais de {INACTIVE_THRESHOLD_DAYS} dias
        </p>
      </div>
      <Button asChild size="sm" variant="outline">
        <Link href="/pacientes">Ver pacientes</Link>
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
          Nenhum paciente em atraso. Continue assim!
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
                <p className="text-xs text-muted-foreground">
                  Último contato há {patient.days} dia
                  {patient.days === 1 ? "" : "s"}
                </p>
              </div>
              <Badge className="bg-amber-100 text-[11px] text-amber-800">
                {patient.days} dias
              </Badge>
            </div>
          ))}
        </div>
      )}
    </CardContent>
  </Card>
)
