"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  BookmarkCheck,
  CalendarCheck,
  CalendarClock,
  ClipboardList,
  HeartPulse,
  History as HistoryIcon,
  UserRound,
} from "lucide-react";
import type { Patient } from "@/app/utils/types/patient";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

type PatientHistoryProps = {
  patient: Patient;
};

type TimelineEvent = {
  id: string;
  title: string;
  description: string;
  date: Date | string;
  type: "evaluation" | "evolution" | "system" | "note";
  author?: string;
};

const typeStyles: Record<TimelineEvent["type"], string> = {
  evaluation: "bg-emerald-50 text-emerald-700 border-emerald-100",
  evolution: "bg-blue-50 text-blue-700 border-blue-100",
  note: "bg-amber-50 text-amber-700 border-amber-100",
  system: "bg-slate-50 text-slate-700 border-slate-200",
};

const formatDate = (value?: Date | string | null, withTime = false) => {
  if (!value) return "Não informado";
  const date = typeof value === "string" ? new Date(value) : value;

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: withTime ? "long" : "2-digit",
    year: "numeric",
    ...(withTime ? { hour: "2-digit", minute: "2-digit" } : {}),
  }).format(date);
};

const calculateAge = (birthDate: Date | string | null) => {
  if (!birthDate) return null;
  const birth = typeof birthDate === "string" ? new Date(birthDate) : birthDate;
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }

  return age;
};

const emptyFallback = (value?: string | null) =>
  value && value.trim() !== "" ? value : "Não informado";

const QuickActionCard = ({
  title,
  description,
  icon,
  triggerLabel,
  dialogTitle,
  dialogDescription,
  children,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  triggerLabel: string;
  dialogTitle: string;
  dialogDescription: string;
  children: React.ReactNode;
}) => (
  <Card className="h-full">
    <CardHeader>
      <div className="flex items-start gap-3">
        <div className="rounded-xl bg-muted text-muted-foreground p-2">{icon}</div>
        <div>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
      </div>
    </CardHeader>
    <CardContent>
      <Dialog>
        <DialogTrigger asChild>
          <Button className="w-full">{triggerLabel}</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{dialogTitle}</DialogTitle>
            <DialogDescription>{dialogDescription}</DialogDescription>
          </DialogHeader>
          {children}
          <DialogFooter>
            <Button disabled className="w-full">
              Em breve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </CardContent>
  </Card>
);

const TimelineCard = ({ events }: { events: TimelineEvent[] }) => (
  <Card>
    <CardHeader className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <HistoryIcon className="h-5 w-5 text-primary" />
        <div>
          <CardTitle>Linha do tempo</CardTitle>
          <CardDescription>
            Evoluções clínicas, avaliações e acontecimentos relevantes
          </CardDescription>
        </div>
      </div>
    </CardHeader>
    <CardContent>
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
                      {event.type === "evaluation"
                        ? "Avaliação"
                        : event.type === "evolution"
                        ? "Evolução"
                        : event.type === "note"
                        ? "Observação"
                        : "Sistema"}
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
    </CardContent>
  </Card>
);

const EvaluationForm = () => (
  <form className="space-y-4">
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="space-y-2">
        <Label>Data da avaliação</Label>
        <Input type="date" />
      </div>
      <div className="space-y-2">
        <Label>Profissional responsável</Label>
        <Input placeholder="Ex: Dr. João" />
      </div>
    </div>
    <div className="space-y-2">
      <Label>Objetivo principal</Label>
      <Input placeholder="Ex: Reabilitação pós-operatória" />
    </div>
    <div className="space-y-2">
      <Label>Resumo da avaliação</Label>
      <Textarea rows={4} placeholder="Registre achados clínicos, testes e observações" />
    </div>
  </form>
);

const EvolutionForm = () => (
  <form className="space-y-4">
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="space-y-2">
        <Label>Data da evolução</Label>
        <Input type="date" />
      </div>
      <div className="space-y-2">
        <Label>Profissional responsável</Label>
        <Input placeholder="Ex: Dra. Ana" />
      </div>
    </div>
    <div className="space-y-2">
      <Label>Intervenções realizadas</Label>
      <Textarea rows={3} placeholder="Exercícios, técnicas, orientações..." />
    </div>
    <div className="space-y-2">
      <Label>Resposta do paciente</Label>
      <Textarea rows={3} placeholder="Evolução do quadro, dor, mobilidade..." />
    </div>
  </form>
);

