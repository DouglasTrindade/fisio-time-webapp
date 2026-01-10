"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ChevronLeft, ChevronRight, Plus } from "lucide-react"
import { TreatmentPlanListItem } from "./ListItem"
import { TreatmentPlanNew } from "./New"
import { TreatmentPlanEdit } from "./Edit"
import { useRecords, useCreateRecord } from "@/app/hooks/useRecords"
import { useUpdateRecord, useDeleteRecord } from "@/app/hooks/useRecord"
import type {
  TreatmentPlan,
  TreatmentPlanCreateInput,
  TreatmentPlanFilters,
  TreatmentPlanUpdateInput,
} from "@/app/types/treatment-plan"
import type { Patient } from "@/app/types/patient"
import { TreatmentPlansFilters } from "./Filters"
import { treatmentPlansCrudConfig } from "./config"

interface TreatmentPlansProps {
  initialPatientId?: string
  initialAttendanceId?: string
  initialPatientName?: string | null
  initialAttendanceLabel?: string | null
}

export const TreatmentPlans = ({
  initialPatientId,
  initialAttendanceId,
  initialPatientName,
  initialAttendanceLabel,
}: TreatmentPlansProps) => {
  const [filters, setFilters] = useState<TreatmentPlanFilters>(() => ({
    ...treatmentPlansCrudConfig.defaultFilters,
    ...(initialPatientId ? { patientId: initialPatientId } : {}),
    ...(initialAttendanceId ? { attendanceId: initialAttendanceId } : {}),
  }))

  const filterParams = useMemo(() => ({ ...filters }), [filters])
  const {
    records,
    isLoading,
    isFetching,
    pagination,
  } = useRecords<TreatmentPlan>(treatmentPlansCrudConfig.endpoint, filterParams)

  const {
    records: patientOptions,
    isLoading: isLoadingPatients,
  } = useRecords<Patient>("/patients", {
    limit: 100,
    page: 1,
    sortBy: "name",
    sortOrder: "asc",
  })

  const createMutation = useCreateRecord<TreatmentPlan, TreatmentPlanCreateInput>(
    treatmentPlansCrudConfig.endpoint,
  )
  const updateMutation = useUpdateRecord<TreatmentPlan, TreatmentPlanUpdateInput>(
    treatmentPlansCrudConfig.endpoint,
  )
  const deleteMutation = useDeleteRecord(treatmentPlansCrudConfig.endpoint)

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null)

  const openNew = useCallback(() => {
    setEditingPlanId(null)
    setIsDialogOpen(true)
  }, [])

  const openEdit = useCallback((id: string) => {
    setEditingPlanId(id)
    setIsDialogOpen(true)
  }, [])

  const closeDialog = useCallback(() => {
    setIsDialogOpen(false)
    setEditingPlanId(null)
  }, [])

  const handleSearch = useCallback((value: string) => {
    setFilters((previous) => ({
      ...previous,
      search: value,
      page: 1,
    }))
  }, [])

  const handlePatientFilter = useCallback((patientId: string) => {
    setFilters((previous) => ({
      ...previous,
      patientId,
      attendanceId: "",
      page: 1,
    }))
  }, [])

  const handleSortChange = useCallback((value: string) => {
    const [field, order] = value.split("-")
    setFilters((previous) => ({
      ...previous,
      sortBy: field as TreatmentPlanFilters["sortBy"],
      sortOrder: (order as "asc" | "desc") ?? "desc",
      page: 1,
    }))
  }, [])

  const handlePageChange = useCallback((page: number) => {
    setFilters((previous) => ({
      ...previous,
      page,
    }))
  }, [])

  const handleCreate = useCallback(
    (data: TreatmentPlanCreateInput) => createMutation.mutateAsync(data),
    [createMutation],
  )

  const handleUpdate = useCallback(
    (id: string, data: TreatmentPlanUpdateInput) =>
      updateMutation.mutateAsync({ id, data }),
    [updateMutation],
  )

  const handleDelete = useCallback(
    (id: string) => deleteMutation.mutateAsync(id),
    [deleteMutation],
  )

  const [prefillContext, setPrefillContext] = useState<{
    patientId?: string
    attendanceId?: string
    patientName?: string | null
    attendanceLabel?: string | null
  } | null>(() =>
    initialAttendanceId
      ? {
          patientId: initialPatientId,
          attendanceId: initialAttendanceId,
          patientName: initialPatientName ?? null,
          attendanceLabel: initialAttendanceLabel ?? null,
        }
      : null,
  )
  const openedAttendanceRef = useRef<string | null>(null)

  useEffect(() => {
    if (!prefillContext) {
      openedAttendanceRef.current = null
      if (filters.attendanceId) {
        setFilters((previous) => ({
          ...previous,
          attendanceId: "",
        }))
      }
      return
    }

    if (
      prefillContext.attendanceId &&
      filters.attendanceId !== prefillContext.attendanceId
    ) {
      setFilters((previous) => ({
        ...previous,
        attendanceId: prefillContext.attendanceId,
        page: 1,
      }))
    }
  }, [filters.attendanceId, prefillContext, setFilters])

  const targetedPlan = prefillContext
    ? records.find((plan) => plan.attendanceId === prefillContext.attendanceId)
    : undefined

  useEffect(() => {
    if (
      !prefillContext ||
      !prefillContext.attendanceId ||
      openedAttendanceRef.current === prefillContext.attendanceId ||
      isLoading ||
      isFetching
    ) {
      return
    }

    if (targetedPlan) {
      openEdit(targetedPlan.id)
    } else {
      openNew()
    }
    openedAttendanceRef.current = prefillContext.attendanceId
  }, [isFetching, isLoading, openEdit, openNew, prefillContext, targetedPlan])

  const handleDialogClose = useCallback(() => {
    closeDialog()
    if (prefillContext) {
      setPrefillContext(null)
    }
  }, [closeDialog, prefillContext])

  const patientFilterValue = (filters.patientId as string) ?? ""
  const sortValue = `${filters.sortBy ?? "createdAt"}-${filters.sortOrder ?? "desc"}`
  const totalPlans = pagination?.total ?? records.length
  const searchValue = (filters.search as string) ?? ""
  const defaultPatientForForm =
    typeof filters.patientId === "string" && filters.patientId.length > 0
      ? filters.patientId
      : undefined

  const patientSelectOptions = useMemo(
    () =>
      patientOptions.map((patient) => ({
        value: patient.id,
        label: patient.name ?? "Paciente sem nome",
      })),
    [patientOptions],
  )

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Planos de tratamento</h1>
          <p className="text-muted-foreground">
            {totalPlans} plano{totalPlans === 1 ? "" : "s"} cadastrado
            {totalPlans === 1 ? "" : "s"}
          </p>
        </div>
        <Button onClick={openNew}>
          <Plus className="mr-2 h-4 w-4" />
          Novo plano
        </Button>
      </div>

      <TreatmentPlansFilters
        search={searchValue}
        onSearch={handleSearch}
        patientValue={patientFilterValue}
        onPatientChange={handlePatientFilter}
        patientOptions={patientSelectOptions}
        isPatientDisabled={isLoadingPatients}
        sortValue={sortValue}
        onSortChange={handleSortChange}
      />

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Plano</TableHead>
              <TableHead>Paciente</TableHead>
              <TableHead>Qtd.</TableHead>
              <TableHead>Atualizado em</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 4 }).map((_, index) => (
                <TableRow key={`skeleton-${index}`}>
                  <TableCell>
                    <Skeleton className="mb-2 h-4 w-48" />
                    <Skeleton className="h-3 w-64" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-40" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-10" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="ml-auto h-8 w-8" />
                  </TableCell>
                </TableRow>
              ))
            ) : records.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-10 text-center text-muted-foreground">
                  Nenhum plano de tratamento encontrado
                </TableCell>
              </TableRow>
            ) : (
              records.map((plan) => (
                <TreatmentPlanListItem
                  key={plan.id}
                  plan={plan}
                  onEdit={openEdit}
                  onDelete={handleDelete}
                  isDeleting={deleteMutation.isPending}
                />
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {pagination && (
        <div className="flex flex-col gap-3 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
          <p>
            Mostrando {(pagination.page - 1) * pagination.limit + 1} a{" "}
            {Math.min(pagination.page * pagination.limit, pagination.total)} de{" "}
            {pagination.total}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={!pagination.hasPrev}
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              Anterior
            </Button>
            <span>
              Página {pagination.page} de {pagination.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={!pagination.hasNext}
            >
              Próxima
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      <Dialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            handleDialogClose()
          }
        }}
      >
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingPlanId ? "Editar plano de tratamento" : "Novo plano de tratamento"}
            </DialogTitle>
          </DialogHeader>
          {editingPlanId ? (
            <TreatmentPlanEdit
              planId={editingPlanId}
              patients={patientOptions}
              isLoadingPatients={isLoadingPatients}
              onSuccess={handleDialogClose}
              onUpdate={handleUpdate}
              isUpdating={updateMutation.isPending}
            />
          ) : (
            <TreatmentPlanNew
              patients={patientOptions}
              isLoadingPatients={isLoadingPatients}
              defaultPatientId={prefillContext?.patientId ?? defaultPatientForForm}
              defaultAttendanceId={prefillContext?.attendanceId}
              lockedPatientId={prefillContext?.patientId}
              lockedPatientName={prefillContext?.patientName}
              lockedAttendanceId={prefillContext?.attendanceId}
              lockedAttendanceLabel={prefillContext?.attendanceLabel ?? undefined}
              onSuccess={handleDialogClose}
              onCreate={handleCreate}
              isCreating={createMutation.isPending}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
