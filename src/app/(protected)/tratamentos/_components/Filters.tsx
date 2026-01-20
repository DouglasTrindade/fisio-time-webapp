"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
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
import { Form, FormControl } from "@/components/ui/form";

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

type FiltersFormValues = {
  search: string;
  patient: string;
  sort: string;
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
  const form = useForm<FiltersFormValues>({
    defaultValues: {
      search,
      patient: patientValue || "",
      sort: sortValue,
    },
  });

  useEffect(() => {
    form.reset({
      search,
      patient: patientValue || "",
      sort: sortValue,
    });
  }, [form, patientValue, search, sortValue]);

  const watchedSearch = form.watch("search");
  const watchedPatient = form.watch("patient");
  const watchedSort = form.watch("sort");
  const debouncedSearch = useDebouncedValue(watchedSearch, 400);

  useEffect(() => {
    if (debouncedSearch === search) return;
    onSearch(debouncedSearch);
  }, [debouncedSearch, onSearch, search]);

  useEffect(() => {
    const normalized = watchedPatient ?? "";
    const target = normalized.length === 0 ? "" : normalized;
    if (target === patientValue) return;
    onPatientChange(target);
  }, [onPatientChange, patientValue, watchedPatient]);

  useEffect(() => {
    if (!watchedSort || watchedSort === sortValue) return;
    onSortChange(watchedSort);
  }, [onSortChange, sortValue, watchedSort]);

  return (
    <Form {...form}>
      <form className="flex items-center gap-4" onSubmit={(event) => event.preventDefault()}>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <FormControl>
            <Input
              className="pl-10"
              placeholder="Buscar por procedimento ou objetivo..."
              {...form.register("search")}
            />
          </FormControl>
        </div>

        <Select
          value={watchedPatient || ""}
          onValueChange={(value) => form.setValue("patient", value, { shouldDirty: true })}
          disabled={isPatientDisabled}
        >
          <SelectTrigger>
            <SelectValue placeholder="Filtrar por paciente" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Todos os pacientes</SelectItem>
            {patientOptions.map((patient) => (
              <SelectItem key={patient.value} value={patient.value}>
                {patient.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={watchedSort}
          onValueChange={(value) => form.setValue("sort", value, { shouldDirty: true })}
        >
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
      </form>
    </Form>
  );
};
