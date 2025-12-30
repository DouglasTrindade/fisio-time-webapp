"use client"

import { History as HistoryIcon } from "lucide-react"
import {
  Card,
  CardContent,
  CardDescription,
  CardAction,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"

export type TimelineEvent = {
  id: string
  title: string
  description: string
  date: Date | string
  type: "evaluation" | "evolution"
  author?: string
}

const typeStyles: Record<TimelineEvent["type"], string> = {
  evaluation: "bg-emerald-50 text-emerald-700 border-emerald-100",
  evolution: "bg-blue-50 text-blue-700 border-blue-100",
}

export const formatDate = (value?: Date | string | null, withTime = false) => {
  if (!value) return "Não informado"
  const date = typeof value === "string" ? new Date(value) : value

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: withTime ? "long" : "2-digit",
    year: "numeric",
    ...(withTime ? { hour: "2-digit", minute: "2-digit" } : {}),
  }).format(date)
}

export const PatientTimeline = ({ events }: { events: TimelineEvent[] }) => (
  <Card className="lg:col-span-2">
    <CardHeader className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <HistoryIcon className="h-5 w-5 text-primary" />
        <div>
          <CardTitle>Linha do tempo</CardTitle>
          <CardDescription>
            Apenas avaliações e evoluções clínicas registradas.
          </CardDescription>
        </div>
      </div>
    </CardHeader>
    <CardContent>
      {events.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Ainda não existem avaliações ou evoluções para este paciente.
        </p>
      ) : (
        <div className="relative pl-4">
          <div className="absolute top-2 bottom-2 left-1.5 w-px bg-border" aria-hidden />
          <div className="space-y-8">
            {events.map((event, index) => (
              <div key={event.id} className="relative pl-6">
                <span
                  aria-hidden
                  className={`absolute left-0 top-2 h-3.5 w-3.5 rounded-full border-2 bg-background ${typeStyles[event.type]}`}
                />
                <div className="flex flex-col gap-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold leading-tight">{event.title}</h3>
                      <span
                        className={`text-xs font-medium rounded-full px-2 py-0.5 border ${typeStyles[event.type]}`}
                      >
                        {event.type === "evaluation" ? "Avaliação" : "Evolução"}
                      </span>
                    </div>
                    <time
                      className="text-sm text-muted-foreground"
                      dateTime={new Date(event.date).toISOString()}
                    >
                      {formatDate(event.date, true)}
                    </time>
                  </div>
                  <p className="text-sm text-muted-foreground">{event.description}</p>
                  {event.author && (
                    <p className="text-xs text-muted-foreground/80">
                      Registrado por <strong>{event.author}</strong>
                    </p>
                  )}
                </div>
                {index < events.length - 1 && <Separator className="mt-6" />}
              </div>
            ))}
          </div>
        </div>
      )}
    </CardContent>
    <CardFooter className="mt-auto">
      <CardAction className="grid gap-3 w-full">
        <Button
          type="button"
          className="bg-[#152B5A] text-[#88B8FF] hover:bg-[#102145] border border-[#88B8FF]"
        >
          Nova avaliação
        </Button>

        <Button
          type="button"
          className="bg-[#0F312B] text-[#6BF0B2] hover:bg-[#0B2722] border border-[#6BF0B2]"
        >
          Nova evolução
        </Button>
      </CardAction>
    </CardFooter>
  </Card>
)
