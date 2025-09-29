import { useForm } from "react-hook-form";
import { AppointmentForm, appointmentSchema } from "../Schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCreateAppointment } from "@/app/utils/hooks/useAppointments";
import { toast } from "sonner";
import { useEffect } from "react";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { DialogTitle } from "@radix-ui/react-dialog";
import { Form } from "@/components/ui/form";
import { Fields } from "./Fields";
import { Button } from "@/components/ui/button";

interface AppointmentsModalProps {
    open: boolean;
    onClose: () => void;
    initialDate?: string;
}

export const AppointmentsModal = ({
    open,
    onClose,
    initialDate,
}: AppointmentsModalProps) => {
    const form = useForm<AppointmentForm>({
        resolver: zodResolver(appointmentSchema),
        defaultValues: {
            phone: "",
            date: initialDate || "",
            status: "waiting",
            patientId: "",
            notes: "",
            professionalId: "",
        },
    });

    const { mutateAsync } = useCreateAppointment();

    const onSubmit = async (values: AppointmentForm) => {
        try {
            await mutateAsync({
                ...values,
                notes: values.notes ?? null,
            });
            toast.success("Agendamento criado com sucesso!");
            form.reset();
            onClose();
        } catch (error: unknown) {
            if (error instanceof Error) {
                console.error(error);
                toast.error("Erro ao criar agendamento");
            }
        }
    };


    useEffect(() => {
        if (initialDate) {
            form.setValue("date", initialDate);
        }
    }, [initialDate, form]);

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Novo Agendamento</DialogTitle>
                </DialogHeader>

                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="space-y-4 mt-4"
                    >
                        <Fields form={form} />
                        <Button
                            type="submit"
                            className="w-full"
                            disabled={form.formState.isSubmitting}
                        >
                            {form.formState.isSubmitting ? "Salvando..." : "Salvar"}
                        </Button>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
};
