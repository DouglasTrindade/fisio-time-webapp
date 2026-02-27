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
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import type { TreatmentPlan } from "@/types/treatment-plan";
import { useModalContext } from "@/contexts/ModalContext";

interface TreatmentPlanListItemProps {
  plan: TreatmentPlan;
  onEdit: (id: string) => void;
  onDelete: (id: string) => Promise<unknown>;
  isDeleting: boolean;
}

interface DeleteTreatmentPlanDialogProps {
  plan: TreatmentPlan;
  onDelete: (id: string) => Promise<unknown>;
  onHide?: () => void;
}

const DeleteTreatmentPlanDialog = ({
  plan,
  onDelete,
  onHide,
}: DeleteTreatmentPlanDialogProps) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteClick = async () => {
    setIsDeleting(true);
    try {
      await onDelete(plan.id);
      onHide?.();
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Excluir plano de tratamento</DialogTitle>
        <DialogDescription>
          Esta ação é permanente. Tem certeza que deseja excluir o plano?
        </DialogDescription>
      </DialogHeader>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={() => onHide?.()} disabled={isDeleting}>
          Cancelar
        </Button>
        <Button
          type="button"
          variant="destructive"
          onClick={handleDeleteClick}
          disabled={isDeleting}
        >
          {isDeleting ? "Excluindo..." : "Excluir"}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
};

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
  const { openModal } = useModalContext();

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
                onClick={() =>
                  openModal(
                    { modal: DeleteTreatmentPlanDialog },
                    { plan, onDelete }
                  )
                }
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
};
