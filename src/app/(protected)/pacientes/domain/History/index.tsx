"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, type UseFormReturn } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import {
  ArrowLeft,
  BookmarkCheck,
  CalendarCheck,
  CalendarClock,
  ClipboardList,
  HeartPulse,
  Loader2,
  UserRound,
} from "lucide-react";
import type {
  ApiResponse,
  HistoryKind,
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { PatientTimeline, formatDate } from "./Timeline";
import { apiRequest } from "@/app/utils/services/api";
import {
  baseHistorySchema,
  historyRefinement,
  type CreateHistoryInput,
} from "@/app/api/patients/history/validation";
import { useRecord } from "@/app/utils/hooks/useRecord";

type HistoryEntryWithAssessment = PatientHistoryEntry & {
  assessmentMainComplaint?: string | null;
  assessmentDiseaseHistory?: string | null;
  assessmentMedicalHistory?: string | null;
  assessmentFamilyHistory?: string | null;
  assessmentObservations?: string | null;
};

type HistoryFormInstance = UseFormReturn<HistoryFormValues, any>;

type PatientHistoryProps = {
  patientId: string;
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

type HistoryFormValues = CreateHistoryInput & {
  attachment?: File;
  removeAttachment?: boolean;
};

const defaultFormValues: HistoryFormValues = {
  kind: "evolution",
  cidCode: "",
  cidDescription: "",
  content: "",
  attachment: undefined,
  removeAttachment: false,
  assessmentMainComplaint: "",
  assessmentDiseaseHistory: "",
  assessmentMedicalHistory: "",
  assessmentFamilyHistory: "",
  assessmentObservations: "",
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

export const PatientHistory = ({ patientId }: PatientHistoryProps) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const queryKey = ["patient-history", patientId];
  const historyEndpoint = `/patients/${patientId}/history`;

  const {
    data: patient,
    error: patientError,
  } = useRecord<Patient>("/patients", patientId);

  const [cidSearch, setCidSearch] = useState("");
  const [dialogState, setDialogState] = useState<{
    isOpen: boolean;
    entry: HistoryEntryWithAssessment | null;
  }>({ isOpen: false, entry: null });
  const [deleteTarget, setDeleteTarget] = useState<HistoryEntryWithAssessment | null>(
    null,
  );

  const debouncedCid = useDebounce(cidSearch, 300);

  const form = useForm<HistoryFormValues>({
    resolver: zodResolver(historyFormSchema),
    defaultValues: defaultFormValues,
  });

  useEffect(() => {
    form.register("removeAttachment");
  }, [form]);

  const selectedKind = form.watch("kind");
  const isAssessment = selectedKind === "assessment";
  const editingEntry = dialogState.entry;

  const { data: historyEntries = [], isLoading: isHistoryLoading } = useQuery({
    queryKey,
    enabled: Boolean(patientId),
    queryFn: async () => {
      const response = await apiRequest<ApiResponse<HistoryEntryWithAssessment[]>>(
        historyEndpoint,
      );
      return response.data ?? [];
    },
  });

  const { data: cidOptions = [] } = useQuery({
    queryKey: ["cid-search", debouncedCid],
    enabled: !isAssessment && debouncedCid.length >= 2,
    queryFn: async () => {
      const response = await apiRequest<ApiResponse<{ items: CidOption[] }>>(
        "/cid",
        { params: { q: debouncedCid } },
      );
      return response.data?.items ?? [];
    },
  });

  const createHistoryMutation = useMutation({
    mutationFn: (formData: FormData) =>
      apiRequest<ApiResponse<HistoryEntryWithAssessment>>(historyEndpoint, {
        method: "POST",
        data: formData,
      }),
    onSuccess: (response) => {
      toast.success(response.message ?? "Registro criado");
      queryClient.invalidateQueries({ queryKey });
      closeHistoryDialog();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Erro ao salvar registro");
    },
  });

  const updateHistoryMutation = useMutation({
    mutationFn: ({ historyId, formData }: { historyId: string; formData: FormData }) =>
      apiRequest<ApiResponse<HistoryEntryWithAssessment>>(
        `${historyEndpoint}/${historyId}`,
        {
          method: "PUT",
          data: formData,
        },
      ),
    onSuccess: (response) => {
      toast.success(response.message ?? "Registro atualizado");
      queryClient.invalidateQueries({ queryKey });
      closeHistoryDialog();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Erro ao atualizar registro");
    },
  });

  const deleteHistoryMutation = useMutation({
    mutationFn: (historyId: string) =>
      apiRequest<ApiResponse>(`${historyEndpoint}/${historyId}`, { method: "DELETE" }),
    onSuccess: (response) => {
      toast.success(response.message ?? "Registro excluído");
      queryClient.invalidateQueries({ queryKey });
      setDeleteTarget(null);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Erro ao excluir registro");
    },
  });

  const openHistoryDialog = ({
    entry,
    kind,
  }: { entry?: HistoryEntryWithAssessment; kind?: HistoryKind } = {}) => {
    const targetKind = entry?.kind ?? kind ?? "evolution";

    const initialValues: HistoryFormValues = entry
      ? {
        kind: entry.kind,
        cidCode: entry.cidCode ?? "",
        cidDescription: entry.cidDescription ?? "",
        content: entry.content ?? "",
        attachment: undefined,
        removeAttachment: false,
        assessmentMainComplaint: entry.assessmentMainComplaint ?? "",
        assessmentDiseaseHistory: entry.assessmentDiseaseHistory ?? "",
        assessmentMedicalHistory: entry.assessmentMedicalHistory ?? "",
        assessmentFamilyHistory: entry.assessmentFamilyHistory ?? "",
        assessmentObservations: entry.assessmentObservations ?? entry.content ?? "",
      }
      : {
        ...defaultFormValues,
        kind: targetKind,
      };

    form.reset(initialValues);
    setCidSearch(
      targetKind === "evolution" && initialValues.cidCode
        ? initialValues.cidDescription
          ? `${initialValues.cidCode} · ${initialValues.cidDescription}`
          : initialValues.cidCode
        : "",
    );
    setDialogState({ isOpen: true, entry: entry ?? null });
  };

  const closeHistoryDialog = () => {
    setDialogState({ isOpen: false, entry: null });
    setCidSearch("");
    form.reset(defaultFormValues);
  };

  const handleCidSearchChange = (value: string) => {
    setCidSearch(value);
    form.setValue("cidCode", value ? value.toUpperCase() : "");
    if (!value) {
      form.setValue("cidDescription", "");
    }
  };

  const handleSelectCid = (option: CidOption) => {
    if (form.getValues("kind") !== "evolution") return;
    setCidSearch(`${option.code} · ${option.name}`);
    form.setValue("cidCode", option.code, { shouldValidate: true });
    form.setValue("cidDescription", option.name, { shouldValidate: true });
  };

  const buildFormData = (values: HistoryFormValues) => {
    const formData = new FormData();
    formData.append("kind", values.kind);
    const isAssessmentForm = values.kind === "assessment";

    if (isAssessmentForm) {
      formData.append("assessmentMainComplaint", values.assessmentMainComplaint ?? "");
      formData.append("assessmentDiseaseHistory", values.assessmentDiseaseHistory ?? "");
      formData.append("assessmentMedicalHistory", values.assessmentMedicalHistory ?? "");
      formData.append("assessmentFamilyHistory", values.assessmentFamilyHistory ?? "");
      formData.append("assessmentObservations", values.assessmentObservations ?? "");
      formData.append(
        "content",
        values.assessmentObservations ?? values.content ?? "Avaliação registrada",
      );
    } else {
      if (values.cidCode) formData.append("cidCode", values.cidCode);
      if (values.cidDescription) formData.append("cidDescription", values.cidDescription);
      formData.append("content", values.content ?? "");
    }

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

  const handleDeleteHistory = () => {
    if (!deleteTarget) return;
    deleteHistoryMutation.mutate(deleteTarget.id);
  };

  const age = useMemo(() => calculateAge(patient?.birthDate ?? null), [patient?.birthDate]);

  const personalDetails = useMemo(
    () =>
      patient
        ? [
          { label: "Idade", value: age ? `${age} anos` : "Não informado" },
          { label: "Data de nascimento", value: formatDate(patient.birthDate) },
          { label: "Gênero", value: emptyFallback(patient.gender) },
          { label: "Estado civil", value: emptyFallback(patient.maritalStatus) },
          { label: "CPF", value: emptyFallback(patient.cpf) },
          { label: "RG", value: emptyFallback(patient.rg) },
          { label: "Profissão", value: emptyFallback(patient.profession) },
          { label: "Empresa", value: emptyFallback(patient.companyName) },
        ]
        : [],
    [age, patient],
  );

  const addressDetails = useMemo(
    () =>
      patient
        ? [
          { label: "Endereço", value: emptyFallback(patient.street) },
          { label: "Número", value: emptyFallback(patient.number) },
          { label: "Bairro", value: emptyFallback(patient.neighborhood) },
          { label: "Cidade", value: emptyFallback(patient.city) },
          { label: "Estado", value: emptyFallback(patient.state) },
          { label: "CEP", value: emptyFallback(patient.cep) },
          { label: "Complemento", value: emptyFallback(patient.complement) },
          { label: "País", value: emptyFallback(patient.country) },
        ]
        : [],
    [patient],
  );

  const isSaving = createHistoryMutation.isPending || updateHistoryMutation.isPending;
  const isDialogOpen = dialogState.isOpen;

  if (patientError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Não foi possível carregar o paciente</CardTitle>
          <CardDescription>Tente novamente em instantes.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" onClick={() => router.push("/pacientes")}>
            Voltar para listagem
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!patient) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-2 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" /> Carregando paciente...
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        <PatientHeader
          patient={patient}
          onBack={() => router.push("/pacientes")}
          onList={() => router.push("/pacientes")}
          onSchedule={() => router.push("/agendamentos")}
        />

        <div className="grid gap-4 lg:grid-cols-4">
          <PatientSummaryCard
            patient={patient}
            personalDetails={personalDetails}
            addressDetails={addressDetails}
            onEdit={() => router.push("/pacientes")}
          />

          <div className="lg:col-span-2">
            <PatientTimeline
              entries={historyEntries}
              isLoading={isHistoryLoading}
              onEdit={(entry) => openHistoryDialog({ entry })}
              onDelete={(entry) => setDeleteTarget(entry)}
              onNewEvaluation={() => openHistoryDialog({ kind: "assessment" })}
              onNewEvolution={() => openHistoryDialog({ kind: "evolution" })}
            />
          </div>
        </div>
      </div>

      <HistoryFormDialog
        form={form}
        isOpen={isDialogOpen}
        onClose={closeHistoryDialog}
        onSubmit={onSubmit}
        cidOptions={cidOptions}
        cidSearch={cidSearch}
        onCidSearchChange={handleCidSearchChange}
        onCidSelect={handleSelectCid}
        isSaving={isSaving}
        editingEntry={editingEntry}
      />

      <DeleteHistoryDialog
        entry={deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteHistory}
        isDeleting={deleteHistoryMutation.isPending}
      />
    </>
  );
};

type DetailItem = { label: string; value: string };

const PatientHeader = ({
  patient,
  onBack,
  onList,
  onSchedule,
}: {
  patient: Patient;
  onBack: () => void;
  onList: () => void;
  onSchedule: () => void;
}) => (
  <div className="flex flex-wrap items-center justify-between gap-4">
    <div className="space-y-2">
      <Button
        variant="ghost"
        className="w-fit px-0 text-muted-foreground hover:text-primary"
        onClick={onBack}
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
      <Button variant="outline" onClick={onList}>
        <ClipboardList className="mr-2 h-4 w-4" />
        Ver listagem
      </Button>
      <Button variant="default" onClick={onSchedule}>
        <CalendarClock className="mr-2 h-4 w-4" />
        Agendar sessão
      </Button>
    </div>
  </div>
);

const DetailSection = ({ title, items }: { title: string; items: DetailItem[] }) => (
  <section>
    <h3 className="text-sm font-semibold uppercase text-muted-foreground">{title}</h3>
    <div className="mt-3 grid gap-4 sm:grid-cols-2">
      {items.map((detail) => (
        <div key={detail.label}>
          <p className="text-xs uppercase text-muted-foreground">{detail.label}</p>
          <p className="font-medium">{detail.value}</p>
        </div>
      ))}
    </div>
  </section>
);

const PatientSummaryCard = ({
  patient,
  personalDetails,
  addressDetails,
  onEdit,
}: {
  patient: Patient;
  personalDetails: DetailItem[];
  addressDetails: DetailItem[];
  onEdit: () => void;
}) => (
  <Card className="lg:col-span-2">
    <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <div className="rounded-full bg-primary/10 p-2 text-primary">
          <UserRound className="h-5 w-5" />
        </div>
        <CardDescription>Informações principais, contatos e dados clínicos</CardDescription>
      </div>
      <CardAction>
        <Button variant="outline" onClick={onEdit}>
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

      <DetailSection title="Dados pessoais" items={personalDetails} />
      <Separator borderSize="0" />
      <DetailSection title="Endereço" items={addressDetails} />
    </CardContent>
  </Card>
);

type HistoryFormDialogProps = {
  form: HistoryFormInstance;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: HistoryFormValues) => void;
  cidOptions: CidOption[];
  cidSearch: string;
  onCidSearchChange: (value: string) => void;
  onCidSelect: (option: CidOption) => void;
  isSaving: boolean;
  editingEntry: HistoryEntryWithAssessment | null;
};

const HistoryFormDialog = ({
  form,
  isOpen,
  onClose,
  onSubmit,
  cidOptions,
  cidSearch,
  onCidSearchChange,
  onCidSelect,
  isSaving,
  editingEntry,
}: HistoryFormDialogProps) => {
  const kind = form.watch("kind");
  const isAssessment = kind === "assessment";
  const dialogTitle = editingEntry
    ? isAssessment
      ? "Editar avaliação"
      : "Editar evolução"
    : isAssessment
      ? "Nova avaliação"
      : "Nova evolução";
  const dialogDescription = isAssessment
    ? "Registre os campos da anamnese do paciente."
    : "Informe os detalhes clínicos e o CID associado ao atendimento.";

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
          <DialogDescription>{dialogDescription}</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <input type="hidden" {...form.register("kind")} value={kind} />
            <input type="hidden" {...form.register("cidCode")} />
            <input type="hidden" {...form.register("cidDescription")} />

            {isAssessment ? (
              <AssessmentFields form={form} />
            ) : (
              <EvolutionFields
                cidSearch={cidSearch}
                cidOptions={cidOptions}
                onCidSearchChange={onCidSearchChange}
                onSelectCid={onCidSelect}
                form={form}
              />
            )}

            <AttachmentField form={form} editingEntry={editingEntry} />

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving
                  ? "Salvando..."
                  : editingEntry
                    ? "Salvar alterações"
                    : kind === "assessment"
                      ? "Registrar avaliação"
                      : "Registrar evolução"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

const AssessmentFields = ({ form }: { form: HistoryFormInstance }) => (
  <div className="space-y-4">
    <FormField
      control={form.control}
      name="assessmentMainComplaint"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Queixa principal (QP) / Motivo da avaliação</FormLabel>
          <FormControl>
            <Textarea
              rows={4}
              placeholder="Descreva a queixa principal"
              {...field}
              value={field.value ?? ""}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
    <FormField
      control={form.control}
      name="assessmentDiseaseHistory"
      render={({ field }) => (
        <FormItem>
          <FormLabel>História da doença atual (HDA)</FormLabel>
          <FormControl>
            <Textarea
              rows={4}
              placeholder="Detalhes da doença atual"
              {...field}
              value={field.value ?? ""}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
    <FormField
      control={form.control}
      name="assessmentMedicalHistory"
      render={({ field }) => (
        <FormItem>
          <FormLabel>História médica pregressa (HMP)</FormLabel>
          <FormControl>
            <Textarea
              rows={4}
              placeholder="Antecedentes médicos relevantes"
              {...field}
              value={field.value ?? ""}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
    <FormField
      control={form.control}
      name="assessmentFamilyHistory"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Histórico familiar (HF)</FormLabel>
          <FormControl>
            <Textarea
              rows={4}
              placeholder="Doenças e condições na família"
              {...field}
              value={field.value ?? ""}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
    <FormField
      control={form.control}
      name="assessmentObservations"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Observações</FormLabel>
          <FormControl>
            <Textarea
              rows={4}
              placeholder="Notas complementares da avaliação"
              {...field}
              value={field.value ?? ""}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  </div>
);

type EvolutionFieldsProps = {
  cidSearch: string;
  cidOptions: CidOption[];
  onCidSearchChange: (value: string) => void;
  onSelectCid: (option: CidOption) => void;
  form: HistoryFormInstance;
};

const EvolutionFields = ({
  cidSearch,
  cidOptions,
  onCidSearchChange,
  onSelectCid,
  form,
}: EvolutionFieldsProps) => (
  <>
    <div className="space-y-2">
      <Label>CID - Doença</Label>
      <Input
        placeholder="Digite o código ou nome da doença"
        value={cidSearch}
        onChange={(event) => onCidSearchChange(event.target.value)}
      />
      {cidSearch && (
        <p className="text-xs text-muted-foreground">
          Selecione um resultado para preencher o CID.
        </p>
      )}
      {form.formState.errors.cidCode && (
        <p className="text-sm text-destructive">{form.formState.errors.cidCode.message}</p>
      )}
      {cidOptions.length > 0 && (
        <div className="max-h-48 overflow-y-auto rounded-md border bg-background shadow">
          {cidOptions.map((option) => (
            <button
              type="button"
              key={option.code}
              className="w-full px-3 py-2 text-left text-sm hover:bg-muted"
              onClick={() => onSelectCid(option)}
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
              placeholder="Descreva o estado atual, procedimentos e respostas observadas"
              {...field}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  </>
);

type AttachmentFieldProps = {
  form: HistoryFormInstance;
  editingEntry: HistoryEntryWithAssessment | null;
};

const AttachmentField = ({ form, editingEntry }: AttachmentFieldProps) => {
  const removeAttachment = form.watch("removeAttachment");
  const fieldValue = form.watch("attachment");

  return (
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
          {fieldValue instanceof File && (
            <p className="text-xs text-muted-foreground">{fieldValue.name}</p>
          )}
          {editingEntry?.attachmentUrl && !fieldValue && !removeAttachment && (
            <div className="mt-2 flex items-center justify-between rounded-md border bg-muted/40 px-3 py-2 text-sm">
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
          {removeAttachment && (
            <p className="text-xs text-muted-foreground">
              O anexo atual será removido ao salvar.
            </p>
          )}
        </FormItem>
      )}
    />
  );
};

type DeleteHistoryDialogProps = {
  entry: HistoryEntryWithAssessment | null;
  onClose: () => void;
  onConfirm: () => void;
  isDeleting: boolean;
};

const DeleteHistoryDialog = ({
  entry,
  onClose,
  onConfirm,
  isDeleting,
}: DeleteHistoryDialogProps) => (
  <AlertDialog open={Boolean(entry)} onOpenChange={(open) => !open && onClose()}>
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>Excluir registro</AlertDialogTitle>
        <AlertDialogDescription>
          Esta ação não pode ser desfeita. Deseja realmente remover este item?
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
        <AlertDialogAction
          onClick={onConfirm}
          disabled={isDeleting}
          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
        >
          {isDeleting ? "Excluindo..." : "Excluir"}
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
);
