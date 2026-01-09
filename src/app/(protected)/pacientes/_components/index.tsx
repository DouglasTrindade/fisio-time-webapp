"use client";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { PatientsNew } from "./New";
import { PatientsEdit } from "./Edit";
import { PatientListItem } from "./ListItem";
import { Skeleton } from "@/components/ui/skeleton";
import { usePatientsContext } from "@/contexts/PatientsContext";
import { PatientsFilters } from "./Filters";
import { ClientOnly } from "@/components/ClientOnly";

export const Patients = () => {
  const {
    records: patients,
    isLoading,
    pagination,
    filters,
    isNewDialogOpen,
    editingPatientId,
    openNew,
    closeNew,
    openEdit,
    closeEdit,
    handleSearch,
    handlePageChange,
    handleSortChange,
  } = usePatientsContext();

  const sortValue = `${filters.sortBy ?? "name"}-${filters.sortOrder ?? "asc"}`;
  const searchValue = filters.search ?? "";

  return (
    <ClientOnly>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Pacientes</h1>
          <p className="text-muted-foreground">
            {pagination?.total || 0} pacientes cadastrados
          </p>
        </div>

        <Dialog
          open={isNewDialogOpen}
          onOpenChange={(open) => (open ? openNew() : closeNew())}
        >
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Novo Paciente
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-3xl">
            <DialogHeader>
              <DialogTitle>Novo Paciente</DialogTitle>
            </DialogHeader>
            <PatientsNew />
          </DialogContent>
        </Dialog>
      </div>

      <PatientsFilters
        search={searchValue}
        onSearch={handleSearch}
        sortValue={sortValue}
        onSortChange={handleSortChange}
      />

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Telefone</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Data de Cadastro</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                </TableRow>
              ))
            ) : patients?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  {filters.search
                    ? "Nenhum paciente encontrado"
                    : "Nenhum paciente cadastrado"}
                </TableCell>
              </TableRow>
            ) : (
              patients?.map((patient) => (
                <PatientListItem
                  key={patient.id}
                  patient={patient}
                  onEdit={openEdit}
                />
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {pagination && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Mostrando {(pagination.page - 1) * pagination.limit + 1} a{" "}
            {Math.min(pagination.page * pagination.limit, pagination.total)}{" "}
            de {pagination.total} pacientes
          </p>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={!pagination.hasPrev}
            >
              <ChevronLeft className="w-4 h-4" />
              Anterior
            </Button>

            <span className="text-sm">
              Página {pagination.page} de {pagination.totalPages}
            </span>

            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={!pagination.hasNext}
            >
              Próxima
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

        {editingPatientId && (
          <Dialog
            open={!!editingPatientId}
            onOpenChange={(open) => {
              if (!open) closeEdit();
            }}
          >
            <DialogContent className="sm:max-w-3xl">
              <DialogHeader>
                <DialogTitle>Editar Paciente</DialogTitle>
              </DialogHeader>
              <PatientsEdit
                patientId={editingPatientId}
              />
            </DialogContent>
          </Dialog>
        )}
      </div>
    </ClientOnly>
  );
};
