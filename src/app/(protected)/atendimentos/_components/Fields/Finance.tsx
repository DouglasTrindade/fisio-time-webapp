"use client"

import type { UseFormReturn } from "react-hook-form"
import type { AttendanceFormSchema } from "./schema"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"

interface FinanceFieldsProps {
  form: UseFormReturn<AttendanceFormSchema>
}

export const FinanceFields = ({ form }: FinanceFieldsProps) => {
  const isFinanceEnabled = form.watch("launchToFinance")
  const isPaid = form.watch("financePaid")

  const toggleFinance = () => {
    const nextValue = !isFinanceEnabled
    form.setValue("launchToFinance", nextValue, { shouldDirty: true })
    if (!nextValue) {
      form.setValue("financeAmount", "", { shouldDirty: true })
      form.setValue("financePaymentMethod", "", { shouldDirty: true })
      form.setValue("financeAccount", "", { shouldDirty: true })
      form.setValue("financePaid", false, { shouldDirty: true })
      form.setValue("financePaidAt", "", { shouldDirty: true })
    }
  }

  return (
    <div className="space-y-4 rounded-lg border border-dashed border-primary/40 bg-card/60 p-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold">Financeiro</p>
          <p className="text-sm text-muted-foreground">
            Registre os dados para lançar este atendimento no financeiro.
          </p>
        </div>
        <Button
          type="button"
          variant={isFinanceEnabled ? "secondary" : "outline"}
          onClick={toggleFinance}
        >
          {isFinanceEnabled ? "Lançamento habilitado" : "Lançar atendimento no financeiro"}
        </Button>
      </div>

      {isFinanceEnabled ? (
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="financeAmount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Valor do atendimento</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0,00"
                      inputMode="decimal"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="financePaymentMethod"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Forma de pagamento</FormLabel>
                  <FormControl>
                    <Input placeholder="Cartão, Pix, dinheiro..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="financeAccount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Conta</FormLabel>
                  <FormControl>
                    <Input placeholder="Conta/carteira responsável" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="financePaid"
              render={({ field }) => (
                <FormItem className="rounded-md border border-muted bg-muted/30 px-4 py-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <FormLabel>Pago?</FormLabel>
                      <FormDescription>
                        Marque quando o recebimento já foi confirmado.
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={(checked) => {
                          field.onChange(checked)
                          if (!checked) {
                            form.setValue("financePaidAt", "", { shouldDirty: true })
                          }
                        }}
                      />
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="financePaidAt"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Data do pagamento</FormLabel>
                <FormControl>
                  <Input type="date" disabled={!isPaid} {...field} />
                </FormControl>
                <FormDescription>
                  Informe a data em que o pagamento foi recebido.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      ) : null}
    </div>
  )
}
