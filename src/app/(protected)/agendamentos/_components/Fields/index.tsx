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
import { useRecords } from "@/hooks/useRecords";
import { AppointmentForm } from "@/app/(protected)/agendamentos/_components/Fields/schema";
import { Patient } from "@/types/patient";
import { InputMask } from "@/components/ui/input-mask";
import { Status } from "@prisma/client";
import { Textarea } from "@/components/ui/textarea";

interface FieldsProps {
    form: UseFormReturn<AppointmentForm>;
}

export const Fields = ({ form }: FieldsProps) => {
    const { records: patients } = useRecords<Patient>("patients");
    const RequiredMark = () => <span className="ml-1 text-destructive">*</span>

    return (
        <>
            <div className="grid md:grid-cols-2 gap-3">
                <div className="col-span-2 md:col-span-1">
                    <FormField
                        control={form.control}
                        name="patientId"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>
                                    Paciente <RequiredMark />
                                </FormLabel>
                                <Select
                                    value={field.value || undefined}
                                    onValueChange={(value) => {
                                        field.onChange(value);
                                        const selectedPatient = patients.find((p) => p.id === value);
                                        if (selectedPatient) {
                                            form.setValue("name", selectedPatient.name ?? "");
                                            form.setValue("phone", selectedPatient.phone ?? "");
                                        }
                                    }}
                                >
                                    <FormControl className="w-full">
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecione um paciente" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
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
                            <FormItem className="sr-only">
                                <FormControl>
                                    <Input
                                        type="hidden"
                                        {...field}
                                        value={field.value ?? ""}
                                        readOnly
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                <div className="col-span-2 md:col-span-1">
                    <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>
                                    Telefone <RequiredMark />
                                </FormLabel>
                                <FormControl>
                                    <InputMask
                                        placeholder="(99) 99999-9999"
                                        mask="(99) 99999-9999"
                                        {...field}
                                        aria-required="true"
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                <div className="col-span-2 md:col-span-1">
                    <FormField
                        control={form.control}
                        name="date"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>
                                    Data <RequiredMark />
                                </FormLabel>
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
                                        aria-required="true"
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="col-span-2 md:col-span-1">
                    <FormField
                        control={form.control}
                        name="status"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>
                                    Status <RequiredMark />
                                </FormLabel>
                                <Select defaultValue={field.value} onValueChange={field.onChange}>
                                    <FormControl className="w-full">
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
                </div>

                <div className="col-span-2">
                    <FormField
                        control={form.control}
                        name="notes"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Observações</FormLabel>
                                <FormControl>
                                    <Textarea placeholder="Observações adicionais" {...field} value={field.value || ""} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
            </div>
        </>
    );
};
