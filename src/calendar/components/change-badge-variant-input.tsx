"use client";

import { useCalendar } from "@/calendar/contexts/calendar-context";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function ChangeBadgeVariantInput() {
  const { badgeVariant, setBadgeVariant } = useCalendar();

  return (
    <div className="space-y-2">
      <p className="text-sm font-semibold">Alterar estilo dos eventos</p>

      <Select value={badgeVariant} onValueChange={setBadgeVariant}>
        <SelectTrigger className="w-48">
          <SelectValue />
        </SelectTrigger>

        <SelectContent>
          <SelectItem value="dot">Ponto</SelectItem>
          <SelectItem value="colored">Colorido</SelectItem>
          <SelectItem value="mixed">Misto</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
