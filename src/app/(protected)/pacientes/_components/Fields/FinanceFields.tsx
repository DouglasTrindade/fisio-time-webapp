"use client"

import { useEffect, useMemo, useState } from "react"
import type { UseFormReturn } from "react-hook-form"
import { Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { PatientSchema } from "@/app/(protected)/pacientes/_components/Fields/schema"
import { useModalContext } from "@/contexts/ModalContext"

interface FinanceFieldsProps {
  form: UseFormReturn<PatientSchema>
}

const planOptions = [
  { value: "per_session", label: "Por sessão" },
  { value: "monthly", label: "Por mês (mensalista)" },
  { value: "insurance", label: "Convênio" },
  { value: "exempt", label: "Isento" },
]

const repasseOptions = [
  { value: "percentage", label: "Porcentagem" },
  { value: "amount", label: "Valor em real" },
]

export const FinanceFields = ({ form }: FinanceFieldsProps) => {
  const plan = form.watch("financialPlan")
  const repasseType = form.watch("insuranceRepasseType")
  const repasseValue = form.watch("insuranceRepasseValue")
  const repasseDays = form.watch("insurancePaymentDays")
  const insuranceName = form.watch("insuranceName")

  const [insuranceOptions, setInsuranceOptions] = useState<string[]>([])
  const { openModal } = useModalContext()

  useEffect(() => {
    if (plan !== "insurance") {
      form.setValue("insuranceName", "", { shouldDirty: true })
      form.setValue("insuranceCardNumber", "", { shouldDirty: true })
      form.setValue("insuranceIssuedAt", "", { shouldDirty: true })
      form.setValue("insuranceRepasseType", "", { shouldDirty: true })
      form.setValue("insuranceRepasseValue", "", { shouldDirty: true })
      form.setValue("insurancePaymentDays", "", { shouldDirty: true })
    }
  }, [plan, form])

  useEffect(() => {
    if (!insuranceName?.trim()) return
    setInsuranceOptions((previous) => {
      if (previous.includes(insuranceName)) return previous
      return [...previous, insuranceName]
    })
  }, [insuranceName])

  const repasseSummary = useMemo(() => {
    if (!repasseType || !repasseValue) return ""
    const label = repasseType === "percentage" ? `${repasseValue}%` : `R$ ${repasseValue}`
    const daysLabel = repasseDays ? ` • ${repasseDays} dias para recebimento` : ""
    return `${label}${daysLabel}`
  }, [repasseType, repasseValue, repasseDays])

  const openDialog = () => {
    openModal(
      { modal: InsuranceDialog },
      {
        defaultName: form.getValues("insuranceName") || "",
        defaultRepasseType: (form.getValues("insuranceRepasseType") as "percentage" | "amount") || "amount",
        defaultRepasseValue: form.getValues("insuranceRepasseValue") || "",
        defaultPaymentDays: form.getValues("insurancePaymentDays") || "",
        onConfirm: (values: {
          name: string
          repasseType: "percentage" | "amount"
          repasseValue: string
          paymentDays: string
        }) => {
          const normalizedName = values.name.trim()
          if (!normalizedName) return
          form.setValue("insuranceName", normalizedName, { shouldDirty: true })
          setInsuranceOptions((previous) => {
            if (previous.includes(normalizedName)) return previous
            return [...previous, normalizedName]
          })
          form.setValue("insuranceRepasseType", values.repasseType, { shouldDirty: true })
          form.setValue("insuranceRepasseValue", values.repasseValue, { shouldDirty: true })
          form.setValue("insurancePaymentDays", values.paymentDays, { shouldDirty: true })
        },
      }
    )
  }

  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="financialPlan"
        render={({ field }) => (
          <FormItem className="md:col-span-2">
            <FormLabel>Plano financeiro</FormLabel>
            <Select value={field.value || ""} onValueChange={field.onChange}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {planOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      {plan === "insurance" && (
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="insuranceName"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Convênio</FormLabel>
                <FormControl className="w-full">
                  <div className="flex gap-2 w-full">
                    <Select value={field.value || ""} onValueChange={field.onChange}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Selecione ou adicione" />
                      </SelectTrigger>
                      <SelectContent>
                        {insuranceOptions.length === 0 ? (
                          <SelectItem disabled value="__empty__">
                            Nenhum convênio cadastrado
                          </SelectItem>
                        ) : (
                          insuranceOptions.map((option) => (
                            <SelectItem key={option} value={option}>
                              {option}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    <Button type="button" variant="outline" size="icon" onClick={openDialog}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </FormControl>
                <FormMessage />
                {repasseSummary && (
                  <p className="text-xs text-muted-foreground">Repasse: {repasseSummary}</p>
                )}
              </FormItem>
            )}
          />

          <div className="flex items-center gap-4 w-full">
            <FormField
              control={form.control}
              name="insuranceCardNumber"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Número da carteirinha</FormLabel>
                  <FormControl>
                    <Input placeholder="Informe o número" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="insuranceIssuedAt"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Data da expedição</FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      {...field}
                      value={field.value || ""}
                      onChange={(event) => {
                        const value = event.target.value
                        field.onChange(value || null)
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
      )}

    </div>
  )
}

interface InsuranceDialogProps {
  defaultName: string
  defaultRepasseType: "percentage" | "amount"
  defaultRepasseValue: string
  defaultPaymentDays: string
  onConfirm: (values: {
    name: string
    repasseType: "percentage" | "amount"
    repasseValue: string
    paymentDays: string
  }) => void
  onHide?: () => void
}

const InsuranceDialog = ({
  defaultName,
  defaultRepasseType,
  defaultRepasseValue,
  defaultPaymentDays,
  onConfirm,
  onHide,
}: InsuranceDialogProps) => {
  const [dialogStep, setDialogStep] = useState(0)
  const [dialogName, setDialogName] = useState(defaultName)
  const [dialogRepasseType, setDialogRepasseType] = useState<"percentage" | "amount">(defaultRepasseType)
  const [dialogRepasseValue, setDialogRepasseValue] = useState(defaultRepasseValue)
  const [dialogPaymentDays, setDialogPaymentDays] = useState(defaultPaymentDays)

  const handleNext = () => {
    if (!dialogName.trim()) return
    setDialogStep(1)
  }

  const handleConfirm = () => {
    onConfirm({
      name: dialogName,
      repasseType: dialogRepasseType,
      repasseValue: dialogRepasseValue,
      paymentDays: dialogPaymentDays,
    })
    onHide?.()
  }

  return (
    <DialogContent className="sm:max-w-lg">
      <DialogHeader>
        <DialogTitle>Adicionar convênio</DialogTitle>
        <DialogDescription>
          {dialogStep === 0 ? "Informe o nome do convênio." : "Defina as regras de repasse."}
        </DialogDescription>
      </DialogHeader>

      <div className="flex items-center gap-3">
        <div className={`h-2 flex-1 rounded-full ${dialogStep >= 0 ? "bg-primary" : "bg-muted"}`} />
        <div className={`h-2 flex-1 rounded-full ${dialogStep >= 1 ? "bg-primary" : "bg-muted"}`} />
      </div>

      {dialogStep === 0 ? (
        <div className="space-y-4 pt-2">
          <FormItem>
            <FormLabel>Nome do convênio</FormLabel>
            <FormControl>
              <Input
                placeholder="Ex: Unimed"
                value={dialogName}
                onChange={(event) => setDialogName(event.target.value)}
              />
            </FormControl>
          </FormItem>
        </div>
      ) : (
        <div className="grid gap-4 pt-2 sm:grid-cols-2">
          <FormItem className="sm:col-span-2">
            <FormLabel>Repasse pago pelo convênio em</FormLabel>
            <Select
              value={dialogRepasseType}
              onValueChange={(value) => setDialogRepasseType(value as "percentage" | "amount")}
            >
              <FormControl className="w-full">
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {repasseOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormItem>

          <FormItem>
            <FormLabel>Valor</FormLabel>
            <FormControl>
              <Input
                placeholder={dialogRepasseType === "percentage" ? "%" : "R$ 0,00"}
                value={dialogRepasseValue}
                onChange={(event) => setDialogRepasseValue(event.target.value)}
              />
            </FormControl>
          </FormItem>

          <FormItem>
            <FormLabel>Dias previstos para recebimento</FormLabel>
            <FormControl>
              <Input
                type="number"
                min="0"
                placeholder="0"
                value={dialogPaymentDays}
                onChange={(event) => setDialogPaymentDays(event.target.value)}
              />
            </FormControl>
          </FormItem>
        </div>
      )}

      <DialogFooter className="pt-4">
        <Button type="button" variant="outline" onClick={() => onHide?.()}>
          Cancelar
        </Button>
        {dialogStep === 0 ? (
          <Button type="button" onClick={handleNext} disabled={!dialogName.trim()}>
            Próximo
          </Button>
        ) : (
          <Button type="button" onClick={handleConfirm}>
            Concluir
          </Button>
        )}
      </DialogFooter>
    </DialogContent>
  )
}
