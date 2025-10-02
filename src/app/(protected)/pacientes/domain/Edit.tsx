"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { patientSchema, type PatientSchema } from "./Schema";
import { Fields } from "./Fields";
import { useUpdateRecord, useRecord } from "@/app/utils/hooks/useRecord";

interface PatientsEditProps {
  patientId: string;
  onClose?: () => void;
}

export const PatientsEdit = ({ patientId, onClose }: PatientsEditProps) => {
  const { data: patient, isLoading } = useRecord<PatientSchema>(
    "/patients",
    patientId
  )

  const updatePatient = useUpdateRecord<PatientSchema, PatientSchema>("/patients")

  const form = useForm<PatientSchema>({
    resolver: zodResolver(patientSchema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      birthDate: undefined,
      notes: "",
    },
  });

  useEffect(() => {
    if (patient) {
      form.reset({
        name: patient.name,
        phone: patient.phone,
        email: patient.email,
        birthDate: patient.birthDate,
        notes: patient.notes,
      });
    }
  }, [patient, form]);

  const onSubmit = async (values: PatientSchema) => {
    try {
      await updatePatient.mutateAsync({
        id: patientId,
        data: {
          ...values,
          birthDate: values.birthDate
        },
      })

      onClose?.()
    } catch (error) {
      console.error("Erro ao atualizar paciente:", error)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-20 w-full" />
      </div>
    );
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
          <Button
            type="submit"
            className="flex-1"
            disabled={updatePatient.isPending}
          >
            {updatePatient.isPending ? "Salvando..." : "Salvar"}
          </Button>
        </div>
      </form>
    </Form>
  );
};
