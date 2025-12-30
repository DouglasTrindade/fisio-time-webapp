"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  History as HistoryIcon,
  Loader2,
  MoreHorizontal,
  Paperclip,
  Pencil,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { PatientHistoryEntry, HistoryKind } from "@/app/utils/types/patient";
import { cn } from "@/lib/utils";

type TimelineEntry = PatientHistoryEntry & {
  assessmentMainComplaint?: string | null;
  assessmentDiseaseHistory?: string | null;
  assessmentMedicalHistory?: string | null;
  assessmentFamilyHistory?: string | null;
  assessmentObservations?: string | null;
};

const kindCopy: Record<HistoryKind, string> = {
  evolution: "Evolução",
  assessment: "Avaliação",
};

const kindStyles: Record<HistoryKind, string> = {
  evolution: "bg-emerald-50 text-emerald-700 border-emerald-100",
  assessment: "bg-blue-50 text-blue-700 border-blue-100",
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
  onNewEvaluation?: () => void;
  onNewEvolution?: () => void;
}

export const PatientTimeline = ({
  entries,
  isLoading,
  onEdit,
  onDelete,
  onNewEvaluation,
  onNewEvolution,
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
          <div className="space-y-4">
            {(entries as TimelineEntry[]).map((entry, index) => {
              const hasCid =
                entry.kind === "evolution" &&
                (entry.cidCode || entry.cidDescription);
              const title = hasCid
                ? [entry.cidCode, entry.cidDescription]
                    .filter(Boolean)
                    .join(" · ")
                : kindCopy[entry.kind];

              const assessmentBlocks =
                entry.kind === "assessment"
                  ? [
                      {
                        label: "Queixa principal (QP)",
                        value: entry.assessmentMainComplaint,
                      },
                      {
                        label: "História da doença atual (HDA)",
                        value: entry.assessmentDiseaseHistory,
                      },
                      {
                        label: "História médica pregressa (HMP)",
                        value: entry.assessmentMedicalHistory,
                      },
                      {
                        label: "Histórico familiar (HF)",
                        value: entry.assessmentFamilyHistory,
                      },
                      {
                        label: "Observações",
                        value: entry.assessmentObservations ?? entry.content,
                      },
                    ]
                  : [];

              return (
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
                      <div className="flex items-center flex-nowrap justify-between w-full">
                        <div className="flex items-center gap-2">
                          <div className="font-semibold text-sm leading-tight">
                            {title}
                          </div>
                          <span
                            className={cn(
                              "text-xs font-medium rounded-full px-2 py-0.5 border",
                              kindStyles[entry.kind],
                            )}
                          >
                            {kindCopy[entry.kind]}
                          </span>
                        </div>
                        <div className="flex">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                className="h-7 w-7 p-0 bg-gray-500"
                                onClick={(event) => event.stopPropagation()}
                              >
                                <span className="sr-only">Abrir menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {onEdit && (
                                <DropdownMenuItem onClick={() => onEdit(entry)}>
                                  <Pencil className="h-4 w-4" />
                                  Editar
                                </DropdownMenuItem>
                              )}
                              {onDelete && (
                                <DropdownMenuItem
                                  className="text-destructive"
                                  onClick={() => onDelete(entry)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                  Excluir
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                      <time
                        className="text-xs text-muted-foreground"
                        dateTime={new Date(entry.createdAt).toISOString()}
                      >
                        Registrado em {formatDate(entry.createdAt, true)}
                      </time>
                    </div>

                    {entry.kind === "assessment" ? (
                      <div className="space-y-4 text-sm">
                        {assessmentBlocks.map((block) => (
                          <div key={block.label}>
                            <p className="text-muted-foreground font-medium">
                              {block.label}
                            </p>
                            <p className="whitespace-pre-line">
                              {block.value && block.value.trim() !== ""
                                ? block.value
                                : "Não informado"}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground whitespace-pre-line">
                        {entry.content}
                      </p>
                    )}

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
              );
            })}
          </div>
        </div>
      )}
    </CardContent>
    <CardFooter>
      <CardAction className="grid w-full gap-3">
        <Button
          type="button"
          className="bg-[#132850] text-white hover:bg-[#0f203d]"
          disabled={!onNewEvaluation}
          onClick={onNewEvaluation}
        >
          Nova avaliação
        </Button>
        <Button
          type="button"
          className="bg-[#0F312B] text-[#6BF0B2] hover:bg-[#0B2722]"
          disabled={!onNewEvolution}
          onClick={onNewEvolution}
        >
          Nova evolução
        </Button>
      </CardAction>
    </CardFooter>
  </Card>
);
