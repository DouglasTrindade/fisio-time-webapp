import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  CalendarDays,
  Mail,
  Phone,
  UserRound,
} from "lucide-react"
import type { PatientSummary } from "./types"
import { calculateAge, emptyFallback, formatDate } from "./utils"

interface AboutPatientProps {
  patient: PatientSummary
  onEdit?: () => void
  onCreateEvaluationHref?: string
  onCreateEvolutionHref?: string
  onCreateEvaluation?: () => void
  onCreateEvolution?: () => void
  onViewTreatmentPlansHref?: string
  onViewTreatmentPlans?: () => void
}

export const AboutPatient = ({
  patient,
  onEdit,
  onCreateEvaluationHref = "/atendimentos?type=evaluation",
  onCreateEvolutionHref = "/atendimentos?type=evolution",
  onCreateEvaluation,
  onCreateEvolution,
}: AboutPatientProps) => {
  const getPatientHref = (href: string) => {
    const separator = href.includes("?") ? "&" : "?"
    return `${href}${separator}patientId=${patient.id}`
  }
  const age = calculateAge(patient.birthDate)
  const createdAt = formatDate(patient.createdAt, {
    day: "2-digit",
    month: "long",
    year: "numeric",
  })

  return (
    <Card className="sticky top-6 h-fit">
      <CardHeader>
        <CardTitle>Sobre o paciente</CardTitle>
        <CardDescription>Paciente desde {createdAt}</CardDescription>
        <CardAction>
          <Button
            size="sm"
            variant="outline"
            onClick={onEdit}
            disabled={!onEdit}
          >
            Editar
          </Button>
        </CardAction>
      </CardHeader>

      <CardContent className="space-y-6">
        <div>
          <p className="text-lg font-semibold text-foreground">
            {patient.name}
          </p>
          <p className="text-sm text-muted-foreground">
            {emptyFallback(patient.profession)}
          </p>
        </div>

        <Separator />

        <div className="space-y-4">
          <div className="text-xs font-semibold uppercase tracking-wide">
            Contato
          </div>
          <div className="grid gap-3 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Phone className="h-4 w-4" />
              <span>{emptyFallback(patient.phone)}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Mail className="h-4 w-4" />
              <span>{emptyFallback(patient.email)}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <UserRound className="h-4 w-4" />
              <span className="capitalize">
                {emptyFallback(patient.gender)}
              </span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <CalendarDays className="h-4 w-4" />
              <span>
                {formatDate(patient.birthDate)}{" "}
                {age !== null ? `(${age} anos)` : ""}
              </span>
            </div>
          </div>
        </div>

        <Separator />

      </CardContent>

      <CardFooter>
        <div className="flex flex-col gap-3 w-full">
          {onCreateEvaluation ? (
            <Button onClick={onCreateEvaluation}>Nova avaliação</Button>
          ) : (
            <Button asChild>
              <Link href={getPatientHref(onCreateEvaluationHref)}>
                Nova avaliação
              </Link>
            </Button>
          )}
          {onCreateEvolution ? (
            <Button variant="outline" onClick={onCreateEvolution}>
              Nova evolução
            </Button>
          ) : (
            <Button asChild variant="outline">
              <Link href={getPatientHref(onCreateEvolutionHref)}>
                Nova evolução
              </Link>
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  )
}
