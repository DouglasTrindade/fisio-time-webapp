"use client";

import {
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import type { Control } from "react-hook-form";
import type { FieldPath } from "react-hook-form";
import type { ControllerRenderProps } from "react-hook-form";
import type { TAppointment } from "@/app/(protected)/agendamentos/_components/Calendar/types";

const COLOR_OPTIONS: { value: TAppointment; label: string; className: string }[] =
  [
    { value: "blue", label: "Azul", className: "bg-blue-600" },
    { value: "green", label: "Verde", className: "bg-green-600" },
    { value: "red", label: "Vermelho", className: "bg-red-600" },
    { value: "yellow", label: "Amarelo", className: "bg-yellow-600" },
    { value: "purple", label: "Roxo", className: "bg-purple-600" },
    { value: "orange", label: "Laranja", className: "bg-orange-600" },
    { value: "gray", label: "Cinza", className: "bg-neutral-600" },
  ];

type AppointmentColorSelectProps<
  TFieldValues extends Record<string, unknown>,
  TName extends FieldPath<TFieldValues>,
> = {
  field: ControllerRenderProps<TFieldValues, TName>;
  label?: string;
  showMessage?: boolean;
};

export function AppointmentColorSelect<
  TFieldValues extends Record<string, unknown>,
  TName extends FieldPath<TFieldValues>,
>({ field, label = "Cor", showMessage = true }: AppointmentColorSelectProps<TFieldValues, TName>) {
  return (
    <FormItem>
      <FormLabel>{label}</FormLabel>
      <FormControl>
        <Select value={field.value as string} onValueChange={field.onChange}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione uma cor" />
          </SelectTrigger>
          <SelectContent>
            {COLOR_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                <div className="flex items-center gap-2">
                  <div className={`size-3.5 rounded-full ${option.className}`} />
                  {option.label}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FormControl>
      {showMessage && <FormMessage />}
    </FormItem>
  );
}

export { COLOR_OPTIONS as APPOINTMENT_COLOR_OPTIONS };
