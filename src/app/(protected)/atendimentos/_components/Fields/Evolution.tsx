import { useRef, useState, type ChangeEvent } from "react"
import type { UseFormReturn } from "react-hook-form"
import type { AttendanceFormSchema } from "../schema"
import type { Patient } from "@/app/types/patient"
import { useDebouncedValue } from "@/app/hooks/useDebouncedValue"
import { useCidSearch } from "@/app/hooks/useCidSearch"
import type { CidRecord } from "@/app/types/cid"
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from "@/components/ui/form"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Loader2, Paperclip, Search, X } from "lucide-react"

interface EvolutionFieldsProps {
  form: UseFormReturn<AttendanceFormSchema>
  patients: Patient[]
  isLoadingPatients: boolean
}

const MIN_QUERY_LENGTH = 2

const formatCidOption = (record: CidRecord) => `${record.code} - ${record.description}`
const formatFileSize = (bytes: number) => {
  if (!bytes) return "0 KB"
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

const readFileAsDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result)
      } else {
        reject(new Error("Não foi possível ler o arquivo"))
      }
    }
    reader.onerror = () => reject(reader.error ?? new Error("Erro ao ler arquivo"))
    reader.readAsDataURL(file)
  })

export const EvolutionFields = ({ form, patients, isLoadingPatients }: EvolutionFieldsProps) => {
  const [cidQuery, setCidQuery] = useState("")
  const [isAttachmentsLoading, setIsAttachmentsLoading] = useState(false)
  const debouncedQuery = useDebouncedValue(cidQuery, 400)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { data: cidOptions = [], isFetching: isSearchingCid } = useCidSearch(debouncedQuery, {
    enabled: debouncedQuery.length >= MIN_QUERY_LENGTH,
    limit: 10,
  })

  const selectedCidCode = form.watch("cidCode")
  const selectedCidDescription = form.watch("cidDescription")
  const selectedCidLabel =
    selectedCidCode && selectedCidDescription ? formatCidOption({ code: selectedCidCode, description: selectedCidDescription }) : ""

  const handleCidSelect = (record: CidRecord) => {
    form.setValue("cidCode", record.code, { shouldDirty: true })
    form.setValue("cidDescription", record.description, { shouldDirty: true })
    setCidQuery("")
  }

  const handleClearCid = () => {
    form.setValue("cidCode", "", { shouldDirty: true })
    form.setValue("cidDescription", "", { shouldDirty: true })
  }

  const handleFilesSelected = async (
    event: ChangeEvent<HTMLInputElement>,
    onChange: (value: AttendanceFormSchema["attachments"]) => void,
    currentValue: AttendanceFormSchema["attachments"]
  ) => {
    const files = event.target.files
    if (!files?.length) return

    try {
      setIsAttachmentsLoading(true)
      const newAttachments = await Promise.all(
        Array.from(files).map(async (file) => ({
          id: crypto.randomUUID(),
          name: file.name,
          size: file.size,
          type: file.type || "application/octet-stream",
          content: await readFileAsDataUrl(file),
        }))
      )
      onChange([...(currentValue ?? []), ...newAttachments])
    } catch (error) {
      console.error(error)
    } finally {
      setIsAttachmentsLoading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const removeAttachment = (
    id: string,
    onChange: (value: AttendanceFormSchema["attachments"]) => void,
    currentValue: AttendanceFormSchema["attachments"]
  ) => {
    onChange((currentValue ?? []).filter((item) => item.id !== id))
  }

  return (
    <>
      <FormField
        control={form.control}
        name="patientId"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Paciente</FormLabel>
            <Select value={field.value || undefined} onValueChange={field.onChange} disabled={isLoadingPatients}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder={isLoadingPatients ? "Carregando..." : "Selecione um paciente"} />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {patients.length === 0 ? (
                  <SelectItem value="__empty" disabled>
                    {isLoadingPatients ? "Carregando pacientes..." : "Nenhum paciente cadastrado"}
                  </SelectItem>
                ) : (
                  patients.map((patient) => (
                    <SelectItem key={patient.id} value={patient.id}>
                      {patient.name || "Paciente sem nome"}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Data</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="time"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Horário do atendimento</FormLabel>
              <FormControl>
                <Input type="time" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="cidCode"
        render={() => (
          <FormItem className="space-y-2">
            <FormLabel>CID - Doença</FormLabel>
            <div className="space-y-2">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  className="pl-10"
                  placeholder="Digite o código ou nome da doença"
                  value={cidQuery}
                  onChange={(event) => setCidQuery(event.target.value)}
                />
              </div>
              {cidQuery.length < MIN_QUERY_LENGTH ? (
                <FormDescription>Digite ao menos {MIN_QUERY_LENGTH} caracteres para buscar.</FormDescription>
              ) : (
                <div className="rounded-md border bg-background shadow-sm">
                  {isSearchingCid ? (
                    <div className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Buscando resultados...
                    </div>
                  ) : cidOptions.length === 0 ? (
                    <p className="px-3 py-2 text-sm text-muted-foreground">Nenhum resultado encontrado.</p>
                  ) : (
                    <ul className="max-h-48 overflow-y-auto">
                      {cidOptions.map((option) => (
                        <li key={option.code}>
                          <button
                            type="button"
                            className="w-full px-3 py-2 text-left text-sm hover:bg-muted"
                            onClick={() => handleCidSelect(option)}
                          >
                            <span className="font-semibold">{option.code}</span>{" "}
                            <span className="text-muted-foreground">{option.description}</span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              {selectedCidLabel && (
                <div className="flex items-center justify-between rounded-md border bg-muted/30 px-3 py-2 text-sm">
                  <span>{selectedCidLabel}</span>
                  <Button variant="ghost" size="icon" onClick={handleClearCid}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="evolutionNotes"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Evolução</FormLabel>
            <FormControl>
              <Textarea rows={4} {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="attachments"
        render={({ field }) => {
          const currentAttachments = field.value ?? []
          return (
            <FormItem className="space-y-2">
              <FormLabel className="flex items-center gap-2">
                <Paperclip className="h-4 w-4" />
                Anexar arquivos
              </FormLabel>
              <FormDescription>
                Os arquivos são armazenados com o atendimento. Utilize para anexar laudos, exames ou prescrições.
              </FormDescription>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                className="hidden"
                onChange={(event) => handleFilesSelected(event, field.onChange, currentAttachments)}
              />
              <Button
                type="button"
                variant="outline"
                disabled={isAttachmentsLoading}
                onClick={() => fileInputRef.current?.click()}
              >
                {isAttachmentsLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processando...
                  </>
                ) : (
                  "Selecionar arquivos"
                )}
              </Button>
              {currentAttachments.length > 0 ? (
                <ul className="space-y-2">
                  {currentAttachments.map((attachment) => (
                    <li
                      key={attachment.id}
                      className="flex items-center justify-between rounded-md border px-3 py-2 text-sm"
                    >
                      <div>
                        <p className="font-medium">{attachment.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatFileSize(attachment.size)} • {attachment.type}
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeAttachment(attachment.id, field.onChange, currentAttachments)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">Nenhum arquivo anexado até o momento.</p>
              )}
              <FormMessage />
            </FormItem>
          )
        }}
      />
    </>
  )
}
