"use client";

import {
    FormField,
    FormItem,
    FormLabel,
    FormControl,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { UseFormReturn } from "react-hook-form";
import { DateTime } from "luxon";
import { useRecords } from "@/app/utils/hooks/useRecords";
import { AppointmentForm } from "@/app/utils/appointments/schema";
import { Patient } from "@/app/utils/types/patient";
import { InputMask } from "@/components/ui/input-mask";
import { Status } from "@prisma/client";

interface FieldsProps {
    form: UseFormReturn<AppointmentForm>;
}

export const Fields = ({ form }: FieldsProps) => {
    const { records: patients } = useRecords<Patient>("patients");

    return (
        <>
            <FormField
                control={form.control}
                name="patientId"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Paciente (Opcional)</FormLabel>
                        <Select
                            value={field.value || "__none__"}
                            onValueChange={(value) => {
                                if (value === "__none__") {
                                    field.onChange(null);
                                    form.setValue("name", "");
                                    return;
                                }
                                field.onChange(value);
                                const selectedPatient = patients.find((p) => p.id === value);
                                if (selectedPatient) {
                                    form.setValue("name", selectedPatient.name ?? "");
                                }
                            }}
                        >
                            <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione um paciente (opcional)" />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                <SelectItem value="__none__">Nenhum paciente</SelectItem>
                                {patients.map((patient) => (
                                    <SelectItem key={patient.id} value={patient.id}>
                                        {patient.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                )}
            />

            <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Nome</FormLabel>
                        <FormControl>
                            <Input placeholder="Nome do paciente" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

            <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Telefone</FormLabel>
                        <FormControl>
                            <InputMask
                                placeholder="(99) 99999-9999"
                                mask="(99) 99999-9999"
                                {...field}
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

            <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Data</FormLabel>
                        <FormControl>
                            <Input
                                type="datetime-local"
                                value={
                                    field.value
                                        ? DateTime.fromISO(field.value).toFormat("yyyy-MM-dd'T'HH:mm")
                                        : ""
                                }
                                onChange={(e) => {
                                    const iso = DateTime.fromFormat(
                                        e.target.value,
                                        "yyyy-MM-dd'T'HH:mm"
                                    ).toUTC().toISO();
                                    field.onChange(iso);
                                }}
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

            <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select defaultValue={field.value} onValueChange={field.onChange}>
                            <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione o status" />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                <SelectItem value={Status.WAITING}>Aguardando</SelectItem>
                                <SelectItem value={Status.CONFIRMED}>Confirmado</SelectItem>
                                <SelectItem value={Status.CANCELED}>Cancelado</SelectItem>
                                <SelectItem value={Status.RESCHEDULED}>Reagendado</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                )}
            />

            <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Observações</FormLabel>
                        <FormControl>
                            <Input placeholder="Observações adicionais" {...field} value={field.value || ""} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
        </>
    );
};
