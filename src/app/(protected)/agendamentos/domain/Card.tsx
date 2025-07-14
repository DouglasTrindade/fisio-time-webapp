import { Button } from "@/components/ui/button";
import { Phone, Clock, User, FileText } from "lucide-react";

interface Appointment {
    id: string;
    title: string;
    patientName: string;
    phone: string;
    date: Date;
    time: string;
    status: 'agendado' | 'confirmado' | 'cancelado' | 'concluido';
    notes?: string;
}

export const AppointmentCard = ({ appointment, onEdit, onDelete }: {
    appointment: Appointment;
    onEdit: (appointment: Appointment) => void;
    onDelete: (id: string) => void;
}) => {
    const statusColors = {
        agendado: 'bg-blue-100 text-blue-800',
        confirmado: 'bg-green-100 text-green-800',
        cancelado: 'bg-red-100 text-red-800',
        concluido: 'bg-gray-100 text-gray-800'
    };

    const formatTime = (time: string) => {
        return time.padStart(5, '0');
    };

    const formatDateBr = (date: Date) => {
        return date.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit'
        });
    };

    return (
        <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                    <div className="bg-zinc-900 text-white rounded-full px-3 py-1 text-sm font-semibold">
                        {formatDateBr(appointment.date)}
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[appointment.status]}`}>
                        {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                    </span>
                </div>
                <div className="flex gap-2">
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

                <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-600" />
                    <span className="text-sm text-gray-600">{appointment.phone}</span>
                </div>

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