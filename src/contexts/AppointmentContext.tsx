"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import type { Appointment } from "@/app/utils/types/appointment";

type AppointmentContextType = {
    selectedDate: Date | null;
    setSelectedDate: (date: Date | null) => void;
    appointments: Appointment[];
    setAppointments: (appointments: Appointment[]) => void;
    getAppointmentsByDate: (date: Date) => Appointment[];
};

const AppointmentContext = createContext<AppointmentContextType | undefined>(undefined);

export const AppointmentProvider = ({ children }: { children: ReactNode }) => {
    const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
    const [appointments, setAppointments] = useState<Appointment[]>([]);

    const getAppointmentsByDate = (date: Date) => {
        const dateStr = date.toISOString().split('T')[0];
        return appointments.filter(appointment => {
            const appointmentDate = new Date(appointment.date).toISOString().split('T')[0];
            return appointmentDate === dateStr;
        });
    };

    return (
        <AppointmentContext.Provider value={{
            selectedDate,
            setSelectedDate,
            appointments,
            setAppointments,
            getAppointmentsByDate
        }}>
            {children}
        </AppointmentContext.Provider>
    );
}

export const useAppointmentContext = () => {
    const context = useContext(AppointmentContext);
    if (!context) {
        throw new Error("useAppointmentContext must be used within an AppointmentProvider");
    }
    return context;
}