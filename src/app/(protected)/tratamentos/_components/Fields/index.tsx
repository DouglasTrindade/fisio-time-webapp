"use client"

import { useEffect, useMemo, useRef } from "react";
import { useWatch, type UseFormReturn } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { TreatmentPlanFormSchema } from "./schema";
import type { Patient } from "@/app/types/patient";
import type { Attendance } from "@/app/types/attendance";
import { useRecords } from "@/app/hooks/useRecords";

interface TreatmentPlanFieldsProps {
  form: UseFormReturn<TreatmentPlanFormSchema>;
  patients: Patient[];
  isLoadingPatients: boolean;
  lockedPatientId?: string;
  lockedPatientName?: string | null;
  lockedAttendanceId?: string;
  lockedAttendanceLabel?: string;
  disablePatientSelection?: boolean;
  disableAttendanceSelection?: boolean;
}

export const TreatmentPlanFields = ({
  form,
  patients,
  isLoadingPatients,
  lockedPatientId,
  lockedPatientName,
  lockedAttendanceId,
  lockedAttendanceLabel,
  disablePatientSelection = false,
  disableAttendanceSelection = false,
}: TreatmentPlanFieldsProps) => {
  const selectedPatientId = useWatch({
    control: form.control,
    name: "patientId",
  });
  const patientChangeRef = useRef(selectedPatientId);

  useEffect(() => {
    const previous = patientChangeRef.current;
    patientChangeRef.current = selectedPatientId;
    if (
      !selectedPatientId ||
      !previous ||
      selectedPatientId === previous ||
      lockedAttendanceId
    ) {
      return;
    }
    form.setValue("attendanceId", "", { shouldValidate: true });
  }, [form, lockedAttendanceId, selectedPatientId]);

  useEffect(() => {
    if (lockedPatientId && !form.getValues("patientId")) {
      form.setValue("patientId", lockedPatientId, { shouldDirty: false });
    }
  }, [form, lockedPatientId]);

  useEffect(() => {
    if (lockedAttendanceId && !form.getValues("attendanceId")) {
      form.setValue("attendanceId", lockedAttendanceId, { shouldDirty: false });
    }
  }, [form, lockedAttendanceId]);

  const {
    records: evaluations,
    isLoading: isLoadingEvaluations,
  } = useRecords<Attendance>(
    "/attendances",
    selectedPatientId
      ? {
        patientId: selectedPatientId,
        type: "EVALUATION",
        limit: 100,
        sortBy: "date",
        sortOrder: "desc",
      }
      : undefined,
    {
      enabled: Boolean(selectedPatientId),
    }
  );

  const patientOptions = useMemo(() => {
    if (
      lockedPatientId &&
      !patients.some((patient) => patient.id === lockedPatientId)
    ) {
      return [
        ...patients,
        {
          id: lockedPatientId,
          name: lockedPatientName ?? "Paciente selecionado",
        },
      ];
    }
    return patients;
  }, [lockedPatientId, lockedPatientName, patients]);

  const formatEvaluationLabel = (
    attendance: Pick<Attendance, "date" | "mainComplaint"> & { title?: string }
  ) => {
    const date = new Date(attendance.date);
    const dateLabel = date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
    const title =
      attendance.title ??
      attendance.mainComplaint ??
      "Avaliação clínica";
    return `${dateLabel} • ${title}`;
  };

  const evaluationOptions = useMemo(() => {
    const options = evaluations.map((attendance) => ({
      id: attendance.id,
      label: formatEvaluationLabel(attendance),
    }));
    if (
      lockedAttendanceId &&
      lockedAttendanceLabel &&
      !options.some((option) => option.id === lockedAttendanceId)
    ) {
      options.push({
        id: lockedAttendanceId,
        label: lockedAttendanceLabel,
      });
    }
    return options;
  }, [evaluations, lockedAttendanceId, lockedAttendanceLabel]);

  const selectedPatientLabel = useMemo(() => {
    const currentPatientId = form.getValues("patientId");
    const match = patientOptions.find((patient) => patient.id === currentPatientId);
    return match?.name ?? lockedPatientName ?? null;
  }, [form, lockedPatientName, patientOptions]);

  const selectedAttendanceLabel = useMemo(() => {
    const currentAttendanceId = form.getValues("attendanceId");
    const match = evaluationOptions.find((option) => option.id === currentAttendanceId);
    return match?.label ?? lockedAttendanceLabel ?? null;
  }, [evaluationOptions, form, lockedAttendanceLabel]);

  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="patientId"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Paciente</FormLabel>
            <Select
              value={field.value || ""}
              onValueChange={field.onChange}
              disabled={
                isLoadingPatients ||
                patientOptions.length === 0 ||
                disablePatientSelection
              }
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      selectedPatientLabel ?? "Selecione um paciente"
                    }
                  />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {patientOptions.length === 0 ? (
                  <SelectItem value="__empty__" disabled>
                    Nenhum paciente cadastrado
                  </SelectItem>
                ) : (
                  patientOptions.map((patient) => (
                    <SelectItem key={patient.id} value={patient.id}>
                      {patient.name ?? "Paciente sem nome"}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="attendanceId"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Avaliação</FormLabel>
            <Select
              value={field.value || ""}
              onValueChange={field.onChange}
              disabled={
                !selectedPatientId ||
                disableAttendanceSelection ||
                isLoadingEvaluations
              }
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      selectedAttendanceLabel ?? "Selecione uma avaliação"
                    }
                  />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {!selectedPatientId ? (
                  <SelectItem value="__patient_required__" disabled>
                    Selecione um paciente primeiro
                  </SelectItem>
                ) : isLoadingEvaluations ? (
                  <SelectItem value="__loading__" disabled>
                    Carregando avaliações...
                  </SelectItem>
                ) : evaluationOptions.length === 0 ? (
                  <SelectItem value="__empty__" disabled>
                    Nenhuma avaliação encontrada
                  </SelectItem>
                ) : (
                  evaluationOptions.map((attendance) => (
                    <SelectItem key={attendance.id} value={attendance.id}>
                      {attendance.label}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="procedure"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Procedimento</FormLabel>
            <FormControl>
              <Input placeholder="Descrição do procedimento" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="sessionQuantity"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Quantidade de atendimentos</FormLabel>
            <FormControl>
              <Input
                type="number"
                min={1}
                step={1}
                {...field}
                value={field.value ?? ""}
                onChange={(event) => {
                  const value = event.target.value;
                  field.onChange(value === "" ? "" : Number(value));
                }}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="resource"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Recurso</FormLabel>
            <FormControl>
              <Input placeholder="Equipamentos ou recursos utilizados" {...field} value={field.value ?? ""} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="conducts"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Condutas</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Detalhe as condutas aplicadas"
                rows={3}
                {...field}
                value={field.value ?? ""}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="objectives"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Objetivos</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Descreva os objetivos do tratamento"
                rows={3}
                {...field}
                value={field.value ?? ""}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="prognosis"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Prognóstico</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Informe o prognóstico esperado"
                rows={3}
                {...field}
                value={field.value ?? ""}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};
