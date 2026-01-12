"use client"

import { useState } from "react";
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
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import type { TreatmentPlan } from "@/types/treatment-plan";

interface TreatmentPlanListItemProps {
  plan: TreatmentPlan;
  onEdit: (id: string) => void;
  onDelete: (id: string) => Promise<unknown>;
  isDeleting: boolean;
}

const formatDate = (dateInput: string | Date) => {
  const date = new Date(dateInput);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const formatDateTime = (dateInput: string | Date) => {
  const date = new Date(dateInput);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const TreatmentPlanListItem = ({
  plan,
  onEdit,
  onDelete,
  isDeleting,
}: TreatmentPlanListItemProps) => {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const handleDeleteClick = async () => {
    await onDelete(plan.id);
    setIsConfirmOpen(false);
  };

  const summary =
    plan.objectives || plan.conducts || plan.prognosis || plan.resource;

  return (
    <>
      <TableRow>
        <TableCell>
          <div className="font-medium">{plan.procedure}</div>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {summary ?? "Sem detalhes"}
          </p>
        </TableCell>
        <TableCell>
          <div className="flex flex-col">
            <span>{plan.patient?.name ?? "Paciente não informado"}</span>
            {plan.attendance ? (
              <span className="text-xs text-muted-foreground">
                Avaliação: {formatDateTime(plan.attendance.date)}
              </span>
            ) : null}
          </div>
        </TableCell>
        <TableCell>{plan.sessionQuantity}</TableCell>
        <TableCell>{formatDate(plan.updatedAt)}</TableCell>
        <TableCell className="text-right">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(plan.id)}>
                <Pencil className="mr-2 h-4 w-4" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => setIsConfirmOpen(true)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </TableCell>
      </TableRow>

      <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir plano de tratamento</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação é permanente. Tem certeza que deseja excluir o plano?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDeleteClick}
              disabled={isDeleting}
            >
              {isDeleting ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
