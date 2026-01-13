"use client"

import { useEffect } from "react"
import type { UseFormReturn } from "react-hook-form"
import type { Patient } from "@/types/patient"
import type { AttendanceFormSchema } from "./schema"
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

interface EvaluationFieldsProps {
  form: UseFormReturn<AttendanceFormSchema>
  patients: Patient[]
  isLoadingPatients: boolean
  lockedPatient?: Pick<Patient, "id" | "name">
}

export const EvaluationFields = ({
  form,
  patients,
  isLoadingPatients,
  lockedPatient,
}: EvaluationFieldsProps) => {
  useEffect(() => {
    if (lockedPatient) {
      form.setValue("patientId", lockedPatient.id, { shouldDirty: true })
    }
  }, [form, lockedPatient])

  return (
    <>
      {lockedPatient ? (
        <div className="rounded-md border bg-muted/40 p-3 text-sm text-muted-foreground">
          Paciente:{" "}
          <span className="font-semibold text-foreground">
            {lockedPatient.name || "Paciente"}
          </span>
        </div>
      ) : (
        <FormField
          control={form.control}
          name="patientId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Paciente</FormLabel>
              <Select value={field.value || undefined} onValueChange={field.onChange} disabled={isLoadingPatients}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={isLoadingPatients ? "Carregando..." : "Selecione um paciente"} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {patients.length === 0 ? (
                    <SelectItem value="__empty" disabled>
                      {isLoadingPatients ? "Carregando pacientes..." : "Nenhum paciente cadastrado"}
                    </SelectItem>
                  ) : (
                    patients.map((patient) => (
                      <SelectItem key={patient.id} value={patient.id}>
                        {patient.name || "Paciente sem nome"}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Data</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="time"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Horário do atendimento</FormLabel>
              <FormControl>
                <Input type="time" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="space-y-2">
        <p className="font-semibold">Anamnese</p>
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="mainComplaint"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Queixa principal (QP) / Motivo da avaliação</FormLabel>
                <FormControl>
                  <Textarea rows={3} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="currentIllnessHistory"
            render={({ field }) => (
              <FormItem>
                <FormLabel>História da doença atual (HDA)</FormLabel>
                <FormControl>
                  <Textarea rows={3} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="pastMedicalHistory"
            render={({ field }) => (
              <FormItem>
                <FormLabel>História médica pregressa (HMP)</FormLabel>
                <FormControl>
                  <Textarea rows={3} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="familyHistory"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Histórico familiar (HF)</FormLabel>
                <FormControl>
                  <Textarea rows={3} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="observations"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Observações</FormLabel>
                <FormControl>
                  <Textarea rows={3} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>

    </>
  )
}
