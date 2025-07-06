"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { patientSchema, type PatientSchema } from "./Schema";
import { Fields } from "./Fields";
import { useUpdatePatient, usePatient } from "@/hooks/usePatients";

interface PatientsEditProps {
  patientId: string;
  onClose?: () => void;
}

export const PatientsEdit = ({ patientId, onClose }: PatientsEditProps) => {
  const updatePatient = useUpdatePatient();

  const { data: patientData, isLoading, error } = usePatient(patientId);

  const form = useForm<PatientSchema>({
    resolver: zodResolver(patientSchema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      notes: "",
    },
  });

  useEffect(() => {
    if (patientData) {
      form.reset({
        name: patientData.name,
        phone: patientData.phone,
        email: patientData.email || "",
        birthDate: patientData.birthDate || undefined,
        notes: patientData.notes || "",
      });
    }
  }, [patientData, form]);

  async function onSubmit(values: PatientSchema) {
    try {
      await updatePatient.mutateAsync({
        id: patientId,
        data: {
          name: values.name,
          phone: values.phone,
          email: values.email || undefined,
          birthDate: values.birthDate ? new Date(values.birthDate) : undefined,
          notes: values.notes || undefined,
        },
      });

      onClose?.();
    } catch (error) {
      console.error("Erro ao atualizar paciente:", error);
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
            {updatePatient.isPending ? "Salvando..." : "Salvar Alterações"}
          </Button>
        </div>
      </form>
    </Form>
  );
};
