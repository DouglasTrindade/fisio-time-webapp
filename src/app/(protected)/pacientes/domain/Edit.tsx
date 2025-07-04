"use client"

import React, { useEffect } from "react"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useQuery } from "@tanstack/react-query"
import { Form } from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { patientSchema, type PatientSchema } from "./Schema"
import { Fields } from "./Fields"
import { useUpdatePatient } from "@/hooks/usePatients"
import { getPatientById } from "@/actions/Patients"

interface PatientsEditProps {
  patientId: string
  onClose?: () => void
}

export const PatientsEdit = ({ patientId, onClose }: PatientsEditProps) => {
  const updatePatient = useUpdatePatient()

  const { data: patientData, isLoading } = useQuery({
    queryKey: ["patient", patientId],
    queryFn: () => getPatientById(patientId),
  })

  const form = useForm<PatientSchema>({
    resolver: zodResolver(patientSchema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      notes: "",
    },
  })

useEffect(() => {
    if (patientData?.success && patientData.data) {
      const patient = patientData.data
      form.reset({
        name: patient.name,
        phone: patient.phone,
        email: patient.email || "",
        birthDate: patient.birthDate || undefined,
        notes: patient.notes || "",
      })
    }
  }, [patientData, form])

  async function onSubmit(values: PatientSchema) {
    await updatePatient.mutateAsync({
      id: patientId,
      name: values.name,
      phone: values.phone,
      email: values.email || undefined,
      birthDate: values?.birthDate,
      notes: values.notes || undefined,
    })

    onClose?.()
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-20 w-full" />
      </div>
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <Fields form={form} />
        <div className="flex gap-2 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="flex-1 bg-transparent"
            disabled={updatePatient.isPending}
          >
            Cancelar
          </Button>
          <Button type="submit" className="flex-1" disabled={updatePatient.isPending}>
            {updatePatient.isPending ? "Salvando..." : "Salvar Alterações"}
          </Button>
        </div>
      </form>
    </Form>
  )
}
