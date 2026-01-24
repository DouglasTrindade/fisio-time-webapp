"use client";

import { useMemo } from "react";
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
import { Plus, Download, FileSpreadsheet } from "lucide-react";
import { PatientsNew } from "./New";
import { PatientsEdit } from "./Edit";
import { PatientListItem } from "./ListItem";
import { Skeleton } from "@/components/ui/skeleton";
import { usePatientsContext } from "@/contexts/PatientsContext";
import { PatientsFilters } from "./Filters";
import { ClientOnly } from "@/components/ClientOnly";
import type { ExportColumn } from "@/hooks/exportUtils";
import type { Patient } from "@/types/patient";
import { useExportCsv } from "@/hooks/useExportCsv";
import { useExportXlsx } from "@/hooks/useExportXlsx";
import { Pagination } from "@/components/Pagination";

const formatDate = (value?: Date | string | null) => {
  if (!value) return "-";
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "-";

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
};

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
  const exportCsv = useExportCsv<Patient>();
  const exportXlsx = useExportXlsx<Patient>();
  const patientsList = patients ?? [];
  const exportColumns = useMemo<ExportColumn<Patient>[]>(
    () => [
      { header: "Nome", accessor: (patient) => patient.name },
      { header: "Telefone", accessor: (patient) => patient.phone ?? "" },
      { header: "Email", accessor: (patient) => patient.email ?? "" },
      { header: "Cidade", accessor: (patient) => patient.city ?? "" },
      { header: "Estado", accessor: (patient) => patient.state ?? "" },
      { header: "Nascimento", accessor: (patient) => formatDate(patient.birthDate ?? null) },
      { header: "Cadastro", accessor: (patient) => formatDate(patient.createdAt) },
      { header: "CPF", accessor: (patient) => patient.cpf ?? "" },
    ],
    [],
  );

  const handleExportCsv = () => {
    exportCsv(patientsList, exportColumns, { filename: "pacientes" });
  };

  const handleExportXlsx = () => {
    exportXlsx(patientsList, exportColumns, {
      filename: "pacientes",
      sheetName: "Pacientes",
    });
  };

  const sortValue = `${filters.sortBy ?? "name"}-${filters.sortOrder ?? "asc"}`;
  const searchValue = filters.search ?? "";

  return (
    <ClientOnly>
      <div className="space-y-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-2xl font-bold">Pacientes</h1>
            <p className="text-muted-foreground">
              {pagination?.total || 0} pacientes cadastrados
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:justify-end">
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                onClick={handleExportCsv}
                disabled={patientsList.length === 0}
              >
                <Download className="mr-2 h-4 w-4" />
                Exportar CSV
              </Button>
              <Button
                variant="outline"
                onClick={handleExportXlsx}
                disabled={patientsList.length === 0}
              >
                <FileSpreadsheet className="mr-2 h-4 w-4" />
                Exportar XLSX
              </Button>
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
          <Pagination
            pagination={pagination}
            onPageChange={handlePageChange}
            resourceLabel="pacientes"
          />
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
