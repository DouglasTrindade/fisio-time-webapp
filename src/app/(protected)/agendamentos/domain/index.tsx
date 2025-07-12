"use client";

import { useAppointments, useDeleteAppointment } from "@/app/utils/hooks/useAppointments";

export const Appointments = () => {
  const { data, isLoading } = useAppointments({ page: 1, limit: 10 });
  const deleteMutation = useDeleteAppointment();
  const appointments = data?.data ?? [];


  return (
    <ul>
      {appointments?.map((appt) => (
        <li key={appt.id} className="flex justify-between">
          <span>{appt.name}</span>
          <button
            className="text-red-500"
            onClick={() => deleteMutation.mutate(appt.id)}
          >
            Excluir
          </button>
        </li>
      ))}
    </ul>
  );
};

