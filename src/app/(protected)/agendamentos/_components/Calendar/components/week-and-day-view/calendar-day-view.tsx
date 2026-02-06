import { Calendar, Clock, User } from "lucide-react";
import { parseISO, areIntervalsOverlapping, format } from "date-fns";

import { useCalendar } from "@/app/(protected)/agendamentos/_components/Calendar/contexts/calendar-context";

import { ScrollArea } from "@/components/ui/scroll-area";
import { SingleCalendar } from "@/components/ui/single-calendar";

import { AppointmentBlock } from "@/app/(protected)/agendamentos/_components/Calendar/components/week-and-day-view/appointment-block";
import { DroppableTimeBlock } from "@/app/(protected)/agendamentos/_components/Calendar/components/dnd/droppable-time-block";
import { CalendarTimeline } from "@/app/(protected)/agendamentos/_components/Calendar/components/week-and-day-view/calendar-time-line";
import { DayViewMultiDayAppointmentsRow } from "@/app/(protected)/agendamentos/_components/Calendar/components/week-and-day-view/day-view-multi-day-appointments-row";

import { cn } from "@/lib/utils";
import { groupAppointments, getAppointmentBlockStyle, isWorkingHour, getCurrentAppointments, getVisibleHours } from "@/app/(protected)/agendamentos/_components/Calendar/helpers";
import { appDateLocale } from "@/lib/date-locale";

import type { IAppointment } from "@/app/(protected)/agendamentos/_components/Calendar/interfaces";

interface IProps {
  singleDayAppointments: IAppointment[];
  multiDayAppointments: IAppointment[];
}

