"use client"

import { useFormContext } from "react-hook-form"
import { Input } from "@/components/ui/input"
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { InviteFormValues } from "./schema"
import { roleLabels, roleDescriptions } from "../utils"
import type { AppRole } from "@/types/user"

export const InviteFields = () => {
  const form = useFormContext<InviteFormValues>()

  return (
    <>
      <FormField
        control={form.control}
        name="email"
        render={({ field }) => (
          <FormItem>
            <FormLabel>E-mail corporativo</FormLabel>
            <FormControl>
              <Input type="email" placeholder="nome@clinica.com" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="role"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Função</FormLabel>
            <Select value={field.value} onValueChange={field.onChange}>
              <FormControl className="w-full">
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o acesso" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {Object.keys(roleLabels).map((role) => (
                  <SelectItem key={role} value={role}>
                    <span className="font-medium">{roleLabels[role as AppRole]}</span>
                    <p className="text-xs text-muted-foreground">
                      {roleDescriptions[role as AppRole]}
                    </p>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  )
}
