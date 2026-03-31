"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { AboutPatient } from "./AboutPatient"
import { TimelineCard } from "./TimelineCard"
import { Filters } from "./Filters"
import { PatientsEdit } from "../../_components/Edit"
import { HistoryAttendanceModal } from "./Modal"
import { AttendanceType as PrismaAttendanceType } from "@prisma/client"
import { apiRequest } from "@/services/api"
import type { ApiResponse } from "@/types/api"
import { toast } from "sonner"
import { useModalContext } from "@/contexts/ModalContext"
import { Button } from "@/components/ui/button"
import type {
  HistoryEntry,
  HistoryFilters,
  PatientSummary,
  ProfessionalOption,
} from "./types"

interface PatientHistoryViewProps {
  patient: PatientSummary
  entries: HistoryEntry[]
  professionals: ProfessionalOption[]
}

const defaultFilters: HistoryFilters = {
  status: "all",
  professionalId: "all",
  period: {
    from: "",
    to: "",
  },
}

interface PatientEditDialogProps {
  patientId: string
  onHide?: () => void
  onSuccess?: () => void
}

const PatientEditDialog = ({ patientId, onHide, onSuccess }: PatientEditDialogProps) => (
  <DialogContent className="sm:max-w-3xl">
    <DialogHeader>
      <DialogTitle>Editar paciente</DialogTitle>
    </DialogHeader>
    <PatientsEdit
      patientId={patientId}
      onHide={onHide}
      onSuccess={onSuccess}
    />
  </DialogContent>
)

interface HistoryAttendanceDialogProps {
  type: PrismaAttendanceType
  patient: PatientSummary
  attendanceId?: string
  onHide?: () => void
  onSuccess?: () => void
}

const HistoryAttendanceDialog = ({
  type,
  patient,
  attendanceId,
  onHide,
  onSuccess,
}: HistoryAttendanceDialogProps) => (
  <DialogContent className="sm:max-w-2xl">
    <DialogHeader>
      <DialogTitle>
        {attendanceId
          ? type === PrismaAttendanceType.EVOLUTION
            ? "Editar evolução"
            : "Editar avaliação"
          : type === PrismaAttendanceType.EVOLUTION
            ? "Registrar evolução"
            : "Registrar avaliação"}
      </DialogTitle>
    </DialogHeader>
    <HistoryAttendanceModal
      type={type}
      patient={patient}
      attendanceId={attendanceId}
      onHide={onHide}
      onSuccess={onSuccess}
    />
  </DialogContent>
)

interface DeleteAttendanceDialogProps {
  entry: HistoryEntry
  onHide?: () => void
  onSuccess?: () => void
}

const DeleteAttendanceDialog = ({ entry, onHide, onSuccess }: DeleteAttendanceDialogProps) => {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await apiRequest<ApiResponse<null>>(`/attendances/${entry.id}`, {
        method: "DELETE",
      })
      toast.success("Atendimento excluído com sucesso")
      onSuccess?.()
      onHide?.()
    } catch (error) {
      console.error(error)
      toast.error("Erro ao excluir atendimento")
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Excluir atendimento</DialogTitle>
      </DialogHeader>
      <p className="text-sm text-muted-foreground">
        {entry.hasTreatmentPlan
          ? `Esta ${entry.type === "evaluation" ? "avaliação" : "evolução"} tem um plano de tratamento vinculado. Tem certeza que deseja excluir?`
          : "Tem certeza que deseja excluir este registro? Essa ação não pode ser desfeita."}
      </p>
      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={() => onHide?.()} disabled={isDeleting}>
          Cancelar
        </Button>
        <Button type="button" variant="destructive" onClick={handleDelete} disabled={isDeleting}>
          {isDeleting ? "Excluindo..." : "Excluir"}
        </Button>
      </div>
    </DialogContent>
  )
}

export const PatientShow = ({ patient, entries, professionals }: PatientHistoryViewProps) => {
  const router = useRouter()
  const [filters, setFilters] = useState<HistoryFilters>(defaultFilters)
  const { openModal } = useModalContext()

  const filteredEntries = useMemo(() => {
    return entries.filter((entry) => {
      if (filters.status !== "all" && entry.type !== filters.status) {
        return false
      }
      if (
        filters.professionalId !== "all" &&
        entry.professionalId !== filters.professionalId
      ) {
        return false
      }
      if (filters.period.from) {
        const fromDate = new Date(filters.period.from)
        if (new Date(entry.date) < fromDate) {
          return false
        }
      }
      if (filters.period.to) {
        const toDate = new Date(filters.period.to)
        if (new Date(entry.date) > toDate) {
          return false
        }
      }
      return true
    })
  }, [entries, filters])

  const handleResetFilters = () => setFilters(defaultFilters)
  const handleOpenTreatmentPlan = (entry: HistoryEntry) => {
    const dateLabel = new Date(entry.date).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
    const params = new URLSearchParams({
      patientId: patient.id,
      attendanceId: entry.id,
      patientName: patient.name,
      attendanceLabel: `${dateLabel} • ${entry.title}`,
    })
    router.push(`/tratamentos?${params.toString()}`)
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-col gap-6 lg:flex-row">
          <aside className="lg:w-2/5">
            <AboutPatient
              patient={patient}
              onEdit={() =>
                openModal(
                  { modal: PatientEditDialog },
                  { patientId: patient.id, onSuccess: () => router.refresh() }
                )
              }
              onCreateEvaluation={() =>
                openModal(
                  { modal: HistoryAttendanceDialog },
                  {
                    type: PrismaAttendanceType.EVALUATION,
                    patient,
                    onSuccess: () => router.refresh(),
                  }
                )
              }
              onCreateEvolution={() =>
                openModal(
                  { modal: HistoryAttendanceDialog },
                  {
                    type: PrismaAttendanceType.EVOLUTION,
                    patient,
                    onSuccess: () => router.refresh(),
                  }
                )
              }
            />
          </aside>

          <section className="flex-1 space-y-4">
            <Filters
              status={filters.status}
              onStatusChange={(status) => setFilters((previous) => ({ ...previous, status }))}
              professionalId={filters.professionalId}
              onProfessionalChange={(professionalId) => setFilters((previous) => ({ ...previous, professionalId }))}
              professionals={professionals}
              period={filters.period}
              onPeriodChange={(period) => setFilters((previous) => ({ ...previous, period }))}
              onReset={handleResetFilters} />

            <div className="space-y-4">
              {filteredEntries.length === 0 ? (
                <Card>
                  <CardContent className="py-10 text-center text-muted-foreground">
                    Nenhum registro encontrado para os filtros selecionados.
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {filteredEntries.map((entry, index) => (
                    <TimelineCard
                      key={entry.id}
                      entry={entry}
                      isFirst={index === 0}
                      isLast={index === filteredEntries.length - 1}
                      onNavigate={() => router.push(`/atendimentos/${entry.id}`)}
                      onEdit={(item) =>
                        openModal(
                          { modal: HistoryAttendanceDialog },
                          {
                            type:
                              item.type === "evolution"
                                ? PrismaAttendanceType.EVOLUTION
                                : PrismaAttendanceType.EVALUATION,
                            patient,
                            attendanceId: item.id,
                            onSuccess: () => router.refresh(),
                          }
                        )
                      }
                      onDelete={(item) =>
                        openModal(
                          { modal: DeleteAttendanceDialog },
                          { entry: item, onSuccess: () => router.refresh() }
                        )
                      }
                      onOpenTreatmentPlan={handleOpenTreatmentPlan}
                    />
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </>
  )
}
