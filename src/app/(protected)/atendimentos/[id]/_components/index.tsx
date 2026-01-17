import { Separator } from "@/components/ui/separator"
import type { Attendance as PrismaAttendance, Patient, User } from "@prisma/client"
import { AttendanceType } from "@prisma/client"
import type { AttendanceAttachment } from "@/types/attendance"
import { fromPrismaEnumValue } from "@/lib/prisma/enum-helpers"

type AttendanceWithRelations = PrismaAttendance & {
  patient: Patient | null
  professional: Pick<User, "id" | "name"> | null
}

const formatDate = (value: Date | string, options?: Intl.DateTimeFormatOptions) => {
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return "-"
  return new Intl.DateTimeFormat("pt-BR", options).format(date)
}

const formatTime = (value: Date) =>
  new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(value)

const formatAddress = (patient: Patient | null) => {
  if (!patient) return "-"
  const parts = [
    [patient.street, patient.number].filter(Boolean).join(", "),
    patient.neighborhood,
    [patient.city, patient.state].filter(Boolean).join(" - "),
  ]
    .filter((part) => part && part.trim().length > 0)
    .join(" - ")

  return parts || "-"
}

const infoOrDash = (value?: string | null) =>
  value && value.trim().length > 0 ? value : "-"

const getAttachments = (value: unknown): AttendanceAttachment[] => {
  if (!Array.isArray(value)) return []
  return value
    .map((attachment) => {
      if (
        attachment &&
        typeof attachment === "object" &&
        "id" in attachment &&
        "name" in attachment
      ) {
        return attachment as AttendanceAttachment
      }
      return null
    })
    .filter(Boolean) as AttendanceAttachment[]
}

export const AttendancesShow = ({ attendance }: { attendance: AttendanceWithRelations }) => {
  const startDate = attendance.date instanceof Date ? attendance.date : new Date(attendance.date)
  const endDate = new Date(startDate.getTime() + 60 * 60 * 1000)
  const normalizedType = fromPrismaEnumValue(attendance.type)
  const isEvolution = normalizedType === fromPrismaEnumValue(AttendanceType.EVOLUTION)
  const attachments = getAttachments(attendance.attachments)
  const cidLabel =
    attendance.cidCode && attendance.cidDescription
      ? `${attendance.cidCode} - ${attendance.cidDescription}`
      : attendance.cidCode || attendance.cidDescription || "-"
  const cifLabel =
    attendance.cifCode && attendance.cifDescription
      ? `${attendance.cifCode} - ${attendance.cifDescription}`
      : attendance.cifCode || attendance.cifDescription || "-"

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">
          {attendance.patient?.name ?? "Atendimento"}
        </h1>
        <p className="text-muted-foreground">
          Data do atendimento:{" "}
          {formatDate(attendance.date, {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          })}{" "}
          das {formatTime(startDate)} até {formatTime(endDate)}
        </p>
      </div>

      <Separator />

      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold">Informações do paciente</h2>
        </div>
        <dl className="grid gap-4 md:grid-cols-2">
          <div>
            <dt className="text-sm text-muted-foreground">Data de nascimento</dt>
            <dd className="text-sm font-medium">
              {attendance.patient?.birthDate
                ? formatDate(attendance.patient.birthDate, {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                })
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-muted-foreground">Sexo</dt>
            <dd className="text-sm font-medium capitalize">
              {attendance.patient?.gender ?? "-"}
            </dd>
          </div>
          <div className="md:col-span-2">
            <dt className="text-sm text-muted-foreground">Endereço</dt>
            <dd className="text-sm font-medium">{formatAddress(attendance.patient)}</dd>
          </div>
          <div>
            <dt className="text-sm text-muted-foreground">CPF</dt>
            <dd className="text-sm font-medium">
              {infoOrDash(attendance.patient?.cpf)}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-muted-foreground">Fisioterapeuta</dt>
            <dd className="text-sm font-medium">
              {infoOrDash(attendance.professional?.name)}
            </dd>
          </div>
        </dl>
      </section>

      <Separator />

      {isEvolution ? (
        <section className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold">Detalhes da evolução</h2>
          </div>
          <div className="rounded-lg border p-4">
            <p className="text-sm font-semibold">CID - Doença</p>
            <p className="mt-2 text-sm text-muted-foreground">{cidLabel}</p>
          </div>
          <div className="rounded-lg border p-4">
            <p className="text-sm font-semibold">CIF - Funcionalidade</p>
            <p className="mt-2 text-sm text-muted-foreground">{cifLabel}</p>
          </div>
          <div className="rounded-lg border p-4">
            <p className="text-sm font-semibold">Evolução</p>
            <p className="mt-2 text-sm text-muted-foreground whitespace-pre-line">
              {attendance.evolutionNotes && attendance.evolutionNotes.trim()
                ? attendance.evolutionNotes
                : "Não informado."}
            </p>
          </div>
          <div className="rounded-lg border p-4">
            <p className="text-sm font-semibold">Anexos</p>
            {attachments.length > 0 ? (
              <ul className="mt-2 space-y-2 text-sm">
                {attachments.map((attachment) => (
                  <li
                    key={attachment.id}
                    className="flex items-center justify-between rounded-md border px-3 py-2"
                  >
                    <div>
                      <p className="font-medium">{attachment.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {attachment.type} • {(attachment.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                    {attachment.content || attachment.url ? (
                      <a
                        href={attachment.content ?? attachment.url ?? "#"}
                        download={attachment.name}
                        className="text-sm font-medium text-primary hover:underline"
                      >
                        Baixar
                      </a>
                    ) : null}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-sm text-muted-foreground">Nenhum arquivo anexado.</p>
            )}
          </div>
        </section>
      ) : (
        <section className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold">Anamnese</h2>
          </div>
          {[
            {
              label: "Queixa principal (QP) / Motivo da avaliação",
              value: attendance.mainComplaint,
            },
            {
              label: "História da doença atual (HDA)",
              value: attendance.currentIllnessHistory,
            },
            {
              label: "História médica pregressa (HMP)",
              value: attendance.pastMedicalHistory,
            },
            {
              label: "Histórico familiar (HF)",
              value: attendance.familyHistory,
            },
            {
              label: "Observações",
              value: attendance.observations,
            },
          ].map(({ label, value }) => (
            <div key={label} className="rounded-lg border p-4">
              <p className="text-sm font-semibold">{label}</p>
              <p className="mt-2 text-sm text-muted-foreground whitespace-pre-line">
                {value && value.trim().length > 0 ? value : "Não informado."}
              </p>
            </div>
          ))}
        </section>
      )}
    </div>
  )
}
