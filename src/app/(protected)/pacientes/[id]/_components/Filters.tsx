"use client"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { HistoryFilters, ProfessionalOption } from "./types"
import { typeCopy } from "./utils"
import { Button } from "@/components/ui/button"

interface FiltersProps {
  status: HistoryFilters["status"]
  onStatusChange: (status: HistoryFilters["status"]) => void
  professionalId: string
  professionals: ProfessionalOption[]
  onProfessionalChange: (id: string) => void
  period: HistoryFilters["period"]
  onPeriodChange: (period: HistoryFilters["period"]) => void
  onReset?: () => void
}

const statusOptions: { value: FiltersProps["status"]; label: string }[] = [
  { value: "all", label: "Todos os tipos" },
  { value: "evaluation", label: typeCopy.evaluation },
  { value: "evolution", label: typeCopy.evolution },
]

export const Filters = ({
  status,
  onStatusChange,
  professionalId,
  onProfessionalChange,
  professionals,
  onReset,
}: FiltersProps) => {

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-4">
        <CardTitle className="text-base font-semibold">Filtros</CardTitle>
        <Button
          size="sm"
          variant="ghost"
          className="text-muted-foreground hover:text-foreground"
          onClick={onReset}
          disabled={!onReset}
        >
          Limpar filtros
        </Button>
      </CardHeader>
      <CardContent className="flex items-center gap-4">
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select value={status} onValueChange={(value) => onStatusChange(value as FiltersProps["status"])}>
            <SelectTrigger id="status">
              <SelectValue placeholder="Selecione o tipo" />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="professional">Profissional</Label>
          <Select
            value={professionalId}
            onValueChange={onProfessionalChange}
          >
            <SelectTrigger id="professional">
              <SelectValue placeholder="Selecione o profissional" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os profissionais</SelectItem>
              {professionals.map((professional) => (
                <SelectItem key={professional.id} value={professional.id}>
                  {professional.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  )
}
