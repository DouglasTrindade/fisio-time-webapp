"use client";

import {
  History as HistoryIcon,
  Loader2,
  Paperclip,
  Pencil,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { PatientHistoryEntry, HistoryKind } from "@/app/utils/types/patient";
import { cn } from "@/lib/utils";

const kindCopy: Record<HistoryKind, string> = {
  EVOLUTION: "Evolução",
  ASSESSMENT: "Avaliação",
};

const kindStyles: Record<HistoryKind, string> = {
  EVOLUTION: "bg-emerald-50 text-emerald-700 border-emerald-100",
  ASSESSMENT: "bg-blue-50 text-blue-700 border-blue-100",
};

export const formatDate = (value?: Date | string | null, withTime = false) => {
  if (!value) return "Não informado";
  const date = typeof value === "string" ? new Date(value) : value;

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: withTime ? "long" : "2-digit",
    year: "numeric",
    ...(withTime ? { hour: "2-digit", minute: "2-digit" } : {}),
  }).format(date);
};

interface TimelineProps {
  entries: PatientHistoryEntry[];
  isLoading?: boolean;
  onEdit?: (entry: PatientHistoryEntry) => void;
  onDelete?: (entry: PatientHistoryEntry) => void;
}

export const PatientTimeline = ({
  entries,
  isLoading,
  onEdit,
  onDelete,
}: TimelineProps) => (
  <Card>
    <CardHeader className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <HistoryIcon className="h-5 w-5 text-primary" />
        <div>
          <CardTitle>Linha do tempo</CardTitle>
          <CardDescription>
            Evoluções e avaliações registradas para este paciente.
          </CardDescription>
        </div>
      </div>
    </CardHeader>
    <CardContent>
      {isLoading ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Carregando histórico...
        </div>
      ) : entries.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Ainda não existem evoluções cadastradas.
        </p>
      ) : (
        <div className="relative pl-4">
          <div className="absolute top-2 bottom-2 left-1.5 w-px bg-border" aria-hidden />
          <div className="space-y-8">
            {entries.map((entry, index) => (
              <div key={entry.id} className="relative pl-6">
                <span
                  aria-hidden
                  className={cn(
                    "absolute left-0 top-2 h-3.5 w-3.5 rounded-full border-2 bg-background",
                    kindStyles[entry.kind],
                  )}
                />
                <div className="flex flex-col gap-3">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold leading-tight">
                          {entry.cidCode && entry.cidDescription
                            ? `${entry.cidCode} · ${entry.cidDescription}`
                            : kindCopy[entry.kind]}
                        </h3>
                        <span
                          className={cn(
                            "text-xs font-medium rounded-full px-2 py-0.5 border",
                            kindStyles[entry.kind],
                          )}
                        >
                          {kindCopy[entry.kind]}
                        </span>
                      </div>
                      <time
                        className="text-xs text-muted-foreground"
                        dateTime={new Date(entry.createdAt).toISOString()}
                      >
                        Registrado em {formatDate(entry.createdAt, true)}
                      </time>
                    </div>
                    <div className="flex items-center gap-1">
                      {onEdit && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => onEdit(entry)}
                        >
                          <Pencil className="h-4 w-4" />
                          <span className="sr-only">Editar</span>
                        </Button>
                      )}
                      {onDelete && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive"
                          onClick={() => onDelete(entry)}
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Excluir</span>
                        </Button>
                      )}
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground whitespace-pre-line">
                    {entry.content}
                  </p>

                  {entry.attachmentUrl && (
                    <a
                      href={entry.attachmentUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-sm text-primary underline underline-offset-4"
                    >
                      <Paperclip className="h-4 w-4" />
                      Baixar anexo
                    </a>
                  )}
                </div>
                {index < entries.length - 1 && <Separator className="mt-6" />}
              </div>
            ))}
          </div>
        </div>
      )}
    </CardContent>
  </Card>
);
