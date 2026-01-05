"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { Search, ChevronLeft, ChevronRight } from "lucide-react"
import { useAttendancesContext } from "@/contexts/AttendancesContext"
import { AttendanceListItem } from "./ListItem"
import { AttendanceDialog } from "./Modal"
import { AttendanceType as PrismaAttendanceType } from "@prisma/client"

export const Attendances = () => {
  const {
    records,
    isLoading,
    pagination,
    filters,
    openNew,
    openEdit,
    isDialogOpen,
    creatingType,
    editingAttendance,
    closeDialog,
    handleSearch,
    handlePageChange,
    handleSortChange,
  } = useAttendancesContext()

  const totalAttendances = pagination?.total ?? records.length
  const sortValue = `${filters.sortBy ?? "date"}-${filters.sortOrder ?? "desc"}`

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Atendimentos</h1>
          <p className="text-muted-foreground">
            {totalAttendances} registro{totalAttendances === 1 ? "" : "s"}
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => openNew(PrismaAttendanceType.EVALUATION)}>
            Nova avaliação
          </Button>
          <Button variant="outline" onClick={() => openNew(PrismaAttendanceType.EVOLUTION)}>
            Nova evolução
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-10"
            placeholder="Buscar paciente ou profissional..."
            value={(filters.search as string) ?? ""}
            onChange={(event) => handleSearch(event.target.value)}
          />
        </div>
        <Select value={sortValue} onValueChange={handleSortChange}>
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

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Status</TableHead>
              <TableHead>Data</TableHead>
              <TableHead>Paciente</TableHead>
              <TableHead>Profissional</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 4 }).map((_, index) => (
                <TableRow key={`skeleton-${index}`}>
                  <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                  <TableCell>
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-28" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                  </TableCell>
                  <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-16 ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : records.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-10 text-center text-muted-foreground">
                  Nenhum atendimento cadastrado ainda
                </TableCell>
              </TableRow>
            ) : (
              records.map((attendance) => (
                <AttendanceListItem
                  key={attendance.id}
                  attendance={attendance}
                  onEdit={openEdit}
                />
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {pagination && (
        <div className="flex flex-col gap-3 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
          <p>
            Mostrando {(pagination.page - 1) * pagination.limit + 1} a{" "}
            {Math.min(pagination.page * pagination.limit, pagination.total)} de{" "}
            {pagination.total}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={!pagination.hasPrev}
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              Anterior
            </Button>
            <span>
              Página {pagination.page} de {pagination.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={!pagination.hasNext}
            >
              Próxima
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      <AttendanceDialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          if (!open) closeDialog()
        }}
        type={creatingType}
        attendance={editingAttendance}
      />
    </div>
  )
}
