import { startOfWeek, addDays, format, parseISO, isSameDay, areIntervalsOverlapping } from "date-fns";

import { useCalendar } from "@/app/(protected)/agendamentos/_components/Calendar/contexts/calendar-context";

import { ScrollArea } from "@/components/ui/scroll-area";

import { AppointmentBlock } from "@/app/(protected)/agendamentos/_components/Calendar/components/week-and-day-view/appointment-block";
import { DroppableTimeBlock } from "@/app/(protected)/agendamentos/_components/Calendar/components/dnd/droppable-time-block";
import { CalendarTimeline } from "@/app/(protected)/agendamentos/_components/Calendar/components/week-and-day-view/calendar-time-line";
import { WeekViewMultiDayAppointmentsRow } from "@/app/(protected)/agendamentos/_components/Calendar/components/week-and-day-view/week-view-multi-day-appointments-row";

import { cn } from "@/lib/utils";
import { groupAppointments, getAppointmentBlockStyle, isWorkingHour, getVisibleHours } from "@/app/(protected)/agendamentos/_components/Calendar/helpers";
import { appDateLocale } from "@/lib/date-locale";

import type { IAppointment } from "@/app/(protected)/agendamentos/_components/Calendar/interfaces";

interface IProps {
  singleDayAppointments: IAppointment[];
  multiDayAppointments: IAppointment[];
}

export function CalendarWeekView({ singleDayAppointments, multiDayAppointments }: IProps) {
  const { selectedDate, workingHours, visibleHours, createAppointment } = useCalendar();

  const { hours, earliestAppointmentHour, latestAppointmentHour } = getVisibleHours(visibleHours, singleDayAppointments);

  const weekStart = startOfWeek(selectedDate);
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const handleSlotClick = (day: Date, hour: number, minute: number) => {
    const slotDate = new Date(day);
    slotDate.setHours(hour, minute, 0, 0);
    createAppointment(slotDate);
  };

  return (
    <>
      <div className="flex flex-col items-center justify-center border-b py-4 text-sm text-muted-foreground sm:hidden">
        <p>A visão semanal não está disponível em telas menores.</p>
        <p>Altere para a visão diária ou mensal.</p>
      </div>

      <div className="hidden flex-col sm:flex">
        <div>
          <WeekViewMultiDayAppointmentsRow selectedDate={selectedDate} multiDayAppointments={multiDayAppointments} />

          {/* Week header */}
          <div className="relative z-20 flex border-b">
            <div className="w-18"></div>
            <div className="grid flex-1 grid-cols-7 divide-x border-l">
              {weekDays.map((day, index) => (
                <span key={index} className="py-2 text-center text-xs font-medium text-muted-foreground">
                  {(() => {
                    const label = format(day, "EEE", { locale: appDateLocale });
                    return label.charAt(0).toUpperCase() + label.slice(1);
                  })()}{" "}
                  <span className="ml-1 font-semibold text-foreground">{format(day, "d", { locale: appDateLocale })}</span>
                </span>
              ))}
            </div>
          </div>
        </div>

        <ScrollArea className="h-[736px]" type="always">
          <div className="flex overflow-hidden">
            {/* Hours column */}
            <div className="relative w-18">
              {hours.map((hour, index) => (
                <div key={hour} className="relative" style={{ height: "96px" }}>
                  <div className="absolute -top-3 right-2 flex h-6 items-center">
                    {index !== 0 && <span className="text-xs text-muted-foreground">{format(new Date().setHours(hour, 0, 0, 0), "HH:mm", { locale: appDateLocale })}</span>}
                  </div>
                </div>
              ))}
            </div>

            {/* Week grid */}
            <div className="relative flex-1 border-l">
              <div className="grid grid-cols-7 divide-x">
                {weekDays.map((day, dayIndex) => {
                  const dayAppointments = singleDayAppointments.filter(appointment => isSameDay(parseISO(appointment.startDate), day) || isSameDay(parseISO(appointment.endDate), day));
                  const groupedAppointments = groupAppointments(dayAppointments);

                  return (
                    <div key={dayIndex} className="relative">
                      {hours.map((hour, index) => {
                        const isDisabled = !isWorkingHour(day, hour, workingHours);

                        return (
                          <div key={hour} className={cn("relative", isDisabled && "bg-calendar-disabled-hour")} style={{ height: "96px" }}>
                            {index !== 0 && <div className="pointer-appointments-none absolute inset-x-0 top-0 border-b"></div>}

                            <DroppableTimeBlock date={day} hour={hour} minute={0}>
                              <button
                                type="button"
                                className="absolute inset-x-0 top-0 h-[24px] cursor-pointer transition-colors hover:bg-accent"
                                onClick={() => handleSlotClick(day, hour, 0)}
                              />
                            </DroppableTimeBlock>

                            <DroppableTimeBlock date={day} hour={hour} minute={15}>
                              <button
                                type="button"
                                className="absolute inset-x-0 top-[24px] h-[24px] cursor-pointer transition-colors hover:bg-accent"
                                onClick={() => handleSlotClick(day, hour, 15)}
                              />
                            </DroppableTimeBlock>

                            <div className="pointer-appointments-none absolute inset-x-0 top-1/2 border-b border-dashed"></div>

                            <DroppableTimeBlock date={day} hour={hour} minute={30}>
                              <button
                                type="button"
                                className="absolute inset-x-0 top-[48px] h-[24px] cursor-pointer transition-colors hover:bg-accent"
                                onClick={() => handleSlotClick(day, hour, 30)}
                              />
                            </DroppableTimeBlock>

                            <DroppableTimeBlock date={day} hour={hour} minute={45}>
                              <button
                                type="button"
                                className="absolute inset-x-0 top-[72px] h-[24px] cursor-pointer transition-colors hover:bg-accent"
                                onClick={() => handleSlotClick(day, hour, 45)}
                              />
                            </DroppableTimeBlock>
                          </div>
                        );
                      })}

                      {groupedAppointments.map((group, groupIndex) =>
                        group.map(appointment => {
                          let style = getAppointmentBlockStyle(appointment, day, groupIndex, groupedAppointments.length, { from: earliestAppointmentHour, to: latestAppointmentHour });
                          const hasOverlap = groupedAppointments.some(
                            (otherGroup, otherIndex) =>
                              otherIndex !== groupIndex &&
                              otherGroup.some(otherAppointment =>
                                areIntervalsOverlapping(
                                  { start: parseISO(appointment.startDate), end: parseISO(appointment.endDate) },
                                  { start: parseISO(otherAppointment.startDate), end: parseISO(otherAppointment.endDate) }
                                )
                              )
                          );

                          if (!hasOverlap) style = { ...style, width: "100%", left: "0%" };

                          return (
                            <div key={appointment.id} className="absolute p-1" style={style}>
                              <AppointmentBlock appointment={appointment} />
                            </div>
                          );
                        })
                      )}
                    </div>
                  );
                })}
              </div>

              <CalendarTimeline firstVisibleHour={earliestAppointmentHour} lastVisibleHour={latestAppointmentHour} />
            </div>
          </div>
        </ScrollArea>
      </div>
    </>
  );
}
