"use client";

import { useState } from "react";
import { Info } from "lucide-react";

import { useCalendar } from "@/calendar/contexts/calendar-context";

import { Button } from "@/components/ui/button";
import { TimeInput, type TimeValue } from "@/components/ui/time-input";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";

export function ChangeVisibleHoursInput() {
  const { visibleHours, setVisibleHours } = useCalendar();

  const [from, setFrom] = useState<{ hour: number; minute: number }>({ hour: visibleHours.from, minute: 0 });
  const [to, setTo] = useState<{ hour: number; minute: number }>({ hour: visibleHours.to, minute: 0 });

  const handleApply = () => {
    const toHour = to.hour === 0 ? 24 : to.hour;
    setVisibleHours({ from: from.hour, to: toHour });
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <p className="text-sm font-semibold">Alterar horas visíveis</p>

        <TooltipProvider delayDuration={100}>
          <Tooltip>
            <TooltipTrigger>
              <Info className="size-3" />
            </TooltipTrigger>

            <TooltipContent className="max-w-80 text-center">
              <p>Se um evento estiver fora das horas visíveis, o calendário ajustará automaticamente o intervalo para incluí-lo.</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <div className="flex items-center gap-4">
        <p>De</p>
        <TimeInput id="start-time" value={from} onChange={setFrom} />
        <p>Até</p>
        <TimeInput id="end-time" value={to} onChange={setTo} />
      </div>

      <Button className="mt-4 w-fit" onClick={handleApply}>
        Aplicar
      </Button>
    </div>
  );
}
