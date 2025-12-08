"use client";

import { useEffect, useCallback } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useSession } from "next-auth/react";

import { AppointmentForm, appointmentSchema } from "../Schema";
import { Status } from "@prisma/client";
import { z } from "zod";

const appointmentFormSchema = appointmentSchema.extend({
    status: z.nativeEnum(Status),
});

import { useCreateRecord } from "@/app/utils/hooks/useRecords";
import { useUpdateRecord } from "@/app/utils/hooks/useRecord";

import { Dialog, DialogContent, DialogHeader, DialogFooter } from "@/components/ui/dialog";
import { DialogTitle } from "@radix-ui/react-dialog";
import { Form } from "@/components/ui/form";
import { Fields } from "./Fields";
import { Button } from "@/components/ui/button";
import type { Appointment, ApiResponse } from "@/app/utils/types/appointment";
import { handleApiError } from "@/app/utils/services/handleApiError";

interface AppointmentsModalProps { open: boolean; onClose: () => void; initialDate?: string; appointment?: Appointment | null }

export const AppointmentsModal = ({ open, onClose, initialDate, appointment }: AppointmentsModalProps) => {
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
            patientId: null,
            notes: null,
            professionalId: session?.user?.id ?? "",
        },
    });

    const professionalId = session?.user?.id;
    const createAppointment = useCreateRecord<ApiResponse<Appointment>, AppointmentForm>("/appointments");
    const updateAppointment = useUpdateRecord<ApiResponse<Appointment>, Partial<AppointmentForm>>("/appointments");

    useEffect(() => { if (session?.user?.id) form.setValue("professionalId", session.user.id); }, [session, form]);
    useEffect(() => { if (initialDate && !appointment) form.setValue("date", initialDate); }, [initialDate, form, appointment]);

    useEffect(() => {
        if (appointment) {
            form.reset({
                name: appointment.name || "",
                phone: appointment.phone || "",
                date: appointment.date,
                status: appointment.status,
                patientId: appointment.patientId ?? null,
                notes: appointment.notes ?? null,
                professionalId: appointment.professionalId,
            });
        }
    }, [appointment, form]);

    const handleClose = useCallback(() => {
        form.reset({
            name: "",
            phone: "",
            date: initialDate || "",
            status: Status.WAITING,
            patientId: null,
            notes: null,
            professionalId: professionalId,
        });
        onClose();
    }, [form, onClose, initialDate, professionalId]);

    const onSubmit: SubmitHandler<AppointmentForm> = async (values) => {
        const basePayload: AppointmentForm = {
            ...values,
            notes: values.notes || null,
            patientId: values.patientId || null,
            professionalId: values.professionalId,
        };
        try {
            if (appointment?.id) {
                const resp = await updateAppointment.mutateAsync({ id: appointment.id, data: basePayload });
                toast.success(resp?.message || "Agendamento atualizado!");
            } else {
                const response = await createAppointment.mutateAsync(basePayload);
                toast.success(response?.message || "Agendamento criado com sucesso!");
            }
            form.reset({
                name: "",
                phone: "",
                date: initialDate || "",
                status: Status.WAITING,
                patientId: null,
                notes: null,
                professionalId: values.professionalId,
            });
            onClose?.();
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
        <Dialog open={open && !!session?.user?.id} onOpenChange={(isOpen) => { if (!isOpen) handleClose(); }}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{appointment ? "Editar Agendamento" : "Novo Agendamento"}</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
                        <Fields form={form} />
                        <DialogFooter className="flex gap-2 pt-2">
                            <Button type="button" variant="outline" onClick={handleClose} disabled={createAppointment.isPending}>Cancelar</Button>
                            <Button type="submit" className="flex-1" disabled={createAppointment.isPending || updateAppointment.isPending}>
                                {(createAppointment.isPending || updateAppointment.isPending) ? "Salvando..." : "Salvar"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
