"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { patientSchema, type PatientSchema } from "./Schema";
import { Fields } from "./Fields";
import { useCreatePatient } from "@/hooks/usePatients";

interface PatientsNewProps {
  onClose?: () => void;
}

export const PatientsNew = ({ onClose }: PatientsNewProps) => {
  const createPatient = useCreatePatient();

  const form = useForm<PatientSchema>({
    resolver: zodResolver(patientSchema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      notes: "",
    },
  });

  async function onSubmit(values: PatientSchema) {
    await createPatient.mutateAsync({
      name: values.name,
      phone: values.phone,
      email: values.email || undefined,
      birthDate: values.birthDate,
      notes: values.notes || undefined,
    });

    form.reset();
    onClose?.();
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
            disabled={createPatient.isPending}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            className="flex-1"
            disabled={createPatient.isPending}
          >
            {createPatient.isPending ? "Salvando..." : "Salvar"}
          </Button>
        </div>
      </form>
    </Form>
  );
};
