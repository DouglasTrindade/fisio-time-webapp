"use client";

import type { IEvent } from "@/components/calendar/interfaces";

interface DraggableEventProps {
  event: IEvent;
  children: React.ReactNode;
}

export function DraggableEvent({ children }: DraggableEventProps) {
  return <div>{children}</div>;
}
