"use client";

import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { MoreHorizontal, Edit, Trash2, History } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import type { Patient } from "@/app/utils/types/patient";
import { useDeleteRecord } from "@/app/utils/hooks/useRecord";

interface PatientListItemProps {
  patient: Patient;
  onEdit: (id: string) => void;
}

export const PatientListItem = ({ patient, onEdit }: PatientListItemProps) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const deletePatient = useDeleteRecord("/patients");
  const router = useRouter();

  const handleDelete = async () => {
    await deletePatient.mutateAsync(patient.id);
    setShowDeleteDialog(false);
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

  const goToHistory = useCallback(() => {
    router.push(`/pacientes/${patient.id}/history`);
  }, [patient.id, router]);

  return (
    <>
      <TableRow
        onClick={goToHistory}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            goToHistory();
          }
        }}
        tabIndex={0}
        className="cursor-pointer transition hover:bg-muted/50 focus-visible:bg-muted/50"
      >
        <TableCell className="font-medium">{patient.name}</TableCell>
        <TableCell>{patient.phone}</TableCell>
        <TableCell>{patient.email || "-"}</TableCell>
        <TableCell>{formatDate(patient.createdAt)}</TableCell>
        <TableCell className="text-right">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="h-8 w-8 p-0"
                onClick={(event) => event.stopPropagation()}
              >
                <span className="sr-only">Abrir menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={(event) => {
                  event.stopPropagation();
                  goToHistory();
                }}
              >
                <History className="mr-2 h-4 w-4" />
                Histórico
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(event) => {
                  event.stopPropagation();
                  onEdit(patient.id);
                }}
              >
                <Edit className="mr-2 h-4 w-4" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(event) => {
                  event.stopPropagation();
                  setShowDeleteDialog(true);
                }}
                className="text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </TableCell>
      </TableRow>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o paciente{" "}
              <strong>{patient.name}</strong>? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deletePatient.isPending}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deletePatient.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deletePatient.isPending ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
