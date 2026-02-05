"use client";

import type { IEvent } from "@/app/(protected)/agendamentos/_components/Calendar/interfaces";

interface DraggableEventProps {
  event: IEvent;
  children: React.ReactNode;
}

export function DraggableEvent({ children }: DraggableEventProps) {
  return <div>{children}</div>;
}
