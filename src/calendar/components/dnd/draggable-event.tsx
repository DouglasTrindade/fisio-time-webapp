"use client";

import type { IEvent } from "@/calendar/interfaces";

interface DraggableEventProps {
  event: IEvent;
  children: React.ReactNode;
}

export function DraggableEvent({ children }: DraggableEventProps) {
  return <div>{children}</div>;
}
