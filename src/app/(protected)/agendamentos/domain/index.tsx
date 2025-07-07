"use client";

import { Calendar } from "./Calendar";
import { KanbanBoard } from "./Kanban";

export const Appointments = () => {
  return (
    <div className="h-screen">
      <div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <KanbanBoard />
        </div>
        <div>
          <Calendar />
        </div>
      </div>
    </div>
  );
};
