"use client";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";

interface PatientsFiltersProps {
  search: string;
  onSearch: (value: string) => void;
  sortValue: string;
  onSortChange: (value: string) => void;
}

export const PatientsFilters = ({
  search,
  onSearch,
  sortValue,
  onSortChange,
}: PatientsFiltersProps) => {
  return (
    <div className="flex items-center gap-4">
      <div className="relative flex-1 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4 pointer-events-none" />
        <Input
          placeholder="Buscar pacientes..."
          value={search}
          onChange={(event) => onSearch(event.target.value)}
          className="pl-10"
        />
      </div>

      <Select value={sortValue} onValueChange={onSortChange}>
        <SelectTrigger className="w-48">
          <SelectValue placeholder="Ordenar por" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="name-asc">Nome (A-Z)</SelectItem>
          <SelectItem value="name-desc">Nome (Z-A)</SelectItem>
          <SelectItem value="createdAt-desc">Mais recentes</SelectItem>
          <SelectItem value="createdAt-asc">Mais antigos</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};
