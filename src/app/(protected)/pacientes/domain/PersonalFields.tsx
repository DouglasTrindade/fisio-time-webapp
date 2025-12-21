"use client"

import type { UseFormReturn } from "react-hook-form"
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { InputMask } from "@/components/ui/input-mask"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import type { PatientSchema } from "./Schema"

interface PersonalFieldsProps {
  form: UseFormReturn<PatientSchema>
}

export const PersonalFields = ({ form }: PersonalFieldsProps) => {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem className="md:col-span-3">
            <FormLabel>Nome</FormLabel>
            <FormControl>
              <Input placeholder="Nome do paciente" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="phone"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Telefone</FormLabel>
            <FormControl>
              <InputMask
                placeholder="(99) 99999-9999"
                mask="(99) 99999-9999"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="email"
        render={({ field }) => (
          <FormItem className="md:col-span-2">
            <FormLabel>Email</FormLabel>
            <FormControl>
              <Input placeholder="email@exemplo.com" type="email" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="birthDate"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Data de Nascimento</FormLabel>
            <FormControl>
              <Input
                type="date"
                {...field}
                value={field.value || ""}
                onChange={(e) => {
                  const value = e.target.value
                  field.onChange(value || null)
                }}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="cpf"
        render={({ field }) => (
          <FormItem>
            <FormLabel>CPF</FormLabel>
            <FormControl>
              <InputMask
                placeholder="000.000.000-00"
                mask="999.999.999-99"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="rg"
        render={({ field }) => (
          <FormItem>
            <FormLabel>RG</FormLabel>
            <FormControl>
              <Input placeholder="RG" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="maritalStatus"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Estado civil</FormLabel>
            <Select value={field.value || undefined} onValueChange={field.onChange}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o estado civil" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="solteiro">Solteiro</SelectItem>
                <SelectItem value="casado">Casado</SelectItem>
                <SelectItem value="viuva">Viúva</SelectItem>
                <SelectItem value="divorciado">Divorciado</SelectItem>
                <SelectItem value="separado">Separado</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="gender"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Sexo/Gênero</FormLabel>
            <Select value={field.value || undefined} onValueChange={field.onChange}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o sexo/gênero" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="masculino">Masculino</SelectItem>
                <SelectItem value="feminino">Feminino</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="profession"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Profissão</FormLabel>
            <FormControl>
              <Input placeholder="Profissão" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="companyName"
        render={({ field }) => (
          <FormItem className="md:col-span-2">
            <FormLabel>Nome da empresa</FormLabel>
            <FormControl>
              <Input placeholder="Empresa" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="notes"
        render={({ field }) => (
          <FormItem className="md:col-span-3">
            <FormLabel>Observações</FormLabel>
            <FormControl>
              <Textarea placeholder="Observações sobre o paciente..." className="min-h-20" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  )
}
