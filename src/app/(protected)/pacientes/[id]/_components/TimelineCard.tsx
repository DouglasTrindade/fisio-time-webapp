import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { FileText, Layers, Mail, MoreHorizontal, PenSquare, Trash2, UserRound } from "lucide-react"
import type { HistoryEntry } from "./types"
import { emptyFallback, formatDate, formatDateTime, typeColors, typeCopy } from "./utils"

interface TimelineCardProps {
  entry: HistoryEntry
  onNavigate?: () => void
  onEdit?: (entry: HistoryEntry) => void
  onDelete?: (entry: HistoryEntry) => void
  isFirst?: boolean
  isLast?: boolean
}

export const TimelineCard = ({
  entry,
  onNavigate,
  onEdit,
  onDelete,
  isFirst,
  isLast,
}: TimelineCardProps) => {
  const color = typeColors[entry.type]
  const label = typeCopy[entry.type]
  const cidLabel = entry.cidCode || entry.cidDescription
  const cifLabel = entry.cifCode || entry.cifDescription

  return (
    <div className="grid grid-cols-[auto_1fr] gap-4">
      <div className="relative flex w-24 flex-col items-center">
        {!isFirst && (
          <span className="absolute -top-4 bottom-10 left-1/2 w-px -translate-x-1/2 bg-border" />
        )}
        {!isLast && (
          <span className="absolute top-10 bottom-0 left-1/2 w-px -translate-x-1/2 bg-border" />
        )}
        <span className="rounded-full bg-muted px-3 py-1 text-xs font-semibold">
          {formatDate(entry.date)}
        </span>
        <span
          className={`mt-3 h-3 w-3 rounded-full border-4 border-background ${color.dot}`}
        />
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-center gap-3 w-full">
            <p className="text-xs text-muted-foreground">
              {formatDateTime(entry.date)}
            </p>
            <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${color.badge}`}>
              {label}
            </span>
            <div className="ms-auto">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => onEdit?.(entry)}
                    disabled={!onEdit}
                  >
                    <PenSquare className="mr-2 h-4 w-4" />
                    Editar
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => onDelete?.(entry)}
                    disabled={!onDelete}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Excluir
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

        </CardHeader>

        <CardContent className="space-y-4 text-sm">
          <div className="flex flex-wrap items-center gap-4 text-muted-foreground">
            <span className="flex items-center gap-2">
              <UserRound className="h-4 w-4" />
              {emptyFallback(entry.professionalName)}
            </span>
            {cidLabel ? (
              <span className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                {cidLabel}
              </span>
            ) : null}
            {cifLabel ? (
              <span className="flex items-center gap-2">
                <Layers className="h-4 w-4" />
                {cifLabel}
              </span>
            ) : null}
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Mail className="h-4 w-4" />
            {label} registrada
          </div>
          <div className="flex gap-2">
            {entry.type === "evaluation" &&
              <Button size="sm" variant="outline" onClick={() => console.log("plano de tratamento")}>
                Plano de tratamento
              </Button>
            }
            <Button size="sm" onClick={() => onNavigate?.()}>
              Ver {entry.type === "evaluation" ? "avaliação" : "evolução"}
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
