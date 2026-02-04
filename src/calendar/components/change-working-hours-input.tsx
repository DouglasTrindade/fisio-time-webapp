"use client";

import { useState } from "react";
import { Info, Moon } from "lucide-react";
import { useCalendar } from "@/calendar/contexts/calendar-context";

import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { TimeInput, type TimeValue } from "@/components/ui/time-input";
import { TooltipContent } from "@/components/ui/tooltip";
import { Tooltip, TooltipTrigger } from "@/components/ui/tooltip";
import { TooltipProvider } from "@/components/ui/tooltip";

const DAYS_OF_WEEK = [
  { index: 0, name: "Domingo", slug: "sunday" },
  { index: 1, name: "Segunda-feira", slug: "monday" },
  { index: 2, name: "Terça-feira", slug: "tuesday" },
  { index: 3, name: "Quarta-feira", slug: "wednesday" },
  { index: 4, name: "Quinta-feira", slug: "thursday" },
  { index: 5, name: "Sexta-feira", slug: "friday" },
  { index: 6, name: "Sábado", slug: "saturday" },
];

export function ChangeWorkingHoursInput() {
  const { workingHours, setWorkingHours } = useCalendar();

  const [localWorkingHours, setLocalWorkingHours] = useState({ ...workingHours });

  const handleToggleDay = (dayId: number) => {
    setLocalWorkingHours(prev => ({
      ...prev,
      [dayId]: prev[dayId].from > 0 || prev[dayId].to > 0 ? { from: 0, to: 0 } : { from: 9, to: 17 },
    }));
  };

  const handleTimeChange = (dayId: number, timeType: "from" | "to", value: TimeValue) => {
    setLocalWorkingHours(prev => {
      const updatedDay = { ...prev[dayId], [timeType]: value.hour };
      if (timeType === "to" && value.hour === 0 && updatedDay.from === 0) updatedDay.to = 24;
      return { ...prev, [dayId]: updatedDay };
    });
  };

  const handleSave = () => {
    const updatedWorkingHours = { ...localWorkingHours };

    for (const dayId in updatedWorkingHours) {
      const day = updatedWorkingHours[parseInt(dayId)];
      const isDayActive = localWorkingHours[parseInt(dayId)].from > 0 || localWorkingHours[parseInt(dayId)].to > 0;

      if (isDayActive) {
        if (day.from === 0 && day.to === 0) {
          updatedWorkingHours[dayId] = { from: 0, to: 24 };
        } else if (day.to === 0 && day.from > 0) {
          updatedWorkingHours[dayId] = { ...day, to: 24 };
        }
      } else {
        updatedWorkingHours[dayId] = { from: 0, to: 0 };
      }
    }

    setWorkingHours(updatedWorkingHours);
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <p className="text-sm font-semibold">Definir horas de funcionamento</p>

        <TooltipProvider delayDuration={100}>
          <Tooltip>
            <TooltipTrigger>
              <Info className="size-3" />
            </TooltipTrigger>

            <TooltipContent className="max-w-80 text-center">
              <p>Mostra um fundo tracejado para horários fora do expediente — válido apenas nas visões semanal e diária.</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <div className="space-y-4">
        {DAYS_OF_WEEK.map(day => {
          const isDayActive = localWorkingHours[day.index].from > 0 || localWorkingHours[day.index].to > 0;

          return (
            <div key={day.index} className="flex items-center gap-4">
              <div className="flex w-40 items-center gap-2">
                <Switch checked={isDayActive} onCheckedChange={() => handleToggleDay(day.index)} />
                <span className="text-sm font-medium">{day.name}</span>
              </div>

              {isDayActive ? (
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span>De</span>
                    <TimeInput
                      id={`${day.slug}-from`}
                      value={{ hour: localWorkingHours[day.index].from, minute: 0 }}
                      onChange={value => handleTimeChange(day.index, "from", value)}
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <span>Até</span>
                    <TimeInput
                      id={`${day.slug}-to`}
                      value={{ hour: localWorkingHours[day.index].to, minute: 0 }}
                      onChange={value => handleTimeChange(day.index, "to", value)}
                    />
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Moon className="size-4" />
                  <span>Fechado</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <Button className="mt-4 w-fit" onClick={handleSave}>
        Salvar
      </Button>
    </div>
  );
}
