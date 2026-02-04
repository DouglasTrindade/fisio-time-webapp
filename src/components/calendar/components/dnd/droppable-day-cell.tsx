"use client";

import type { ICalendarCell } from "@/components/calendar/interfaces";

interface DroppableDayCellProps {
  cell: ICalendarCell;
  children: React.ReactNode;
}

export function DroppableDayCell({ children }: DroppableDayCellProps) {
  return <div>{children}</div>;
}
