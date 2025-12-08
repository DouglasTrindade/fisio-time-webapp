"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { patientSchema, type PatientSchema } from "./Schema";
import { Fields } from "./Fields";
import { useCreateRecord } from "@/app/utils/hooks/useRecords";

interface PatientsNewProps {
  onClose?: () => void;
}

export const PatientsNew = ({ onClose }: PatientsNewProps) => {
  const createPatient = useCreateRecord<PatientSchema, PatientSchema>("/patients");

  const form = useForm<PatientSchema>({
    resolver: zodResolver(patientSchema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      notes: "",
      birthDate: null,
    },
  });

  async function onSubmit(data: PatientSchema) {
    await createPatient.mutateAsync({
      name: data.name,
      phone: data.phone,
      email: data.email || undefined,
      birthDate: data.birthDate,
      notes: data.notes || undefined,
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
