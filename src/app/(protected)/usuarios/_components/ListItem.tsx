import { TableCell, TableRow } from "@/components/ui/table"
import type { UserProfile } from "@/types/user"

interface ListItemProps {
  member: UserProfile
  roleLabel: string
  formattedDate: string
}

export const ListItem = ({ member, roleLabel, formattedDate }: ListItemProps) => {
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
    </TableRow>
  )
}
