"use client"

import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { TreatmentPlanFields } from "./Fields";
import {
  treatmentPlanFormSchema,
  type TreatmentPlanFormSchema,
} from "./schema";
import { useRecord } from "@/app/hooks/useRecord";
import type { TreatmentPlan } from "@/app/types/treatment-plan";
import type { Patient } from "@/app/types/patient";
import type { TreatmentPlanUpdateInput } from "@/app/types/treatment-plan";

interface TreatmentPlanEditProps {
  planId: string;
  patients: Patient[];
  isLoadingPatients: boolean;
  onSuccess?: () => void;
  onUpdate: (id: string, data: TreatmentPlanUpdateInput) => Promise<unknown>;
  isUpdating: boolean;
}

const sanitizeOptional = (value?: string | null) => {
  const trimmed = value?.trim() ?? "";
  return trimmed === "" ? undefined : trimmed;
};

const mapPlanToFormValues = (
  plan?: TreatmentPlan | null
): TreatmentPlanFormSchema => ({
  patientId: plan?.patientId ?? "",
  attendanceId: plan?.attendanceId ?? "",
  procedure: plan?.procedure ?? "",
  sessionQuantity: plan?.sessionQuantity ?? 1,
  resource: plan?.resource ?? "",
  conducts: plan?.conducts ?? "",
  objectives: plan?.objectives ?? "",
  prognosis: plan?.prognosis ?? "",
});

export const TreatmentPlanEdit = ({
  planId,
  patients,
  isLoadingPatients,
  onSuccess,
  onUpdate,
  isUpdating,
}: TreatmentPlanEditProps) => {
  const {
    data: treatmentPlan,
    isLoading,
    isFetching,
  } = useRecord<TreatmentPlan>("/treatment-plans", planId, {
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: "always",
  });

  const form = useForm<TreatmentPlanFormSchema>({
    resolver: zodResolver(treatmentPlanFormSchema),
    defaultValues: mapPlanToFormValues(),
  });

  const lockedAttendanceLabel = useMemo(() => {
    if (!treatmentPlan?.attendance) return undefined;
    const date = new Date(treatmentPlan.attendance.date);
    const dateLabel = date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
    return `${dateLabel} • Plano vinculado`;
  }, [treatmentPlan?.attendance]);

  useEffect(() => {
    if (!treatmentPlan) return;
    form.reset(mapPlanToFormValues(treatmentPlan));
  }, [form, treatmentPlan]);

  const onSubmit = async (values: TreatmentPlanFormSchema) => {
    try {
      await onUpdate(planId, {
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
    } catch (error) {
      console.error(error);
    }
  };

  if (isLoading || isFetching) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <TreatmentPlanFields
          form={form}
          patients={patients}
          isLoadingPatients={isLoadingPatients}
          lockedPatientId={treatmentPlan?.patientId}
          lockedPatientName={treatmentPlan?.patient?.name ?? null}
          lockedAttendanceId={treatmentPlan?.attendanceId}
          lockedAttendanceLabel={lockedAttendanceLabel}
          disablePatientSelection
          disableAttendanceSelection
        />
        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onSuccess}
            disabled={isUpdating}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={isUpdating}>
            {isUpdating ? "Salvando..." : "Salvar alterações"}
          </Button>
        </div>
      </form>
    </Form>
  );
};
