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

interface FieldsProps {
    form: UseFormReturn<AppointmentForm>;
}

export const Fields = ({ form }: FieldsProps) => {
    return (
        <>
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
                            <Input placeholder="(99) 99999-9999" {...field} />
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
                            <Input type="datetime-local" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

        </>
    );
};
