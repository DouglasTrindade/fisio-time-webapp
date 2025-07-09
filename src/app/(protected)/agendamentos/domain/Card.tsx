"use client";

import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import type { Appointment } from "@/app/utils/types/appointment";
import { IconClockHour3, IconPhone } from '@tabler/icons-react';

import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

type Props = {
  appointment: Appointment;
};

export const KanBanCard = ({ appointment }: Props) => {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: appointment.id,
  });

  const style: React.CSSProperties = {
    transform: transform ? CSS.Translate.toString(transform) : undefined,
    zIndex: 999,
    position: "relative",
  };

  return (
    <Card
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={style}
      className="shadow text-sm cursor-move transition-all"
    >
      <CardContent>
        <div className="flex flex-col gap-2">
          <span className="font-medium">{appointment.name}</span>
          <span className="flex items-center gap-2">
            <IconClockHour3 stroke={2} size={20} />
            {appointment.time}h
          </span>
          <span className="flex items-center gap-2">
            <IconPhone stroke={2} size={20} />
            {appointment.phone}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
