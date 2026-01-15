"use client"

import { useEffect, useMemo } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { AttendanceType as PrismaAttendanceType } from "@prisma/client"
import { useSession } from "next-auth/react"
import { toast } from "sonner"

import { Form } from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import {
  attendanceFormSchema,
  type AttendanceFormSchema,
} from "@/app/(protected)/atendimentos/_components/Fields/schema"
import {
  DEFAULT_PAYMENT_METHOD,
  normalizePaymentMethodSlug,
} from "@/app/(protected)/atendimentos/_components/utils"
import { EvaluationFields } from "@/app/(protected)/atendimentos/_components/Fields/Evaluation"
import { EvolutionFields } from "@/app/(protected)/atendimentos/_components/Fields/Evolution"
import type { PatientSummary } from "./types"
import type { Patient } from "@/types/patient"
import type { Attendance } from "@/types/attendance"
import type { ApiResponse } from "@/types/api"
import { apiRequest } from "@/services/api"
import { useRecord } from "@/hooks/useRecord"

const getDefaultDateParts = () => {
  const now = new Date()
  now.setSeconds(0, 0)
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
  return {
    date: local.toISOString().slice(0, 10),
    time: local.toISOString().slice(11, 16),
  }
}

const combineDateAndTime = (date: string, time: string) => {
  const iso = new Date(`${date}T${time}:00`)
  return iso.toISOString()
}

interface HistoryAttendanceDialogProps {
  type: PrismaAttendanceType
  patient: PatientSummary
  open: boolean
  onClose: () => void
  onSuccess?: () => void
  attendanceId?: string
}

export const HistoryAttendanceModal = ({
  type,
  patient,
  open,
  onClose,
  onSuccess,
  attendanceId,
}: HistoryAttendanceDialogProps) => {
  const { data: session } = useSession()
  const professionalId = session?.user?.id ?? ""

  const defaults = useMemo(() => getDefaultDateParts(), [])
  const form = useForm<AttendanceFormSchema>({
    resolver: zodResolver(attendanceFormSchema),
    defaultValues: {
      patientId: patient.id,
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
      launchToFinance: false,
      financeAmount: "",
      financePaymentMethod: DEFAULT_PAYMENT_METHOD,
      financeAccount: "",
      financePaid: false,
      financePaidAt: "",
    },
  })

  useEffect(() => {
    if (!open || attendanceId) return
    const currentDefaults = getDefaultDateParts()
    form.reset({
      patientId: patient.id,
      date: currentDefaults.date,
      time: currentDefaults.time,
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
      launchToFinance: false,
      financeAmount: "",
      financePaymentMethod: DEFAULT_PAYMENT_METHOD,
      financeAccount: "",
      financePaid: false,
      financePaidAt: "",
    })
  }, [attendanceId, form, open, patient.id, type])

  const {
    data: existingAttendance,
    isLoading: isLoadingAttendance,
    isError: isAttendanceError,
  } = useRecord<Attendance>("/attendances", attendanceId, {
    enabled: open && !!attendanceId,
    staleTime: 0,
    retry: 1,
  })

  useEffect(() => {
    if (!open || !existingAttendance) return

    const date = new Date(existingAttendance.date)
    const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000)

    form.reset({
      patientId: existingAttendance.patientId,
      date: local.toISOString().slice(0, 10),
      time: local.toISOString().slice(11, 16),
      mainComplaint: existingAttendance.mainComplaint ?? "",
      currentIllnessHistory: existingAttendance.currentIllnessHistory ?? "",
      pastMedicalHistory: existingAttendance.pastMedicalHistory ?? "",
      familyHistory: existingAttendance.familyHistory ?? "",
      observations: existingAttendance.observations ?? "",
      cidCode: existingAttendance.cidCode ?? "",
      cidDescription: existingAttendance.cidDescription ?? "",
      cifCode: existingAttendance.cifCode ?? "",
      cifDescription: existingAttendance.cifDescription ?? "",
      evolutionNotes: existingAttendance.evolutionNotes ?? "",
      attachments: (existingAttendance.attachments ?? []) as AttendanceFormSchema["attachments"],
      launchToFinance: existingAttendance.launchToFinance ?? false,
      financeAmount: existingAttendance.financeAmount ?? "",
      financePaymentMethod: normalizePaymentMethodSlug(
        existingAttendance.financePaymentMethod,
        DEFAULT_PAYMENT_METHOD,
      ),
      financeAccount: existingAttendance.financeAccount ?? "",
      financePaid: existingAttendance.financePaid ?? false,
      financePaidAt: existingAttendance.financePaidAt
        ? existingAttendance.financePaidAt.slice(0, 10)
        : "",
    })
  }, [existingAttendance, form, open])

  useEffect(() => {
    if (!isAttendanceError || !attendanceId) return
    toast.error("Não foi possível carregar o atendimento")
    onClose()
  }, [attendanceId, isAttendanceError, onClose])

  const currentType =
    existingAttendance?.type === "evolution"
      ? PrismaAttendanceType.EVOLUTION
      : existingAttendance?.type === "evaluation"
        ? PrismaAttendanceType.EVALUATION
        :
    (type === PrismaAttendanceType.EVOLUTION
      ? PrismaAttendanceType.EVOLUTION
      : PrismaAttendanceType.EVALUATION)

  const isEvaluation = currentType === PrismaAttendanceType.EVALUATION

  const handleSubmit = async (values: AttendanceFormSchema) => {
    if (!professionalId) {
      toast.error("Não foi possível identificar o profissional logado.")
      return
    }

    try {
      const payload = {
        patientId: patient.id,
        professionalId,
        type: currentType,
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
      }

      if (attendanceId) {
        await apiRequest(`/attendances/${attendanceId}`, {
          method: "PUT",
          data: payload,
        })
      } else {
        await apiRequest("/attendances", {
          method: "POST",
          data: payload,
        })
      }

      toast.success(
        attendanceId
          ? "Atendimento atualizado com sucesso"
          : isEvaluation
            ? "Avaliação registrada com sucesso"
            : "Evolução registrada com sucesso",
      )
      onSuccess?.()
      onClose()
    } catch (error) {
      console.error(error)
      toast.error("Erro ao salvar atendimento")
    }
  }

  const lockedPatient: Patient = {
    id: patient.id,
    name: patient.name ?? "Paciente",
    phone: patient.phone ?? "",
    email: patient.email ?? null,
    birthDate: patient.birthDate ? new Date(patient.birthDate) : null,
    notes: patient.notes ?? null,
    cpf: null,
    rg: null,
    maritalStatus: patient.maritalStatus ?? null,
    gender: patient.gender ?? null,
    profession: patient.profession ?? null,
    companyName: null,
    cep: null,
    country: null,
    state: null,
    city: null,
    street: null,
    number: null,
    neighborhood: null,
    complement: null,
    createdAt: new Date(patient.createdAt),
    updatedAt: new Date(patient.createdAt),
  }

  if (attendanceId && (isLoadingAttendance || (!existingAttendance && !isAttendanceError))) {
    return (
      <div className="p-6 text-sm text-muted-foreground">
        Carregando atendimento...
      </div>
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {isEvaluation ? (
          <EvaluationFields
            form={form}
            patients={[lockedPatient]}
            isLoadingPatients={false}
            lockedPatient={lockedPatient}
          />
        ) : (
          <EvolutionFields
            form={form}
            patients={[lockedPatient]}
            isLoadingPatients={false}
            lockedPatient={lockedPatient}
          />
        )}

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? "Salvando..." : "Salvar"}
          </Button>
        </div>
      </form>
    </Form>
  )
}
