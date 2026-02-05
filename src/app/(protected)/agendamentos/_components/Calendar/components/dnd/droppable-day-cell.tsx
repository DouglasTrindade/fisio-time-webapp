"use client";

import type { ICalendarCell } from "@/app/(protected)/agendamentos/_components/Calendar/interfaces";

interface DroppableDayCellProps {
  cell: ICalendarCell;
  children: React.ReactNode;
}

export function DroppableDayCell({ children }: DroppableDayCellProps) {
  return <div>{children}</div>;
}