export const PatientHistory = ({ patient }: PatientHistoryProps) => {
  const router = useRouter();
  const age = calculateAge(patient.birthDate);

  const timelineEvents = useMemo<TimelineEvent[]>(() => {
    const baseEvents: TimelineEvent[] = [
      {
        id: "created",
        title: "Paciente cadastrado",
        description: "Ficha criada no sistema.",
        date: patient.createdAt,
        type: "system",
      },
    ];

    if (patient.updatedAt !== patient.createdAt) {
      baseEvents.push({
        id: "updated",
        title: "Dados atualizados",
        description: "Informações de contato ou cadastro foram revisadas.",
        date: patient.updatedAt,
        type: "system",
      });
    }

    const demoEvents: TimelineEvent[] = [
      {
        id: "evaluation-latest",
        title: "Avaliação funcional",
        description:
          "Paciente apresentou melhora na amplitude de movimento e redução de dor referida.",
        date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
        type: "evaluation",
        author: "Dr. João Silva",
      },
      {
        id: "evolution-01",
        title: "Evolução semanal",
        description:
          "Progresso consistente na marcha assistida. Planejada transição para exercícios proprioceptivos.",
        date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 8),
        type: "evolution",
        author: "Dra. Ana Costa",
      },
      {
        id: "note-initial",
        title: "Observação inicial",
        description: patient.notes
          ? patient.notes
          : "Sem observações complementares registradas.",
        date: patient.createdAt,
        type: "note",
        author: "Equipe FisioTime",
      },
    ];

    return [...baseEvents, ...demoEvents].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );
  }, [patient]);

  const personalDetails = [
    { label: "Idade", value: age ? `${age} anos` : "Não informado" },
    { label: "Data de nascimento", value: formatDate(patient.birthDate) },
    { label: "Gênero", value: emptyFallback(patient.gender) },
    { label: "Estado civil", value: emptyFallback(patient.maritalStatus) },
    { label: "CPF", value: emptyFallback(patient.cpf) },
    { label: "RG", value: emptyFallback(patient.rg) },
    { label: "Profissão", value: emptyFallback(patient.profession) },
    { label: "Empresa", value: emptyFallback(patient.companyName) },
  ];

  const addressDetails = [
    { label: "Endereço", value: emptyFallback(patient.street) },
    { label: "Número", value: emptyFallback(patient.number) },
    { label: "Bairro", value: emptyFallback(patient.neighborhood) },
    { label: "Cidade", value: emptyFallback(patient.city) },
    { label: "Estado", value: emptyFallback(patient.state) },
    { label: "CEP", value: emptyFallback(patient.cep) },
    { label: "Complemento", value: emptyFallback(patient.complement) },
    { label: "País", value: emptyFallback(patient.country) },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-2">
          <Button
            variant="ghost"
            className="w-fit px-0 text-muted-foreground hover:text-primary"
            onClick={() => router.push("/pacientes")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para pacientes
          </Button>
          <div>
            <p className="text-sm text-muted-foreground">Histórico de atendimento</p>
            <h1 className="text-3xl font-bold tracking-tight">{patient.name}</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Última atualização {formatDate(patient.updatedAt, true)}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => router.push("/pacientes")}>
            <ClipboardList className="mr-2 h-4 w-4" />
            Ver listagem
          </Button>
          <Button variant="default" onClick={() => router.push("/agendamentos")}>
            <CalendarClock className="mr-2 h-4 w-4" />
            Agendar sessão
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-primary/10 p-2 text-primary">
                <UserRound className="h-5 w-5" />
              </div>
              <div>
                <CardTitle>Demonstração do paciente</CardTitle>
                <CardDescription>
                  Informações principais, contatos e dados clínicos
                </CardDescription>
              </div>
            </div>
            <CardAction>
              <Button variant="outline" onClick={() => router.push("/pacientes")}>
                Editar cadastro
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="rounded-xl border bg-muted/30 p-4">
              <div className="flex flex-wrap items-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <CalendarCheck className="h-4 w-4 text-primary" />
                  <span>Início: {formatDate(patient.createdAt)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <HeartPulse className="h-4 w-4 text-rose-500" />
                  <span>Notas: {emptyFallback(patient.notes)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <BookmarkCheck className="h-4 w-4 text-emerald-500" />
                  <span>Contato: {patient.phone}</span>
                </div>
              </div>
            </div>

            <section>
              <h3 className="text-sm font-semibold text-muted-foreground uppercase">
                Dados pessoais
              </h3>
              <div className="mt-3 grid gap-4 sm:grid-cols-2">
                {personalDetails.map((detail) => (
                  <div key={detail.label}>
                    <p className="text-xs uppercase text-muted-foreground">{detail.label}</p>
                    <p className="font-medium">{detail.value}</p>
                  </div>
                ))}
              </div>
            </section>

            <Separator />

            <section>
              <h3 className="text-sm font-semibold text-muted-foreground uppercase">
                Endereço
              </h3>
              <div className="mt-3 grid gap-4 sm:grid-cols-2">
                {addressDetails.map((detail) => (
                  <div key={detail.label}>
                    <p className="text-xs uppercase text-muted-foreground">{detail.label}</p>
                    <p className="font-medium">{detail.value}</p>
                  </div>
                ))}
              </div>
            </section>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <QuickActionCard
            title="Nova avaliação"
            description="Registre achados clínicos e defina o plano terapêutico."
            icon={<ClipboardList className="h-5 w-5" />}
            triggerLabel="Registrar avaliação"
            dialogTitle="Nova avaliação"
            dialogDescription="Preencha os dados para documentar a avaliação do paciente."
          >
            <EvaluationForm />
          </QuickActionCard>

          <QuickActionCard
            title="Nova evolução"
            description="Documente progressos e intervenções realizadas."
            icon={<HistoryIcon className="h-5 w-5" />}
            triggerLabel="Registrar evolução"
            dialogTitle="Nova evolução"
            dialogDescription="Adicione detalhes sobre a sessão e os próximos passos."
          >
            <EvolutionForm />
          </QuickActionCard>
        </div>
      </div>

      <TimelineCard events={timelineEvents} />
    </div>
  );
};
