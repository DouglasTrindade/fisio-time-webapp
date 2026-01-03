"use client"

import { useState } from "react"
import type { UseFormReturn } from "react-hook-form"
import { Loader2, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { InputMask } from "@/components/ui/input-mask"
import type { PatientSchema } from "@/app/(protected)/pacientes/_components/schema"

interface AddressFieldsProps {
  form: UseFormReturn<PatientSchema>
}

interface ViaCepResponse {
  erro?: boolean
  logradouro?: string
  bairro?: string
  localidade?: string
  uf?: string
}

export const AddressFields = ({ form }: AddressFieldsProps) => {
  const [isLoading, setIsLoading] = useState(false)

  const handleCepLookup = async () => {
    const rawCep = form.getValues("cep") || ""
    const normalizedCep = rawCep.replace(/\D/g, "")

    if (normalizedCep.length !== 8) {
      form.setError("cep", { type: "manual", message: "CEP inválido" })
      return
    }

    form.clearErrors("cep")
    setIsLoading(true)

    try {
      const response = await fetch(`https://viacep.com.br/ws/${normalizedCep}/json/`)

      if (!response.ok) {
        form.setError("cep", { type: "manual", message: "Não foi possível buscar o CEP" })
        return
      }

      const data: ViaCepResponse = await response.json()

      if (data.erro) {
        form.setError("cep", { type: "manual", message: "CEP não encontrado" })
        return
      }

      form.setValue("street", data.logradouro ?? "", { shouldDirty: true })
      form.setValue("neighborhood", data.bairro ?? "", { shouldDirty: true })
      form.setValue("city", data.localidade ?? "", { shouldDirty: true })
      form.setValue("state", data.uf ?? "", { shouldDirty: true })

      if (!form.getValues("country")) {
        form.setValue("country", "Brasil", { shouldDirty: true })
      }
    } catch {
      form.setError("cep", { type: "manual", message: "Erro ao buscar CEP" })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <FormField
        control={form.control}
        name="cep"
        render={({ field }) => (
          <FormItem>
            <FormLabel>CEP</FormLabel>
            <FormControl>
              <div className="flex gap-2">
                <InputMask
                  placeholder="00000-000"
                  mask="99999-999"
                  className="flex-1"
                  {...field}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={handleCepLookup}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                  <span className="sr-only">Buscar CEP</span>
                </Button>
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="country"
        render={({ field }) => (
          <FormItem>
            <FormLabel>País</FormLabel>
            <FormControl>
              <Input placeholder="País" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="state"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Estado</FormLabel>
            <FormControl>
              <Input placeholder="Estado" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="city"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Cidade</FormLabel>
            <FormControl>
              <Input placeholder="Cidade" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="street"
        render={({ field }) => (
          <FormItem className="md:col-span-2">
            <FormLabel>Logradouro</FormLabel>
            <FormControl>
              <Input placeholder="Logradouro" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="number"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Número</FormLabel>
            <FormControl>
              <Input placeholder="Número" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="neighborhood"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Bairro</FormLabel>
            <FormControl>
              <Input placeholder="Bairro" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="complement"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Complemento</FormLabel>
            <FormControl>
              <Input placeholder="Complemento" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  )
}
