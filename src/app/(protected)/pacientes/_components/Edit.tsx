"use client";

import { useEffect, useMemo, useState, type MouseEvent } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { patientSchema, type PatientSchema } from "@/app/(protected)/pacientes/_components/Fields/schema";
import { PersonalFields } from "./Fields/PersonalFields";
import { AddressFields } from "./Fields/AddressFields";
import { useRecord } from "@/hooks/useRecord";
import type { PatientApiData } from "@/types/patient";
import { usePatientsContextOptional } from "@/contexts/PatientsContext";

interface PatientsEditProps {
  patientId: string;
  onClose?: () => void;
  onSuccess?: () => void;
}

const mapPatientToFormValues = (
  patient?: PatientApiData | null
): PatientSchema => ({
  name: patient?.name ?? "",
  phone: patient?.phone ?? "",
  email: patient?.email ?? "",
  birthDate: patient?.birthDate
    ? new Date(patient.birthDate).toISOString().split("T")[0]
    : null,
  notes: patient?.notes ?? "",
  cpf: patient?.cpf ?? "",
  rg: patient?.rg ?? "",
  maritalStatus: (patient?.maritalStatus ?? "") as PatientSchema["maritalStatus"],
  gender: (patient?.gender ?? "") as PatientSchema["gender"],
  profession: patient?.profession ?? "",
  companyName: patient?.companyName ?? "",
  cep: patient?.cep ?? "",
  country: patient?.country ?? "",
  state: patient?.state ?? "",
  city: patient?.city ?? "",
  street: patient?.street ?? "",
  number: patient?.number ?? "",
  neighborhood: patient?.neighborhood ?? "",
  complement: patient?.complement ?? "",
})

export const PatientsEdit = ({ patientId, onClose, onSuccess }: PatientsEditProps) => {
  const patientContext = usePatientsContextOptional()
  const { data: patient, isLoading, isFetching } = useRecord<PatientApiData>(
    "/patients",
    patientId,
    {
      staleTime: 0,
      gcTime: 0,
      refetchOnMount: "always",
    }
  )

  const [isStandaloneUpdating, setIsStandaloneUpdating] = useState(false)
  const [step, setStep] = useState(0);
  const [isFormReady, setIsFormReady] = useState(false);
  const steps = ["Informações pessoais", "Endereço"];
  const isUpdating = patientContext?.isUpdating ?? isStandaloneUpdating;

  const form = useForm<PatientSchema>({
    resolver: zodResolver(patientSchema),
    defaultValues: useMemo(() => mapPatientToFormValues(), []),
  });

  useEffect(() => {
    setIsFormReady(false);
  }, [patientId]);

  useEffect(() => {
    if (!patient) return;
    form.reset(mapPatientToFormValues(patient));
    setIsFormReady(true);
  }, [form, patient, patientId, isFetching]);

  useEffect(() => {
    setStep(0);
  }, [patientId]);

  const closeModal = () => {
    if (patientContext) {
      patientContext.closeEdit()
    }
    onClose?.()
  }

  const onSubmit = async (values: PatientSchema) => {
    try {
      if (patientContext) {
        await patientContext.handleUpdate(patientId, values)
      } else {
        setIsStandaloneUpdating(true)
        const response = await fetch(`/api/patients/${patientId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(values),
        })

        if (!response.ok) {
          throw new Error("Não foi possível atualizar o paciente")
        }
      }

      onSuccess?.()
      closeModal()
    } catch (error) {
      console.error("Erro ao atualizar paciente:", error)
    } finally {
      setIsStandaloneUpdating(false)
    }
  }

  const handleClose = () => {
    setStep(0);
    closeModal();
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

  if (isLoading || !isFormReady) {
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
              disabled={isUpdating}
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
                disabled={isUpdating}
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
                disabled={isUpdating}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isUpdating}
              >
                {isUpdating ? "Salvando..." : "Salvar"}
              </Button>
            </div>
          ) : (
            <div className="flex justify-between w-full">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                className="bg-transparent"
                disabled={isUpdating}
              >
                Cancelar
              </Button>
              <Button
                type="button"
                onClick={handleNextStep}
                disabled={isUpdating}
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
