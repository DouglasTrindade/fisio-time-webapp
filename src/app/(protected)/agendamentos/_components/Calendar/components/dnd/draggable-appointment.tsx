"use client";

import { useDraggable } from "@dnd-kit/core";

import { cn } from "@/lib/utils";

import { useEffect, useRef, type CSSProperties } from "react";
import type { IAppointment } from "@/app/(protected)/agendamentos/_components/Calendar/interfaces";

interface DraggableAppointmentProps {
  appointment: IAppointment;
  children: React.ReactNode;
}

export function DraggableAppointment({ appointment, children }: DraggableAppointmentProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: appointment.id,
    data: {
      type: "appointment",
      appointment,
    },
  });

  const suppressClickRef = useRef(false);

  useEffect(() => {
    if (isDragging) {
      suppressClickRef.current = true;
      return;
    }

    if (!suppressClickRef.current) return;

    const timeout = setTimeout(() => {
      suppressClickRef.current = false;
    }, 100);

    return () => clearTimeout(timeout);
  }, [isDragging]);

  const style: CSSProperties | undefined = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        cursor: "grabbing",
      }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn("cursor-grab", isDragging && "opacity-80")}
      onClickCapture={(event) => {
        if (suppressClickRef.current) {
          event.preventDefault();
          event.stopPropagation();
        }
      }}
      {...listeners}
      {...attributes}
    >
      {children}
    </div>
  );
}
