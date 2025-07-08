"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import type { Patient } from "@/app/utils/types/patient";

type PatientContextType = {
    selectedPatient: Patient | null;
    setSelectedPatient: (patient: Patient | null) => void;
};

const PatientContext = createContext<PatientContextType | undefined>(undefined);

export function PatientProvider({ children }: { children: ReactNode }) {
    const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

    return (
        <PatientContext.Provider value={{ selectedPatient, setSelectedPatient }}>
            {children}
        </PatientContext.Provider>
    );
}

export function usePatientContext() {
    const context = useContext(PatientContext);
    if (!context) {
        throw new Error("usePatientContext must be used within a PatientProvider");
    }
    return context;
}
