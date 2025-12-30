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
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  PatientTimeline,
  type TimelineEvent,
  formatDate,
} from "./Timeline";

type PatientHistoryProps = {
  patient: Patient;
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

export const PatientHistory = ({ patient }: PatientHistoryProps) => {
  const router = useRouter();
  const age = calculateAge(patient.birthDate);

  const timelineEvents = useMemo<TimelineEvent[]>(() => {
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
    ];

    return demoEvents.sort(
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

      <div className="grid gap-6 lg:grid-cols-4">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-primary/10 p-2 text-primary">
                <UserRound className="h-5 w-5" />
              </div>
              <div>
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
              <div className="flex flex-wrap items-center gap-4 text-sm">
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

        <PatientTimeline events={timelineEvents} />
      </div>
    </div>

  );
};
