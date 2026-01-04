"use client"

import { useEffect, useMemo } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import type { AttendanceType } from "@/app/types/attendance"
import { toast } from "sonner"
import { useSession } from "next-auth/react"

import { attendanceFormSchema, type AttendanceFormSchema as AttendanceFormValues } from "./schema"
import { useRecords } from "@/app/hooks/useRecords"
import type { Patient } from "@/app/types/patient"
import type { Attendance } from "@/app/types/attendance"
import { useAttendancesContext } from "@/contexts/AttendancesContext"
import { handleApiError } from "@/app/services/handleApiError"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Form } from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { EvaluationFields } from "./Fields/Evaluation"

interface AttendanceDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  type: AttendanceType
  attendance: Attendance | null
}

const typeLabels = {
  evaluation: "Avaliação",
  evolution: "Evolução",
} as const

const getTypeLabel = (type: AttendanceType) => {
  const key = type.toLowerCase() as keyof typeof typeLabels
  return typeLabels[key] ?? "Atendimento"
}

const getDefaultDateParts = () => {
  const now = new Date()
  now.setSeconds(0, 0)
  const localDate = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
  return {
    date: localDate.toISOString().slice(0, 10),
    time: localDate.toISOString().slice(11, 16),
  }
}

const getDatePartsFromISO = (isoDate?: string) => {
  if (!isoDate) return getDefaultDateParts()
  const date = new Date(isoDate)
  if (Number.isNaN(date.getTime())) return getDefaultDateParts()
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
  return {
    date: localDate.toISOString().slice(0, 10),
    time: localDate.toISOString().slice(11, 16),
  }
}

const combineDateAndTime = (date: string, time: string) => {
  const iso = new Date(`${date}T${time}:00`)
  return iso.toISOString()
}

export const AttendanceDialog = ({
  open,
  onOpenChange,
  type,
  attendance,
}: AttendanceDialogProps) => {
  const { data: session } = useSession()
  const professionalId = session?.user?.id ?? ""
  const patientsQuery = useMemo(
    () => ({
      page: 1,
      limit: 100,
      sortBy: "name",
      sortOrder: "asc",
    }),
    []
  )
  const { records: patients, isLoading: isLoadingPatients } = useRecords<Patient>("/patients", patientsQuery)

  const {
    handleCreate,
    handleUpdate,
    isCreating,
    isUpdating,
  } = useAttendancesContext()

  const defaultDateParts = getDefaultDateParts()

  const form = useForm<AttendanceFormValues>({
    resolver: zodResolver(attendanceFormSchema),
    defaultValues: {
      patientId: "",
      date: defaultDateParts.date,
      time: defaultDateParts.time,
      mainComplaint: "",
      currentIllnessHistory: "",
      pastMedicalHistory: "",
      familyHistory: "",
      observations: "",
    },
  })

  useEffect(() => {
    if (!open) return

    if (attendance) {
      const { date, time } = getDatePartsFromISO(attendance.date)
      form.reset({
        patientId: attendance.patientId,
        date,
        time,
        mainComplaint: attendance.mainComplaint ?? "",
        currentIllnessHistory: attendance.currentIllnessHistory ?? "",
        pastMedicalHistory: attendance.pastMedicalHistory ?? "",
        familyHistory: attendance.familyHistory ?? "",
        observations: attendance.observations ?? "",
      })
    } else {
      const defaults = getDefaultDateParts()
      form.reset({
        patientId: "",
        date: defaults.date,
        time: defaults.time,
        mainComplaint: "",
        currentIllnessHistory: "",
        pastMedicalHistory: "",
        familyHistory: "",
        observations: "",
      })
    }
  }, [attendance, form, open])

  const isSubmitting = isCreating || isUpdating
  const typeLabel = getTypeLabel(type)
  const title = attendance ? "Editar atendimento" : `Nova ${typeLabel.toLowerCase()}`

  const onSubmit = async (values: AttendanceFormValues) => {
    if (!professionalId) {
      toast.error("Não foi possível identificar o profissional logado.")
      return
    }

    const basePayload = {
      patientId: values.patientId,
      professionalId,
      date: combineDateAndTime(values.date, values.time),
      mainComplaint: values.mainComplaint?.trim() || null,
      currentIllnessHistory: values.currentIllnessHistory?.trim() || null,
      pastMedicalHistory: values.pastMedicalHistory?.trim() || null,
      familyHistory: values.familyHistory?.trim() || null,
      observations: values.observations?.trim() || null,
    }
    const payload = attendance ? basePayload : { ...basePayload, type }
    const creationPayload = { ...basePayload, type }
    try {
      if (attendance) {
        await handleUpdate(attendance.id, payload)
      } else {
        await handleCreate(creationPayload)
      }
      onOpenChange(false)
    } catch (error) {
      handleApiError(error, attendance ? "Erro ao atualizar atendimento" : "Erro ao criar atendimento")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex flex-col gap-1">
            <span>{title}</span>
            <span className="text-sm font-normal text-muted-foreground">
              {typeLabel}
            </span>
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <EvaluationFields
              form={form}
              patients={patients}
              isLoadingPatients={isLoadingPatients}
            />

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting || !professionalId}>
                {isSubmitting ? "Salvando..." : "Salvar"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
