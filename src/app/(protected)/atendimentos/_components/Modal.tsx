"use client"

import { useEffect, useMemo, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import type { AttendanceType, AttendanceAttachment } from "@/types/attendance"
import { toast } from "sonner"
import { useSession } from "next-auth/react"

import { attendanceFormSchema, type AttendanceFormSchema as AttendanceFormValues } from "./Fields/schema"
import { useRecords } from "@/hooks/useRecords"
import type { Patient } from "@/types/patient"
import type { Attendance } from "@/types/attendance"
import { useAttendancesContext } from "@/contexts/AttendancesContext"
import { handleApiError } from "@/services/handleApiError"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Form } from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { EvaluationFields } from "./Fields/Evaluation"
import { EvolutionFields } from "./Fields/Evolution"
import { FinanceFields } from "./Fields/Finance"
import { cn } from "@/lib/utils"
import { AttendanceType as PrismaAttendanceType } from "@prisma/client"

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

const normalizeDialogType = (
  value?: AttendanceType | string | null,
): AttendanceType => {
  if (!value) {
    return PrismaAttendanceType.EVALUATION
  }
  const normalized =
    typeof value === "string" ? value.toLowerCase() : value.toString().toLowerCase()
  return normalized === "evolution"
    ? PrismaAttendanceType.EVOLUTION
    : PrismaAttendanceType.EVALUATION
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

const normalizeNullableText = (value?: string | null) => {
  if (!value) return null
  const trimmed = value.trim()
  return trimmed.length ? trimmed : null
}

const formatFinancePaidAtDate = (isoDate?: string | null) => {
  if (!isoDate) return ""
  const date = new Date(isoDate)
  if (Number.isNaN(date.getTime())) return ""
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
  return localDate.toISOString().slice(0, 10)
}

const getFinanceDefaults = (attendance?: Attendance | null) => {
  if (!attendance || !attendance.launchToFinance) {
    return {
      launchToFinance: false,
      financeAmount: "",
      financePaymentMethod: "",
      financeAccount: "",
      financePaid: false,
      financePaidAt: "",
    }
  }

  return {
    launchToFinance: true,
    financeAmount: attendance.financeAmount ?? "",
    financePaymentMethod: attendance.financePaymentMethod ?? "",
    financeAccount: attendance.financeAccount ?? "",
    financePaid: attendance.financePaid ?? false,
    financePaidAt: formatFinancePaidAtDate(attendance.financePaidAt ?? null),
  }
}

export const AttendanceDialog = ({
  open,
  onOpenChange,
  type,
  attendance,
}: AttendanceDialogProps) => {
  const [activeTab, setActiveTab] = useState<"clinical" | "finance">("clinical")
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
      cidCode: "",
      cidDescription: "",
      cifCode: "",
      cifDescription: "",
      evolutionNotes: "",
      attachments: [],
      ...getFinanceDefaults(),
    },
  })

  useEffect(() => {
    if (open) {
      setActiveTab("clinical")
    }
    if (!open) return

    const normalizeAttachments = (
      attachments: AttendanceAttachment[] | null | undefined,
    ): AttendanceFormValues["attachments"] =>
      attachments?.map((item) => ({
        id: item.id,
        name: item.name,
        size: item.size,
        type: item.type,
        url: item.url ?? undefined,
        content: item.content ?? undefined,
      })) ?? []

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
        cidCode: attendance.cidCode ?? "",
        cidDescription: attendance.cidDescription ?? "",
        cifCode: attendance.cifCode ?? "",
        cifDescription: attendance.cifDescription ?? "",
        evolutionNotes: attendance.evolutionNotes ?? "",
        attachments: normalizeAttachments(attendance.attachments),
        ...getFinanceDefaults(attendance),
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
        cidCode: "",
        cidDescription: "",
        cifCode: "",
        cifDescription: "",
        evolutionNotes: "",
        attachments: [],
        ...getFinanceDefaults(),
      })
    }
  }, [attendance, form, open])

  const isSubmitting = isCreating || isUpdating
  const dialogType = attendance ? normalizeDialogType(attendance.type) : normalizeDialogType(type)
  const typeLabel = getTypeLabel(dialogType)
  const isEvolution = dialogType === PrismaAttendanceType.EVOLUTION
  const title = attendance ? "Editar atendimento" : `Nova ${typeLabel.toLowerCase()}`

  const onSubmit = async (values: AttendanceFormValues) => {
    if (!professionalId) {
      toast.error("Não foi possível identificar o profissional logado.")
      return
    }

    const financePayload = values.launchToFinance
      ? {
          launchToFinance: true,
          financeAmount: normalizeNullableText(values.financeAmount),
          financePaymentMethod: normalizeNullableText(values.financePaymentMethod),
          financeAccount: normalizeNullableText(values.financeAccount),
          financePaid: values.financePaid,
          financePaidAt: normalizeNullableText(values.financePaidAt),
        }
      : {
          launchToFinance: false,
          financeAmount: null,
          financePaymentMethod: null,
          financeAccount: null,
          financePaid: false,
          financePaidAt: null,
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
      cidCode: values.cidCode?.trim() || null,
      cidDescription: values.cidDescription?.trim() || null,
      cifCode: values.cifCode?.trim() || null,
      cifDescription: values.cifDescription?.trim() || null,
      evolutionNotes: values.evolutionNotes?.trim() || null,
      attachments: values.attachments ?? [],
      ...financePayload,
    }
    const payload = attendance ? basePayload : { ...basePayload, type: dialogType }
    const creationPayload = { ...basePayload, type: dialogType }
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
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <div className="rounded-lg border bg-muted/30 p-1 text-sm font-medium text-muted-foreground">
              <div className="grid grid-cols-2 gap-1">
                <button
                  type="button"
                  onClick={() => setActiveTab("clinical")}
                  className={cn(
                    "rounded-md px-3 py-2 transition-colors",
                    activeTab === "clinical"
                      ? "bg-background text-foreground shadow-sm"
                      : "hover:bg-muted"
                  )}
                >
                  {isEvolution ? "Dados clínicos" : "Avaliação"}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("finance")}
                  className={cn(
                    "rounded-md px-3 py-2 transition-colors",
                    activeTab === "finance"
                      ? "bg-background text-foreground shadow-sm"
                      : "hover:bg-muted"
                  )}
                >
                  Financeiro
                </button>
              </div>
            </div>

            {activeTab === "clinical" ? (
              isEvolution ? (
                <EvolutionFields
                  form={form}
                  patients={patients}
                  isLoadingPatients={isLoadingPatients}
                />
              ) : (
                <EvaluationFields
                  form={form}
                  patients={patients}
                  isLoadingPatients={isLoadingPatients}
                />
              )
            ) : (
              <FinanceFields form={form} />
            )}

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
