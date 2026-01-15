"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import type { Attendance } from "@/types/attendance"
import {
  TableCell,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react"
import { useAttendancesContext } from "@/contexts/AttendancesContext"
import {
  formatAttendanceDate,
  formatAttendanceTime,
  getAttendanceTypeLabel,
} from "./utils"

interface AttendanceListItemProps {
  attendance: Attendance
  onEdit: (attendance: Attendance) => void
}

export const AttendanceListItem = ({ attendance, onEdit }: AttendanceListItemProps) => {
  const { handleDelete, isDeleting } = useAttendancesContext()
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const router = useRouter()
  const hasTreatmentPlan = Boolean(attendance.treatmentPlan)
  const typeLabel = getAttendanceTypeLabel(attendance.type)

  const handleDeleteClick = async () => {
    await handleDelete(attendance.id)
    setIsConfirmOpen(false)
  }

  const navigateToDetails = () => {
    router.push(`/atendimentos/${attendance.id}`)
  }

  return (
    <>
      <TableRow
        className="cursor-pointer hover:bg-muted/50"
        onClick={navigateToDetails}
      >
        <TableCell>
          <span className="inline-flex rounded-full bg-primary/10 px-3 py-1 text-xs font-medium capitalize text-primary">
            {typeLabel}
          </span>
        </TableCell>
        <TableCell>
          <div className="flex flex-col">
            <span className="font-medium">{formatAttendanceDate(attendance.date)}</span>
            <span className="text-xs text-muted-foreground">
              {formatAttendanceTime(attendance.date)}
            </span>
          </div>
        </TableCell>
        <TableCell>
          {attendance.patient?.name || "Paciente não informado"}
        </TableCell>
        <TableCell>
          {attendance.professional?.name || "Profissional não informado"}
        </TableCell>
        <TableCell
          className="text-right"
          onClick={(event) => event.stopPropagation()}
        >
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(attendance)}>
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
            <AlertDialogTitle>Excluir atendimento</AlertDialogTitle>
            <AlertDialogDescription>
              {hasTreatmentPlan
                ? `Esta ${typeLabel.toLowerCase()} tem um plano de tratamento vinculado. Tem certeza que deseja excluir?`
                : "Esta ação não pode ser desfeita. Deseja continuar?"}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
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
  )
}
