"use client";

import { useState, type MouseEvent } from "react";
import { FieldPath, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { patientSchema, type PatientSchema } from "@/app/(protected)/pacientes/_components/Fields/schema";
import { PersonalFields } from "./Fields/PersonalFields";
import { AddressFields } from "./Fields/AddressFields";
import { usePatientContext } from "@/contexts/PatientsContext";

export const PatientsNew = ({ onClose }: { onClose?: () => void } = {}) => {
  const { handleCreate, isCreating } = usePatientContext();
  const [step, setStep] = useState(0);
  const steps = ["Informações pessoais", "Endereço"];
  const stepFieldMap: ReadonlyArray<FieldPath<PatientSchema>[]> = [
    ["name", "phone"],
    [],
  ];

  const form = useForm<PatientSchema>({
    resolver: zodResolver(patientSchema),
    mode: "onChange",
    reValidateMode: "onChange",
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
    await handleCreate({
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

  const validateStep = async (index: number) => {
    const fields = stepFieldMap[index];
    if (!fields || fields.length === 0) {
      return true;
    }

    return form.trigger(fields, { shouldFocus: true });
  };

  const goToStep = async (nextStep: number) => {
    if (nextStep === step) return;
    if (nextStep > step) {
      for (let current = step; current < nextStep; current++) {
        const valid = await validateStep(current);
        if (!valid) {
          return;
        }
      }
    }
    setStep(nextStep);
  };

  const handleStepClick = (
    event: MouseEvent<HTMLButtonElement>,
    nextStep: number
  ) => {
    event.preventDefault();
    void goToStep(nextStep);
  };

  const handleNextStep = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    void goToStep(Math.min(step + 1, steps.length - 1));
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
              disabled={isCreating}
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
            {step > 0 && (
              <Button
                type="button"
                variant="outline"
                onClick={handlePrevStep}
                disabled={isCreating}
              >
                Voltar
              </Button>
            )}
          </div>
          {isLastStep ? (
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                className="bg-transparent"
                disabled={isCreating}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isCreating}
              >
                {isCreating ? "Salvando..." : "Salvar"}
              </Button>
            </div>
          ) : (
            <div className="flex justify-between w-full">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                className="bg-transparent"
                disabled={isCreating}
              >
                Cancelar
              </Button>
              <Button
                type="button"
                onClick={handleNextStep}
                disabled={isCreating}
              >
                Avançar
              </Button>
            </div>
          )}
        </div>
      </form>
    </Form>
  );
};
