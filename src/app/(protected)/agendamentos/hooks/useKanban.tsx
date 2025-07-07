import { useState } from "react";
import {
  useSensors,
  useSensor,
  PointerSensor,
  DragEndEvent,
} from "@dnd-kit/core";
import type { Appointment, AppointmentStatus } from "@/app/utils/types/appointment";

type ColumnsState = Record<AppointmentStatus, Appointment[]>;

export function useKanban() {
  const [columns, setColumns] = useState<ColumnsState>({
    waiting: [
      { id: "1", name: "João", phone: "11 99999-9999" },
      { id: "2", name: "Maria", phone: "11 88888-8888" },
    ],
    attended: [],
  });

  const sensors = useSensors(useSensor(PointerSensor));

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const fromColumn = (Object.keys(columns) as AppointmentStatus[]).find(
      (col) => columns[col].some((a) => a.id === active.id)
    );

    const toColumn = over.id as AppointmentStatus;

    if (!fromColumn || fromColumn === toColumn) return;

    const item = columns[fromColumn].find((a) => a.id === active.id)!;

    setColumns((prev) => ({
      ...prev,
      [fromColumn]: prev[fromColumn].filter((a) => a.id !== active.id),
      [toColumn]: [...prev[toColumn], item],
    }));
  }

  return {
    columns,
    setColumns,
    sensors,
    handleDragEnd,
  };
}
