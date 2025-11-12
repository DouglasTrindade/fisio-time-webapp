"use client";

import { useEffect, useCallback } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useSession } from "next-auth/react";

import { AppointmentForm, appointmentSchema } from "../Schema";
import { Status } from "@prisma/client";
import { z } from "zod";

// Schema específico para o formulário garantindo status requerido após default
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

interface AppointmentsModalProps { open: boolean; onClose: () => void; initialDate?: string; appointment?: Appointment | null }

export const AppointmentsModal = ({ open, onClose, initialDate, appointment }: AppointmentsModalProps) => {
    const { data: session } = useSession();

    // Early return if no session
    if (!session?.user?.id) {
        return null; // ou um loading spinner
    }

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
            professionalId: session.user.id,
        },
    });

    const professionalId = session.user.id;
    const createAppointment = useCreateRecord<ApiResponse<Appointment>, AppointmentForm>("/appointments");
    // hook de atualização genérico
    const updateAppointment = useUpdateRecord<ApiResponse<Appointment>, Partial<AppointmentForm>>("/appointments");

    useEffect(() => { if (session?.user?.id) form.setValue("professionalId", session.user.id); }, [session, form]);
    useEffect(() => { if (initialDate && !appointment) form.setValue("date", initialDate); }, [initialDate, form, appointment]);

    // Preenche form em modo edição
    useEffect(() => {
        if (appointment) {
            form.reset({
                name: appointment.name || "",
                phone: appointment.phone || "",
                date: appointment.date,
                status: appointment.status as any,
                patientId: (appointment as any).patientId ?? null,
                notes: (appointment as any).notes ?? null,
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
        } as AppointmentForm;
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
        } catch (error: any) {
            const msg = error?.response?.data?.error || error?.message || (appointment?.id ? "Erro ao atualizar" : "Erro ao criar agendamento");
            toast.error(msg);
            console.error("Erro submit agendamento:", error);
        }
    };

    useEffect(() => {
        const errors = form.formState.errors;
        const firstKey = Object.keys(errors)[0];
        if (firstKey) {
            const err: any = (errors as any)[firstKey];
            if (err && err.message) toast.error(err.message);
        }
    }, [form.formState.errors]);

    return (
        <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) handleClose(); }}>
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
    );
};
