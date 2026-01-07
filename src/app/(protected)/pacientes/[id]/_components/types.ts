export type PatientSummary = {
  id: string;
  name: string;
  phone?: string | null;
  email?: string | null;
  gender?: string | null;
  birthDate?: string | null;
  maritalStatus?: string | null;
  profession?: string | null;
  notes?: string | null;
  createdAt: string;
};

export type HistoryEntry = {
  id: string;
  type: "evaluation" | "evolution";
  date: string;
  professionalId?: string | null;
  professionalName?: string | null;
  title: string;
  summary?: string | null;
  cidCode?: string | null;
  cidDescription?: string | null;
  cifCode?: string | null;
  cifDescription?: string | null;
};

export type ProfessionalOption = {
  id: string;
  name: string;
};

export type HistoryFilters = {
  status: "all" | HistoryEntry["type"];
  professionalId: string;
  period: {
    from: string;
    to: string;
  };
};
