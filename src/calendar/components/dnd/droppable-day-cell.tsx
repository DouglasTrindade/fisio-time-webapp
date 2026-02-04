"use client";

import type { ICalendarCell } from "@/calendar/interfaces";

interface DroppableDayCellProps {
  cell: ICalendarCell;
  children: React.ReactNode;
}

export function DroppableDayCell({ children }: DroppableDayCellProps) {
  return <div>{children}</div>;
}
