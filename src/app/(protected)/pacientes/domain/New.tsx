"use client";

import { useState, type MouseEvent } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { patientSchema, type PatientSchema } from "./Schema";
import { PersonalFields } from "./PersonalFields";
import { AddressFields } from "./AddressFields";
import { useCreateRecord } from "@/app/utils/hooks/useRecords";

interface PatientsNewProps {
  onClose?: () => void;
}

export const PatientsNew = ({ onClose }: PatientsNewProps) => {
  const createPatient = useCreateRecord<PatientSchema, PatientSchema>("/patients");
  const [step, setStep] = useState(0);
  const steps = ["Informações pessoais", "Endereço"];

  const form = useForm<PatientSchema>({
    resolver: zodResolver(patientSchema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      notes: "",
      birthDate: null,
      cpf: "",
      rg: "",
      maritalStatus: "",
      gender: "",
      profession: "",
      companyName: "",
      cep: "",
      country: "",
      state: "",
      city: "",
      street: "",
      number: "",
      neighborhood: "",
      complement: "",
    },
  });

  async function onSubmit(data: PatientSchema) {
    await createPatient.mutateAsync({
      name: data.name,
      phone: data.phone,
      email: data.email || undefined,
      birthDate: data.birthDate,
      notes: data.notes || undefined,
      cpf: data.cpf || undefined,
      rg: data.rg || undefined,
      maritalStatus: data.maritalStatus || undefined,
      gender: data.gender || undefined,
      profession: data.profession || undefined,
      companyName: data.companyName || undefined,
      cep: data.cep || undefined,
      country: data.country || undefined,
      state: data.state || undefined,
      city: data.city || undefined,
      street: data.street || undefined,
      number: data.number || undefined,
      neighborhood: data.neighborhood || undefined,
      complement: data.complement || undefined,
    });

    form.reset();
    setStep(0);
    onClose?.();
  }

  const handleClose = () => {
    setStep(0);
    onClose?.();
  };

  const handleStepClick = (
    event: MouseEvent<HTMLButtonElement>,
    nextStep: number
  ) => {
    event.preventDefault();
    setStep(nextStep);
  };

  const handleNextStep = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    setStep((prev) => Math.min(prev + 1, steps.length - 1));
  };

  const handlePrevStep = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    setStep((prev) => Math.max(prev - 1, 0));
  };

  const isLastStep = step === steps.length - 1;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {steps.map((label, index) => (
            <Button
              key={label}
              type="button"
              size="sm"
              variant={index === step ? "default" : "outline"}
              onClick={(event) => handleStepClick(event, index)}
              disabled={createPatient.isPending}
            >
              {index + 1}. {label}
            </Button>
          ))}
        </div>

        {step === 0 ? (
          <PersonalFields form={form} />
        ) : (
          <AddressFields form={form} />
        )}

        <div className="flex flex-col gap-2 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="bg-transparent"
              disabled={createPatient.isPending}
            >
              Cancelar
            </Button>
            {step > 0 && (
              <Button
                type="button"
                variant="outline"
                onClick={handlePrevStep}
                disabled={createPatient.isPending}
              >
                Voltar
              </Button>
            )}
          </div>
          {isLastStep ? (
            <Button
              type="submit"
              disabled={createPatient.isPending}
            >
              {createPatient.isPending ? "Salvando..." : "Salvar"}
            </Button>
          ) : (
            <Button
              type="button"
              onClick={handleNextStep}
              disabled={createPatient.isPending}
            >
              Avançar
            </Button>
          )}
        </div>
      </form>
    </Form>
  );
};
