"use client"

import { useEffect, useCallback } from "react"
import { useForm, type SubmitHandler } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { useSession } from "next-auth/react"
import { z } from "zod"
import { Status } from "@prisma/client"

import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Form } from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import type { Appointment, ApiResponse } from "@/types/appointment"
import type { AppointmentPayload, AppointmentForm } from "./Fields/schema"
import { appointmentSchema } from "./Fields/schema"
import { Fields } from "./Fields"
import type { ModalComponentProps } from "@/contexts/modal-provider"
import type { ApiResponse as GenericApiResponse } from "@/types/api"
import { handleApiError } from "@/services/handleApiError"

const appointmentFormSchema = appointmentSchema.extend({
  status: z.nativeEnum(Status),
})

export type AppointmentsModalProps = ModalComponentProps & {
  initialDate?: string
  appointment?: Appointment | null
  handleCreate: (payload: AppointmentPayload) => Promise<unknown>
  handleUpdate: (id: string, payload: AppointmentPayload) => Promise<unknown>
  isCreating: boolean
  isUpdating: boolean
}

export type AppointmentsModalInputProps = Omit<AppointmentsModalProps, keyof ModalComponentProps>

export const AppointmentsModal = ({
  initialDate,
  appointment,
  handleCreate,
  handleUpdate,
  isCreating,
  isUpdating,
  closeModal,
}: AppointmentsModalProps) => {
  const { data: session } = useSession()

  const form = useForm<AppointmentForm>({
    resolver: zodResolver(appointmentFormSchema),
    mode: "onSubmit",
    reValidateMode: "onChange",
    defaultValues: {
      name: "",
      phone: "",
      date: initialDate || "",
      status: Status.WAITING,
      patientId: null,
      notes: null,
      professionalId: session?.user?.id ?? "",
    },
  })

  const professionalId = session?.user?.id ?? ""

  useEffect(() => {
    if (session?.user?.id) {
      form.setValue("professionalId", session.user.id)
    }
  }, [session, form])

  useEffect(() => {
    if (initialDate && !appointment) {
      form.setValue("date", initialDate)
    }
  }, [initialDate, appointment, form])

  useEffect(() => {
    if (appointment) {
      form.reset({
        name: appointment.name || "",
        phone: appointment.phone || "",
        date: appointment.date,
        status: appointment.status,
        patientId: appointment.patientId ?? null,
        notes: appointment.notes ?? null,
        professionalId: appointment.professionalId,
      })
    }
  }, [appointment, form])

  const handleClose = useCallback(() => {
    form.reset({
      name: "",
      phone: "",
      date: initialDate || "",
      status: Status.WAITING,
      patientId: null,
      notes: null,
      professionalId,
    })
    closeModal()
  }, [closeModal, form, initialDate, professionalId])

  const submitHandler: SubmitHandler<AppointmentForm> = async (values) => {
    const basePayload: AppointmentPayload = {
      ...values,
      notes: values.notes || null,
      patientId: values.patientId || null,
      professionalId: values.professionalId,
      status: values.status.toLowerCase() as AppointmentPayload["status"],
    }

    try {
      if (appointment?.id) {
        const response = (await handleUpdate(appointment.id, basePayload)) as ApiResponse<Appointment>
        toast.success(response?.message || "Agendamento atualizado!")
      } else {
        const response = (await handleCreate(basePayload)) as GenericApiResponse<Appointment>
        toast.success(response?.message || "Agendamento criado com sucesso!")
      }

      form.reset({
        name: "",
        phone: "",
        date: initialDate || "",
        status: Status.WAITING,
        patientId: null,
        notes: null,
        professionalId: values.professionalId,
      })
      closeModal()
    } catch (error) {
      handleApiError(error, appointment?.id ? "Erro ao atualizar agendamento" : "Erro ao criar agendamento")
    }
  }

  const getErrorMessage = useCallback((error: unknown): string | undefined => {
    if (typeof error === "object" && error && "message" in error) {
      const message = (error as { message?: unknown }).message
      return typeof message === "string" ? message : undefined
    }
    return undefined
  }, [])

  useEffect(() => {
    const firstErrorMessage = Object.values(form.formState.errors)
      .map((error) => getErrorMessage(error))
      .find((message): message is string => Boolean(message))

    if (firstErrorMessage) {
      toast.error(firstErrorMessage)
    }
  }, [form.formState.errors, getErrorMessage])

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>{appointment ? "Editar Agendamento" : "Novo Agendamento"}</DialogTitle>
        <DialogDescription>
          Preencha os dados para {appointment ? "editar" : "criar"} um agendamento.
        </DialogDescription>
      </DialogHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(submitHandler)} className="mt-4 space-y-4">
          <Fields form={form} />
          <DialogFooter className="flex gap-2 pt-2">
            <Button type="button" variant="outline" onClick={handleClose} disabled={isCreating || isUpdating}>
              Cancelar
            </Button>
            <Button type="submit" className="flex-1" disabled={isCreating || isUpdating}>
              {isCreating || isUpdating ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </DialogContent>
  )
}
