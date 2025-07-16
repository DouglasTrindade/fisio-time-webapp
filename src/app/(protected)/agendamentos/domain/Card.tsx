import { Button } from "@/components/ui/button";
import { Phone, Clock, User, FileText } from "lucide-react";

interface Appointment {
    id: string;
    title: string;
    patientName: string;
    phone: string;
    date: Date;
    time: string;
    status: 'confirmed' | 'canceled' | 'rescheduled' | 'waiting';
    notes?: string;
}

export const AppointmentCard = ({ appointment, onEdit, onDelete }: {
    appointment: Appointment;
    onEdit: (appointment: Appointment) => void;
    onDelete: (id: string) => void;
}) => {
    const statusColors = {
        confirmed: 'bg-green-100 text-green-800',
        canceled: 'bg-red-100 text-red-800',
        rescheduled: 'bg-yellow-100 text-yellow-800',
        waiting: 'bg-blue-100 text-blue-800'
    };

    const statusLabels = {
        confirmed: 'Confirmado',
        canceled: 'Cancelado',
        rescheduled: 'Reagendado',
        waiting: 'Aguardando'
    };

    const formatTime = (time: string) => {
        return time.padStart(5, '0');
    };

    return (
        <div className="border rounded-lg p-4 hover:shadow-md transition-shadow bg-white">
            <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[appointment.status]}`}>
                        {statusLabels[appointment.status]}
                    </span>
                </div>
                <div className="flex gap-1">
                    <Button variant="outline" size="sm" onClick={() => onEdit(appointment)}>
                        Editar
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => onDelete(appointment.id)}>
                        Excluir
                    </Button>
                </div>
            </div>

            <div className="space-y-2">
                <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-600" />
                    <span className="font-semibold">{appointment.patientName}</span>
                </div>

                {appointment.phone && (
                    <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-gray-600" />
                        <span className="text-sm text-gray-600">{appointment.phone}</span>
                    </div>
                )}

                <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-600" />
                    <span className="text-sm text-gray-600">{formatTime(appointment.time)}</span>
                </div>

                {appointment.notes && (
                    <div className="flex items-start gap-2">
                        <FileText className="w-4 h-4 text-gray-600 mt-0.5" />
                        <span className="text-sm text-gray-600">{appointment.notes}</span>
                    </div>
                )}
            </div>
        </div>
    );
};