export function CalendarDayView({ singleDayAppointments, multiDayAppointments }: IProps) {
  const { selectedDate, setSelectedDate, users, visibleHours, workingHours, createAppointment } = useCalendar();

  const { hours, earliestAppointmentHour, latestAppointmentHour } = getVisibleHours(visibleHours, singleDayAppointments);

  const currentAppointments = getCurrentAppointments(singleDayAppointments);

  const dayAppointments = singleDayAppointments.filter(appointment => {
    const appointmentDate = parseISO(appointment.startDate);
    return (
      appointmentDate.getDate() === selectedDate.getDate() &&
      appointmentDate.getMonth() === selectedDate.getMonth() &&
      appointmentDate.getFullYear() === selectedDate.getFullYear()
    );
  });

  const groupedAppointments = groupAppointments(dayAppointments);
  const dayLabel = format(selectedDate, "EEE", { locale: appDateLocale });
  const normalizedDayLabel = dayLabel.charAt(0).toUpperCase() + dayLabel.slice(1);
  const todayLabel = format(new Date(), "d 'de' MMMM 'de' yyyy", { locale: appDateLocale });
  const normalizedTodayLabel = todayLabel.charAt(0).toUpperCase() + todayLabel.slice(1);

  const handleSlotClick = (hour: number, minute: number) => {
    if (!selectedDate) return;
    const date = new Date(selectedDate);
    date.setHours(hour, minute, 0, 0);
    createAppointment(date);
  };

  return (
    <div className="flex">
      <div className="flex flex-1 flex-col">
        <div>
          <DayViewMultiDayAppointmentsRow selectedDate={selectedDate} multiDayAppointments={multiDayAppointments} />

          {/* Day header */}
          <div className="relative z-20 flex border-b">
            <div className="w-18"></div>
            <span className="flex-1 border-l py-2 text-center text-xs font-medium text-muted-foreground">
              {normalizedDayLabel} <span className="font-semibold text-foreground">{format(selectedDate, "d", { locale: appDateLocale })}</span>
            </span>
          </div>
        </div>

        <ScrollArea className="h-[800px]" type="always">
          <div className="flex">
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

            {/* Day grid */}
            <div className="relative flex-1 border-l">
              <div className="relative">
                {hours.map((hour, index) => {
                  const isDisabled = !isWorkingHour(selectedDate, hour, workingHours);

                  return (
                    <div key={hour} className={cn("relative", isDisabled && "bg-calendar-disabled-hour")} style={{ height: "96px" }}>
                      {index !== 0 && <div className="pointer-appointments-none absolute inset-x-0 top-0 border-b"></div>}

                      <DroppableTimeBlock date={selectedDate} hour={hour} minute={0}>
                        <button
                          type="button"
                          className="absolute inset-x-0 top-0 h-[24px] cursor-pointer transition-colors hover:bg-accent"
                          onClick={() => handleSlotClick(hour, 0)}
                        />
                      </DroppableTimeBlock>

                      <DroppableTimeBlock date={selectedDate} hour={hour} minute={15}>
                        <button
                          type="button"
                          className="absolute inset-x-0 top-[24px] h-[24px] cursor-pointer transition-colors hover:bg-accent"
                          onClick={() => handleSlotClick(hour, 15)}
                        />
                      </DroppableTimeBlock>

                      <div className="pointer-appointments-none absolute inset-x-0 top-1/2 border-b border-dashed"></div>

                      <DroppableTimeBlock date={selectedDate} hour={hour} minute={30}>
                        <button
                          type="button"
                          className="absolute inset-x-0 top-[48px] h-[24px] cursor-pointer transition-colors hover:bg-accent"
                          onClick={() => handleSlotClick(hour, 30)}
                        />
                      </DroppableTimeBlock>

                      <DroppableTimeBlock date={selectedDate} hour={hour} minute={45}>
                        <button
                          type="button"
                          className="absolute inset-x-0 top-[72px] h-[24px] cursor-pointer transition-colors hover:bg-accent"
                          onClick={() => handleSlotClick(hour, 45)}
                        />
                      </DroppableTimeBlock>
                    </div>
                  );
                })}

                {groupedAppointments.map((group, groupIndex) =>
                  group.map(appointment => {
                    let style = getAppointmentBlockStyle(appointment, selectedDate, groupIndex, groupedAppointments.length, { from: earliestAppointmentHour, to: latestAppointmentHour });
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

              <CalendarTimeline firstVisibleHour={earliestAppointmentHour} lastVisibleHour={latestAppointmentHour} />
            </div>
          </div>
        </ScrollArea>
      </div>

      <div className="hidden w-64 divide-y border-l md:block">
        <div className="mx-auto w-fit">
          <SingleCalendar
            mode="single"
            selected={selectedDate}
            onSelect={(date?: Date) => {
              if (date) setSelectedDate(date);
            }}
          />
        </div>

        <div className="flex-1 space-y-3">
          {currentAppointments.length > 0 ? (
            <div className="flex items-start gap-2 px-4 pt-4">
              <span className="relative mt-[5px] flex size-2.5">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex size-2.5 rounded-full bg-green-600"></span>
              </span>

              <p className="text-sm font-semibold text-foreground">Acontecendo agora</p>
            </div>
          ) : (
            <p className="p-4 text-center text-sm italic text-muted-foreground">Sem atendimentos ou consultas no momento</p>
          )}

          {currentAppointments.length > 0 && (
            <ScrollArea className="h-[422px] px-4" type="always">
              <div className="space-y-6 pb-4">
                {currentAppointments.map(appointment => {
                  const user = users.find(user => user.id === appointment.user.id);

                  return (
                    <div key={appointment.id} className="space-y-1.5">
                      <p className="line-clamp-2 text-sm font-semibold">{appointment.title}</p>

                      {user && (
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <User className="size-3.5" />
                          <span className="text-sm">{user.name}</span>
                        </div>
                      )}

                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Calendar className="size-3.5" />
                        <span className="text-sm">{normalizedTodayLabel}</span>
                      </div>

                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Clock className="size-3.5" />
                        <span className="text-sm">
                          {format(parseISO(appointment.startDate), "HH:mm", { locale: appDateLocale })} - {format(parseISO(appointment.endDate), "HH:mm", { locale: appDateLocale })}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          )}
        </div>
      </div>
    </div>
  );
}
