"use client"

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { TreatmentPlanFields } from "./Fields";
import {
  treatmentPlanFormSchema,
  type TreatmentPlanFormSchema,
} from "./schema";
import { useTreatmentPlansContext } from "@/contexts/TreatmentPlansContext";
import type { Patient } from "@/app/types/patient";

interface TreatmentPlanNewProps {
  patients: Patient[];
  isLoadingPatients: boolean;
  defaultPatientId?: string;
  defaultAttendanceId?: string;
  lockedPatientId?: string;
  lockedPatientName?: string | null;
  lockedAttendanceId?: string;
  onSuccess?: () => void;
}

const sanitizeOptional = (value?: string | null) => {
  const trimmed = value?.trim() ?? "";
  return trimmed === "" ? undefined : trimmed;
};

export const TreatmentPlanNew = ({
  patients,
  isLoadingPatients,
  defaultPatientId,
  defaultAttendanceId,
  lockedPatientId,
  lockedPatientName,
  lockedAttendanceId,
  onSuccess,
}: TreatmentPlanNewProps) => {
  const { handleCreate, isCreating } = useTreatmentPlansContext();

  const form = useForm<TreatmentPlanFormSchema>({
    resolver: zodResolver(treatmentPlanFormSchema),
    defaultValues: {
      patientId: defaultPatientId ?? "",
      attendanceId: defaultAttendanceId ?? "",
      procedure: "",
      sessionQuantity: 1,
      resource: "",
      conducts: "",
      objectives: "",
      prognosis: "",
    },
  });

  useEffect(() => {
    form.setValue("patientId", defaultPatientId ?? "", {
      shouldDirty: false,
    });
    form.setValue("attendanceId", defaultAttendanceId ?? "", {
      shouldDirty: false,
    });
  }, [defaultAttendanceId, defaultPatientId, form]);

  const onSubmit = async (values: TreatmentPlanFormSchema) => {
    try {
      await handleCreate({
        patientId: values.patientId,
        attendanceId: values.attendanceId,
        procedure: values.procedure.trim(),
        sessionQuantity: values.sessionQuantity,
        resource: sanitizeOptional(values.resource),
        conducts: sanitizeOptional(values.conducts),
        objectives: sanitizeOptional(values.objectives),
        prognosis: sanitizeOptional(values.prognosis),
      });

      onSuccess?.();
      form.reset({
        patientId: defaultPatientId ?? "",
        attendanceId: defaultAttendanceId ?? "",
        procedure: "",
        sessionQuantity: 1,
        resource: "",
        conducts: "",
        objectives: "",
        prognosis: "",
      });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <TreatmentPlanFields
          form={form}
          patients={patients}
          isLoadingPatients={isLoadingPatients}
          lockedPatientId={lockedPatientId}
          lockedPatientName={lockedPatientName}
          lockedAttendanceId={lockedAttendanceId}
          disablePatientSelection={Boolean(lockedPatientId)}
          disableAttendanceSelection={Boolean(lockedAttendanceId)}
        />
        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onSuccess}
            disabled={isCreating}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={isCreating}>
            {isCreating ? "Salvando..." : "Salvar plano"}
          </Button>
        </div>
      </form>
    </Form>
  );
};
