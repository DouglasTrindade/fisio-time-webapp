"use client";

import { useEffect, useState, type MouseEvent } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { patientSchema, type PatientSchema } from "./Schema";
import { PersonalFields } from "./PersonalFields";
import { AddressFields } from "./AddressFields";
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
  const [step, setStep] = useState(0);
  const steps = ["Informações pessoais", "Endereço"];

  const form = useForm<PatientSchema>({
    resolver: zodResolver(patientSchema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      birthDate: null,
      notes: "",
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

  useEffect(() => {
    if (patient) {
      form.reset({
        name: patient.name,
        phone: patient.phone,
        email: patient.email ?? "",
        birthDate: patient.birthDate 
          ? new Date(patient.birthDate).toISOString().split('T')[0]
          : null,
        notes: patient.notes ?? "",
        cpf: patient.cpf ?? "",
        rg: patient.rg ?? "",
        maritalStatus: patient.maritalStatus ?? "",
        gender: patient.gender ?? "",
        profession: patient.profession ?? "",
        companyName: patient.companyName ?? "",
        cep: patient.cep ?? "",
        country: patient.country ?? "",
        state: patient.state ?? "",
        city: patient.city ?? "",
        street: patient.street ?? "",
        number: patient.number ?? "",
        neighborhood: patient.neighborhood ?? "",
        complement: patient.complement ?? "",
      });
    }
  }, [patient, form]);

  useEffect(() => {
    setStep(0);
  }, [patientId]);

  const onSubmit = async (values: PatientSchema) => {
    try {
      await updatePatient.mutateAsync({
        id: patientId,
        data: values,
      })

      onClose?.()
    } catch (error) {
      console.error("Erro ao atualizar paciente:", error)
    }
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
              disabled={updatePatient.isPending}
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
              disabled={updatePatient.isPending}
            >
              Cancelar
            </Button>
            {step > 0 && (
              <Button
                type="button"
                variant="outline"
                onClick={handlePrevStep}
                disabled={updatePatient.isPending}
              >
                Voltar
              </Button>
            )}
          </div>
          {isLastStep ? (
            <Button
              type="submit"
              disabled={updatePatient.isPending}
            >
              {updatePatient.isPending ? "Salvando..." : "Salvar"}
            </Button>
          ) : (
            <Button
              type="button"
              onClick={handleNextStep}
              disabled={updatePatient.isPending}
            >
              Avançar
            </Button>
          )}
        </div>
      </form>
    </Form>
  );
};
