"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { patientSchema, PatientSchema } from "./Schema";
import { Fields } from "./Fields";

export const PatientsNew = () => {
  const form = useForm<PatientSchema>({
    resolver: zodResolver(patientSchema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
    },
  });

  function onSubmit(values: PatientSchema) {
    console.log("Paciente enviado:", values);
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4 max-w-md"
      >
        <Fields form={form} />
        <Button type="submit" className="w-full">
          Editar
        </Button>
      </form>
    </Form>
  );
};
