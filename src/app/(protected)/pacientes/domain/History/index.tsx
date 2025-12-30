"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
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
import type {
  ApiResponse,
  Patient,
  PatientHistoryEntry,
} from "@/app/utils/types/patient";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { PatientTimeline, formatDate } from "./Timeline";
import { apiRequest } from "@/app/utils/services/api";
import { baseHistorySchema, historyRefinement } from "@/app/api/patients/history/validation";
import { cn } from "@/lib/utils";

type PatientHistoryProps = {
  patient: Patient;
};

type CidOption = {
  code: string;
  name: string;
};

const historyFormSchema = baseHistorySchema
  .extend({
    attachment: z
      .custom<File | undefined>((value) => value === undefined || value instanceof File)
      .optional(),
    removeAttachment: z.boolean().optional(),
  })
  .superRefine(historyRefinement);

type HistoryFormValues = z.infer<typeof historyFormSchema> & {
  attachment?: File;
  removeAttachment?: boolean;
};

const defaultFormValues: HistoryFormValues = {
  kind: "EVOLUTION",
  cidCode: "",
  cidDescription: "",
  content: "",
  attachment: undefined,
  removeAttachment: false,
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

const useDebounce = <T,>(value: T, delay = 300) => {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
};

const QuickActionCard = ({
  title,
  description,
  icon,
  triggerLabel,
  onClick,
  buttonClassName,
  disabled,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  triggerLabel: string;
  onClick?: () => void;
  buttonClassName?: string;
  disabled?: boolean;
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
      <Button
        className={cn("w-full", buttonClassName)}
        type="button"
        onClick={onClick}
        disabled={disabled}
      >
        {triggerLabel}
      </Button>
    </CardContent>
  </Card>
);

export const PatientHistory = ({ patient }: PatientHistoryProps) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const queryKey = ["patient-history", patient.id];
  const age = calculateAge(patient.birthDate);
  const historyEndpoint = `/patients/${patient.id}/history`;

  const [isEvolutionDialogOpen, setEvolutionDialogOpen] = useState(false);
  const [cidSearch, setCidSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<PatientHistoryEntry | null>(null);
  const [editingEntry, setEditingEntry] = useState<PatientHistoryEntry | null>(null);

  const debouncedCid = useDebounce(cidSearch, 300);

const form = useForm<HistoryFormValues>({
  resolver: zodResolver(historyFormSchema),
  defaultValues: defaultFormValues,
});

useEffect(() => {
  form.register("removeAttachment");
}, [form]);

  const { data: historyEntries = [], isLoading: isHistoryLoading } = useQuery({
    queryKey,
    queryFn: async () => {
      const response = await apiRequest<ApiResponse<PatientHistoryEntry[]>>(
        historyEndpoint,
      );
      return response.data ?? [];
    },
  });

  const { data: cidOptions = [] } = useQuery({
    queryKey: ["cid-search", debouncedCid],
    queryFn: async () => {
      const response = await apiRequest<ApiResponse<{ items: CidOption[] }>>(
        "/cid",
        { params: { q: debouncedCid } },
      );
      return response.data?.items ?? [];
    },
    enabled: debouncedCid.length >= 2,
  });

  const createHistoryMutation = useMutation({
    mutationFn: (formData: FormData) =>
      apiRequest<ApiResponse<PatientHistoryEntry>>(historyEndpoint, {
        method: "POST",
        data: formData,
      }),
    onSuccess: (response) => {
      toast.success(response.message ?? "Evolução registrada com sucesso!");
      queryClient.invalidateQueries({ queryKey });
      closeEvolutionDialog();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Erro ao salvar evolução");
    },
  });

  const updateHistoryMutation = useMutation({
    mutationFn: ({
      historyId,
      formData,
    }: {
      historyId: string;
      formData: FormData;
    }) =>
      apiRequest<ApiResponse<PatientHistoryEntry>>(
        `${historyEndpoint}/${historyId}`,
        {
          method: "PUT",
          data: formData,
        },
      ),
    onSuccess: (response) => {
      toast.success(response.message ?? "Registro atualizado com sucesso");
      queryClient.invalidateQueries({ queryKey });
      closeEvolutionDialog();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Erro ao atualizar evolução");
    },
  });

  const deleteHistoryMutation = useMutation({
    mutationFn: (historyId: string) =>
      apiRequest<ApiResponse>(
        `${historyEndpoint}/${historyId}`,
        { method: "DELETE" },
      ),
    onSuccess: (response) => {
      toast.success(response.message ?? "Registro excluído");
      queryClient.invalidateQueries({ queryKey });
      setDeleteTarget(null);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Erro ao excluir registro");
    },
  });

  const handleSelectCid = (option: CidOption) => {
    setCidSearch(`${option.code} · ${option.name}`);
    form.setValue("cidCode", option.code, { shouldValidate: true });
    form.setValue("cidDescription", option.name, { shouldValidate: true });
  };

  const openEvolutionDialog = (entry?: PatientHistoryEntry) => {
    if (entry) {
      setEditingEntry(entry);
      form.reset({
        kind: entry.kind,
        cidCode: entry.cidCode ?? "",
        cidDescription: entry.cidDescription ?? "",
        content: entry.content,
        attachment: undefined,
        removeAttachment: false,
      });
      setCidSearch(
        entry.cidCode && entry.cidDescription
          ? `${entry.cidCode} · ${entry.cidDescription}`
          : entry.cidCode ?? "",
      );
    } else {
      setEditingEntry(null);
      form.reset(defaultFormValues);
      setCidSearch("");
    }
    setEvolutionDialogOpen(true);
  };

  const closeEvolutionDialog = () => {
    setEvolutionDialogOpen(false);
    setEditingEntry(null);
    setCidSearch("");
    form.reset(defaultFormValues);
  };

  const buildFormData = (values: HistoryFormValues) => {
    const formData = new FormData();
    formData.append("kind", values.kind);
    if (values.cidCode) formData.append("cidCode", values.cidCode);
    if (values.cidDescription) formData.append("cidDescription", values.cidDescription);
    formData.append("content", values.content);
    if (values.attachment instanceof File) {
      formData.append("attachment", values.attachment);
    }
    if (values.removeAttachment) {
      formData.append("attachmentUrl", "");
    }
    return formData;
  };

  const onSubmit = (values: HistoryFormValues) => {
    const formData = buildFormData(values);
    if (editingEntry) {
      updateHistoryMutation.mutate({ historyId: editingEntry.id, formData });
    } else {
      createHistoryMutation.mutate(formData);
    }
  };

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

  const isSaving =
    createHistoryMutation.isPending || updateHistoryMutation.isPending;

  return (
    <>
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

          <div className="space-y-6">
            <QuickActionCard
              title="Nova avaliação"
              description="Registre achados clínicos e defina o plano terapêutico."
              icon={<ClipboardList className="h-5 w-5" />}
              triggerLabel="Registrar avaliação"
              onClick={() => toast.info("Fluxo de avaliação estará disponível em breve.")}
              buttonClassName="bg-[#132850] text-white hover:bg-[#0f203d]"
            />
            <QuickActionCard
              title="Nova evolução"
              description="Documente progressos e intervenções realizadas."
              icon={<HistoryIcon className="h-5 w-5" />}
              triggerLabel="Registrar evolução"
              onClick={() => openEvolutionDialog()}
              buttonClassName="bg-[#0F312B] text-[#6BF0B2] hover:bg-[#0B2722]"
            />
          </div>
        </div>

        <PatientTimeline
          entries={historyEntries}
          isLoading={isHistoryLoading}
          onEdit={(entry) => openEvolutionDialog(entry)}
          onDelete={(entry) => setDeleteTarget(entry)}
        />
      </div>

      <Dialog
        open={isEvolutionDialogOpen}
        onOpenChange={(open) => {
          if (!open) closeEvolutionDialog();
        }}
      >
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingEntry ? "Editar evolução" : "Nova evolução"}
            </DialogTitle>
            <DialogDescription>
              {editingEntry
                ? "Atualize os dados registrados para esta evolução."
                : "Informe os detalhes clínicos e o CID associado ao atendimento."}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <input type="hidden" {...form.register("kind")} value={form.watch("kind")} />
              <input type="hidden" {...form.register("cidCode")} />
              <input type="hidden" {...form.register("cidDescription")} />

              <div className="space-y-2">
                <Label>CID - Doença</Label>
                <Input
                  placeholder="Digite o código ou nome da doença"
                  value={cidSearch}
                  onChange={(event) => {
                    const value = event.target.value;
                    setCidSearch(value);
                    form.setValue("cidCode", value.toUpperCase());
                    if (!value) {
                      form.setValue("cidDescription", "");
                    }
                  }}
                />
                {cidSearch && (
                  <p className="text-xs text-muted-foreground">
                    Selecione um resultado para preencher o CID.
                  </p>
                )}
                {form.formState.errors.cidCode && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.cidCode.message}
                  </p>
                )}
                {cidOptions.length > 0 && (
                  <div className="max-h-48 overflow-y-auto rounded-md border bg-background shadow">
                    {cidOptions.map((option) => (
                      <button
                        type="button"
                        key={option.code}
                        className="w-full px-3 py-2 text-left text-sm hover:bg-muted"
                        onClick={() => handleSelectCid(option)}
                      >
                        <span className="font-semibold">{option.code}</span>{" "}
                        <span className="text-muted-foreground">{option.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Evolução</FormLabel>
                    <FormControl>
                      <Textarea
                        rows={5}
                        placeholder="Descreva o estado atual do paciente, procedimentos realizados e respostas observadas."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="attachment"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Anexar arquivos (opcional)</FormLabel>
                    <FormControl>
                      <Input
                        type="file"
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                        onChange={(event) => field.onChange(event.target.files?.[0])}
                      />
                    </FormControl>
                    {field.value instanceof File && (
                      <p className="text-xs text-muted-foreground">
                        {field.value.name}
                      </p>
                    )}
                    {editingEntry?.attachmentUrl && !field.value && !form.watch("removeAttachment") && (
                      <div className="flex items-center justify-between rounded-md border bg-muted/40 px-3 py-2 text-sm">
                        <a
                          href={editingEntry.attachmentUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-primary underline"
                        >
                          Ver anexo atual
                        </a>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() => form.setValue("removeAttachment", true)}
                        >
                          Remover
                        </Button>
                      </div>
                    )}
                    {form.watch("removeAttachment") && (
                      <p className="text-xs text-muted-foreground">
                        O anexo atual será removido ao salvar.
                      </p>
                    )}
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={closeEvolutionDialog}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSaving}>
                  {isSaving
                    ? "Salvando..."
                    : editingEntry
                      ? "Salvar alterações"
                      : "Registrar evolução"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir evolução</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Tem certeza que deseja remover o registro?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteHistoryMutation.isPending}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteTarget && deleteHistoryMutation.mutate(deleteTarget.id)}
              disabled={deleteHistoryMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteHistoryMutation.isPending ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
