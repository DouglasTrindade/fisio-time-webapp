"use client";

import { useRouter } from "next/navigation";
import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MoreHorizontal, Edit, Trash2 } from "lucide-react";
import { useState } from "react";
import { useModalContext } from "@/contexts/modal-provider";
import type { Patient } from "@/types/patient";
import { usePatientContext } from "@/contexts/PatientsContext";
import { useRolePermissions } from "@/hooks/useRolePermissions";
import { toast } from "sonner";

interface PatientListItemProps {
  patient: Patient;
}

export const PatientListItem = ({ patient }: PatientListItemProps) => {
  const { handleDelete, isDeleting } = usePatientContext();
  const router = useRouter();
  const { canManagePatients, canDeletePatients } = useRolePermissions();
  const { openModal } = useModalContext()

  const ensureCanManage = () => {
    if (!canManagePatients) {
      toast.error("Você não tem permissão para editar pacientes.");
      return false;
    }
    return true;
  };

  const handleEditClick = () => {
    if (!ensureCanManage()) return;
    openModal({ component: PatientsEditModal }, { patientId: patient.id })
  };

  const handleRequestDelete = () => {
    if (!canDeletePatients) {
      toast.error("Você não tem permissão para excluir pacientes.");
      return;
    }
    openModal({ component: PatientDeleteModal }, { patient })
  };

  const formatDate = (date: Date | string | null) => {
    if (!date) return "-";

    const dateObj = typeof date === "string" ? new Date(date) : date;

    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(dateObj);
  };

  return (
    <>
      <TableRow
        className="cursor-pointer hover:bg-muted/50"
        onClick={() => router.push(`/pacientes/${patient.id}`)}
      >
        <TableCell className="font-medium">{patient.name}</TableCell>
        <TableCell>{patient.phone}</TableCell>
        <TableCell>{patient.email || "-"}</TableCell>
        <TableCell>{formatDate(patient.createdAt)}</TableCell>
        <TableCell
          className="text-right"
          onClick={(event) => event.stopPropagation()}
        >
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Abrir menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleEditClick}>
                <Edit className="mr-2 h-4 w-4" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleRequestDelete}
                className="text-destructive"
                disabled={!canDeletePatients}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </TableCell>
      </TableRow>

    </>
  );
}

const PatientsEditModal = ({ patientId, closeModal }: { patientId: string; closeModal: () => void }) => (
  <DialogContent className="sm:max-w-3xl">
    <DialogHeader>
      <DialogTitle>Editar Paciente</DialogTitle>
      <DialogDescription>Atualize as informações do paciente selecionado.</DialogDescription>
    </DialogHeader>
    <PatientsEdit patientId={patientId} onClose={closeModal} />
  </DialogContent>
)

const PatientDeleteModal = ({ patient, closeModal }: { patient: Patient; closeModal: () => void }) => {
  const { handleDelete, isDeleting } = usePatientContext()
  const { canDeletePatients } = useRolePermissions()

  const handleConfirm = async () => {
    if (!canDeletePatients) {
      toast.error("Você não tem permissão para excluir pacientes.")
      return
    }
    await handleDelete(patient.id)
    closeModal()
  }

  return (
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Confirmar exclusão</DialogTitle>
        <DialogDescription>
          Tem certeza que deseja excluir o paciente <strong>{patient.name}</strong>? Esta ação não pode ser desfeita.
        </DialogDescription>
      </DialogHeader>
      <DialogFooter>
        <Button variant="outline" onClick={closeModal} disabled={isDeleting}>
          Cancelar
        </Button>
        <Button
          onClick={handleConfirm}
          disabled={isDeleting}
          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
        >
          {isDeleting ? "Excluindo..." : "Excluir"}
        </Button>
      </DialogFooter>
    </DialogContent>
  )
}
