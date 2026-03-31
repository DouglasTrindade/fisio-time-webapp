import { MoreHorizontal, Pencil, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { TableCell, TableRow } from "@/components/ui/table"
import type { UserProfile } from "@/types/user"

interface ListItemProps {
  member: UserProfile
  roleLabel: string
  formattedDate: string
  onEdit: () => void
  onDelete: () => void
  disableDelete?: boolean
}

export const ListItem = ({
  member,
  roleLabel,
  formattedDate,
  onEdit,
  onDelete,
  disableDelete,
}: ListItemProps) => {
  return (
    <TableRow>
      <TableCell className="font-medium">{member.name ?? "Usuário"}</TableCell>
      <TableCell>{member.email}</TableCell>
      <TableCell>
        <span className="rounded-full bg-primary/15 px-3 py-1 text-xs font-semibold text-primary">
          {roleLabel}
        </span>
      </TableCell>
      <TableCell>{formattedDate}</TableCell>
      <TableCell className="text-right">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Ações do usuário">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem className="gap-2" onSelect={onEdit}>
              <Pencil className="h-4 w-4" />
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem
              disabled={disableDelete}
              className="gap-2 text-destructive focus:text-destructive"
              onSelect={() => {
                if (!disableDelete) {
                  onDelete()
                }
              }}
            >
              <Trash2 className="h-4 w-4" />
              Excluir
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  )
}
