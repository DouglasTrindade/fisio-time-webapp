"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Phone, Clock, User, FileText, Edit } from "lucide-react";
import { DateTime } from "luxon";
import { Appointment } from "@/app/utils/types/appointment";
import { useDeleteRecord } from "@/app/utils/hooks/useRecord";
import { toast } from "sonner";
import { Status } from "@prisma/client"; "@/components/ui/card";

interface AppointmentCardProps {
    appointment: Appointment;
    onEdit: (appointment: Appointment) => void;
}

export const AppointmentCard = ({ appointment, onEdit }: AppointmentCardProps) => {
    const statusColors: Record<Status, string> = {
        [Status.CONFIRMED]: "bg-green-100 text-green-800",
        [Status.CANCELED]: "bg-red-100 text-red-800",
        [Status.RESCHEDULED]: "bg-yellow-100 text-yellow-800",
        [Status.WAITING]: "bg-blue-100 text-blue-800",
    };

    const statusLabels: Record<Status, string> = {
        [Status.CONFIRMED]: "Confirmado",
        [Status.CANCELED]: "Cancelado",
        [Status.RESCHEDULED]: "Reagendado",
        [Status.WAITING]: "Aguardando",
    };

    const formatTime = (date: string) => {
        const d = new Date(date);
        return d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
    };

    const deleteMutation = useDeleteRecord("/appointments");

    const handleDelete = async () => {
        if (!confirm("Deseja realmente excluir este agendamento?")) return;
        try {
            await deleteMutation.mutateAsync(appointment.id);
        } catch (e: any) {
            toast.error(e?.message || "Erro ao excluir");
        }
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[appointment.status]}`}>
                        {statusLabels[appointment.status]}
                    </span>

                    <div className="flex items-end w-full justify-end gap-2">
                        <Button variant="outline" size="sm" onClick={() => onEdit(appointment)}>
                            Editar
                        </Button>
                        <Button variant="outline" size="sm" onClick={handleDelete} disabled={deleteMutation.isPending}>
                            {deleteMutation.isPending ? "Excluindo..." : "Excluir"}
                        </Button>
                    </div>
                </div>
            </CardHeader>

            <CardContent>
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-600" />
                        <span className="font-semibold text-gray-600">{appointment.name}</span>
                    </div>

                    {appointment.phone && (
                        <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4 text-gray-600" />
                            <span className="text-sm text-gray-600">{appointment.phone}</span>
                        </div>
                    )}

                    <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-600" />
                        <span className="text-sm text-gray-600">{formatTime(appointment.date)}</span>
                    </div>

                    {appointment.notes && (
                        <div className="flex items-start gap-2">
                            <FileText className="w-4 h-4 text-gray-600 mt-0.5" />
                            <span className="text-sm text-gray-600">{appointment.notes}</span>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};
