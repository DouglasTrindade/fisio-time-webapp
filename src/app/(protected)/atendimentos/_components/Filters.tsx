"use client"

import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Search } from "lucide-react"

interface AttendancesFiltersProps {
  search: string
  onSearch: (value: string) => void
  sortValue: string
  onSortChange: (value: string) => void
}

export const AttendancesFilters = ({
  search,
  onSearch,
  sortValue,
  onSortChange,
}: AttendancesFiltersProps) => (
  <div className="flex items-center gap-4">
    <div className="relative flex-1 max-w-sm">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        className="pl-10"
        placeholder="Buscar paciente ou profissional..."
        value={search}
        onChange={(event) => onSearch(event.target.value)}
      />
    </div>
    <Select value={sortValue} onValueChange={onSortChange}>
      <SelectTrigger className="w-full md:w-56">
        <SelectValue placeholder="Ordenar por" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="date-desc">Data mais recente</SelectItem>
        <SelectItem value="date-asc">Data mais antiga</SelectItem>
        <SelectItem value="createdAt-desc">Criados recentemente</SelectItem>
        <SelectItem value="createdAt-asc">Criados há mais tempo</SelectItem>
        <SelectItem value="type-asc">Tipo (A-Z)</SelectItem>
        <SelectItem value="type-desc">Tipo (Z-A)</SelectItem>
      </SelectContent>
    </Select>
  </div>
)
