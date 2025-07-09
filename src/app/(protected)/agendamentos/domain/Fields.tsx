"use client"

import { useFormContext } from "react-hook-form"
import { Input } from "@/components/ui/input"
import {
    FormField,
    FormItem,
    FormLabel,
    FormControl,
    FormMessage,
} from "@/components/ui/form"

export const AppointmentFormFields = () => {
    const { control } = useFormContext()

    return (
        <>
            <FormField
                control={control}
                name="name"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Nome</FormLabel>
                        <FormControl><Input {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

            <FormField
                control={control}
                name="phone"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Telefone</FormLabel>
                        <FormControl><Input {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

            <FormField
                control={control}
                name="date"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Data</FormLabel>
                        <FormControl><Input type="date" {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

            <FormField
                control={control}
                name="time"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Hora</FormLabel>
                        <FormControl><Input type="time" {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
        </>
    )
}
