"use client";

import {
    FormField,
    FormItem,
    FormLabel,
    FormControl,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { AppointmentForm } from "../Schema";
import { UseFormReturn } from "react-hook-form";
import { DateTime } from "luxon";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { usePatients } from "@/app/utils/hooks/usePatients";

interface FieldsProps {
    form: UseFormReturn<AppointmentForm>;
}

export const Fields = ({ form }: FieldsProps) => {
    const { data } = usePatients()
    const patients = data?.data || [];

    return (
        <>
            {/* Campo hidden para o nome - será preenchido automaticamente */}
            <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                    <FormItem>
                        <FormControl>
                            <Input {...field} type="hidden" />
                        </FormControl>
                    </FormItem>
                )}
            />

            <FormField
                control={form.control}
                name="patientId"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Paciente</FormLabel>
                        <Select
                            onValueChange={(value) => {
                                field.onChange(value);

                                const selectedPatient = patients.find(patient => patient.id === value);
                                if (selectedPatient) {
                                    form.setValue('name', selectedPatient.name ?? "");
                                }
                            }}
                            defaultValue={field.value}
                        >
                            <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione um paciente" />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                {patients?.map((patient) => (
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
                name="phone"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Telefone</FormLabel>
                        <FormControl>
                            <Input placeholder="(11) 99999-9999" {...field} />
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
                                    )
                                        .toUTC()
                                        .toISO()

                                    field.onChange(iso)
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
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione o status" />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                <SelectItem value="waiting">Aguardando</SelectItem>
                                <SelectItem value="confirmed">Confirmado</SelectItem>
                                <SelectItem value="attended">Atendido</SelectItem>
                                <SelectItem value="canceled">Cancelado</SelectItem>
                                <SelectItem value="rescheduled">Reagendado</SelectItem>
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
                            <Input
                                placeholder="Observações adicionais"
                                {...field}
                                value={field.value || ""}
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
        </>
    );
};