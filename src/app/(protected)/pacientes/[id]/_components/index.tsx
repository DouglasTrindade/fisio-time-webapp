"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { AboutPatient } from "./AboutPatient"
import { TimelineCard } from "./TimelineCard"
import { Filters } from "./Filters"
import { PatientsEdit } from "../../_components/Edit"
import { HistoryAttendanceModal } from "./Modal"
import { AttendanceType as PrismaAttendanceType } from "@prisma/client"
import { apiRequest } from "@/services/api"
import type { ApiResponse } from "@/types/api"
import { toast } from "sonner"
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

export const PatientShow = ({ patient, entries, professionals }: PatientHistoryViewProps) => {
  const router = useRouter()
  const [filters, setFilters] = useState<HistoryFilters>(defaultFilters)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [newAttendanceType, setNewAttendanceType] = useState<PrismaAttendanceType | null>(null)
  const [attendanceToEdit, setAttendanceToEdit] = useState<HistoryEntry | null>(null)
  const [attendanceToDelete, setAttendanceToDelete] = useState<HistoryEntry | null>(null)
  const [isDeletingAttendance, setIsDeletingAttendance] = useState(false)

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
              onEdit={() => setIsEditOpen(true)}
              onCreateEvaluation={() => setNewAttendanceType(PrismaAttendanceType.EVALUATION)}
              onCreateEvolution={() => setNewAttendanceType(PrismaAttendanceType.EVOLUTION)}
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
                      onEdit={(item) => setAttendanceToEdit(item)}
                      onDelete={(item) => setAttendanceToDelete(item)}
                      onOpenTreatmentPlan={handleOpenTreatmentPlan}
                    />
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>
      </div>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Editar paciente</DialogTitle>
          </DialogHeader>
          <PatientsEdit
            patientId={patient.id}
            onClose={() => setIsEditOpen(false)}
            onSuccess={() => {
              router.refresh()
            }}
          />
        </DialogContent>
      </Dialog>

      <Dialog
        open={attendanceToEdit !== null}
        onOpenChange={(open) => {
          if (!open) setAttendanceToEdit(null)
        }}
      >
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {attendanceToEdit?.type === "evolution"
                ? "Editar evolução"
                : "Editar avaliação"}
            </DialogTitle>
          </DialogHeader>
          {attendanceToEdit && (
            <HistoryAttendanceModal
              type={
                attendanceToEdit.type === "evolution"
                  ? PrismaAttendanceType.EVOLUTION
                  : PrismaAttendanceType.EVALUATION
              }
              patient={patient}
              open={attendanceToEdit !== null}
              attendanceId={attendanceToEdit.id}
              onClose={() => setAttendanceToEdit(null)}
              onSuccess={() => {
                router.refresh()
                setAttendanceToEdit(null)
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={attendanceToDelete !== null}
        onOpenChange={(open) => {
          if (!open) setAttendanceToDelete(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir atendimento</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este registro? Essa ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeletingAttendance}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (!attendanceToDelete) return
                setIsDeletingAttendance(true)
                try {
                  await apiRequest<ApiResponse<null>>(
                    `/attendances/${attendanceToDelete.id}`,
                    { method: "DELETE" },
                  )
                  toast.success("Atendimento excluído com sucesso")
                  setAttendanceToDelete(null)
                  router.refresh()
                } catch (error) {
                  console.error(error)
                  toast.error("Erro ao excluir atendimento")
                } finally {
                  setIsDeletingAttendance(false)
                }
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isDeletingAttendance}
            >
              {isDeletingAttendance ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog
        open={newAttendanceType !== null}
        onOpenChange={(open) => {
          if (!open) setNewAttendanceType(null)
        }}
      >
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {newAttendanceType === PrismaAttendanceType.EVOLUTION
                ? "Registrar evolução"
                : "Registrar avaliação"}
            </DialogTitle>
          </DialogHeader>
          {newAttendanceType && (
            <HistoryAttendanceModal
              type={newAttendanceType}
              patient={patient}
              open={newAttendanceType !== null}
              onClose={() => setNewAttendanceType(null)}
              onSuccess={() => router.refresh()}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
