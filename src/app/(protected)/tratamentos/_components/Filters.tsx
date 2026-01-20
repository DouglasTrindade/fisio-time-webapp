"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";

interface TreatmentPlansFiltersProps {
  search: string;
  onSearch: (value: string) => void;
  patientValue: string;
  onPatientChange: (value: string) => void;
  patientOptions: { value: string; label: string }[];
  isPatientDisabled?: boolean;
  sortValue: string;
  onSortChange: (value: string) => void;
}

export const TreatmentPlansFilters = ({
  search,
  onSearch,
  patientValue,
  onPatientChange,
  patientOptions,
  isPatientDisabled,
  sortValue,
  onSortChange,
}: TreatmentPlansFiltersProps) => {
  const [internalSearch, setInternalSearch] = useState(search);
  const debouncedSearch = useDebouncedValue(internalSearch, 400);

  useEffect(() => {
    setInternalSearch(search);
  }, [search]);

  useEffect(() => {
    if (debouncedSearch === search) return;
    onSearch(debouncedSearch);
  }, [debouncedSearch, onSearch, search]);

  return (
    <div className="flex items-center gap-4">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          className="pl-10"
          placeholder="Buscar por procedimento ou objetivo..."
          value={internalSearch}
          onChange={(event) => setInternalSearch(event.target.value)}
        />
      </div>

      <Select
        value={patientValue || "__all__"}
        onValueChange={(value) =>
          onPatientChange(value === "__all__" ? "" : value)
        }
        disabled={isPatientDisabled}
      >
        <SelectTrigger>
          <SelectValue placeholder="Filtrar por paciente" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="__all__">Todos os pacientes</SelectItem>
          {patientOptions.map((patient) => (
            <SelectItem key={patient.value} value={patient.value}>
              {patient.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={sortValue} onValueChange={onSortChange}>
        <SelectTrigger>
          <SelectValue placeholder="Ordenar por" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="createdAt-desc">Mais recentes</SelectItem>
          <SelectItem value="createdAt-asc">Mais antigos</SelectItem>
          <SelectItem value="updatedAt-desc">Atualizados recentemente</SelectItem>
          <SelectItem value="updatedAt-asc">Atualizados há mais tempo</SelectItem>
          <SelectItem value="procedure-asc">Procedimento (A-Z)</SelectItem>
          <SelectItem value="procedure-desc">Procedimento (Z-A)</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};
