"use client";

import { useEffect, useCallback } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useSession } from "next-auth/react";

import { AppointmentForm, AppointmentPayload, appointmentSchema } from "@/app/(protected)/agendamentos/_components/Fields/schema";
import { Status } from "@prisma/client";
import { z } from "zod";

const appointmentFormSchema = appointmentSchema.extend({
    status: z.nativeEnum(Status),
});

import { useAppointmentsContext } from "@/contexts/AppointmentsContext";

import { DialogContent, DialogHeader, DialogFooter } from "@/components/ui/dialog";
import { DialogTitle } from "@radix-ui/react-dialog";
import { Form } from "@/components/ui/form";
import { Fields } from "./Fields";
import { Button } from "@/components/ui/button";
import type { Appointment, ApiResponse } from "@/types/appointment";
import { handleApiError } from "@/services/handleApiError";
import { useRecord } from "@/hooks/useRecord";

interface AppointmentsModalProps {
  initialDate?: string
  appointment?: Appointment | null
  onHide?: () => void
  onSave?: (record: Appointment | null) => void
}

export const AppointmentsModal = ({ initialDate, appointment, onHide, onSave }: AppointmentsModalProps) => {
    const { data: session } = useSession();

    const form = useForm<AppointmentForm>({
        resolver: zodResolver(appointmentFormSchema),
        mode: "onSubmit",
        reValidateMode: "onChange",
        defaultValues: {
            name: "",
            phone: "",
            date: initialDate || "",
            status: Status.WAITING,
            patientId: "",
            notes: null,
            professionalId: session?.user?.id ?? "",
        },
    });

    const professionalId = session?.user?.id;
    const {
        handleCreate,
        handleUpdate,
        isCreating,
        isUpdating,
    } = useAppointmentsContext();

    useEffect(() => { if (session?.user?.id) form.setValue("professionalId", session.user.id); }, [session, form]);
    useEffect(() => { if (initialDate && !appointment) form.setValue("date", initialDate); }, [initialDate, form, appointment]);

    const { data: appointmentDetails, isLoading: isLoadingAppointment } = useRecord<Appointment>(
        "/appointments",
        appointment?.id,
        {
            enabled: !!appointment?.id,
        },
    );

    useEffect(() => {
        const source = appointmentDetails ?? appointment;
        if (source) {
            form.reset({
                name: source.name || "",
                phone: source.phone || "",
                date: source.date,
                status: source.status,
                patientId: source.patientId ?? "",
                notes: source.notes ?? null,
                professionalId: source.professionalId,
            });
        } else {
            form.reset({
                name: "",
                phone: "",
                date: initialDate || "",
                status: Status.WAITING,
                patientId: "",
                notes: null,
                professionalId: professionalId ?? "",
            });
        }
    }, [appointmentDetails, appointment, form, initialDate, professionalId]);

    const handleClose = useCallback(() => {
        form.reset({
            name: "",
            phone: "",
            date: initialDate || "",
            status: Status.WAITING,
            patientId: "",
            notes: null,
            professionalId: professionalId,
        });
        onHide?.();
    }, [form, onHide, initialDate, professionalId]);

    const onSubmit: SubmitHandler<AppointmentForm> = async (values) => {
        const basePayload: AppointmentPayload = {
            ...values,
            notes: values.notes || null,
            patientId: values.patientId,
            professionalId: values.professionalId,
            status: values.status.toLowerCase(),
        };
        try {
            if (appointment?.id) {
                const resp = await handleUpdate(appointment.id, basePayload) as ApiResponse<Appointment>;
                onSave?.(resp?.data ?? appointment ?? null);
            } else {
                const response = await handleCreate(basePayload) as ApiResponse<Appointment>;
                onSave?.(response?.data ?? null);
            }
            form.reset({
                name: "",
                phone: "",
                date: initialDate || "",
                status: Status.WAITING,
                patientId: "",
                notes: null,
                professionalId: values.professionalId,
            });
            onHide?.();
        } catch (e) {
            handleApiError(e, appointment?.id ? "Erro ao atualizar agendamento" : "Erro ao criar agendamento");
        }
    };

    const getErrorMessage = useCallback((error: unknown): string | undefined => {
        if (typeof error === "object" && error && "message" in error) {
            const message = (error as { message?: unknown }).message;
            return typeof message === "string" ? message : undefined;
        }
        return undefined;
    }, []);

    useEffect(() => {
        const firstErrorMessage = Object.values(form.formState.errors)
            .map((error) => getErrorMessage(error))
            .find((message): message is string => Boolean(message));

        if (firstErrorMessage) {
            toast.error(firstErrorMessage);
        }
    }, [form.formState.errors, getErrorMessage]);

    return (
        <DialogContent>
            <DialogHeader>
                <DialogTitle>{appointment ? "Editar Agendamento" : "Novo Agendamento"}</DialogTitle>
            </DialogHeader>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
                    <Fields form={form} />
                    <DialogFooter className="flex gap-2 pt-2">
                        <Button type="button" variant="outline" onClick={handleClose} disabled={isCreating || isUpdating || isLoadingAppointment}>Cancelar</Button>
                        <Button type="submit" disabled={isCreating || isUpdating || isLoadingAppointment}>
                            {(isCreating || isUpdating) ? "Salvando..." : "Salvar"}
                        </Button>
                    </DialogFooter>
                </form>
            </Form>
        </DialogContent>
    )
}
