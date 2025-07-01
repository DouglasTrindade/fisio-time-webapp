import { KanbanBoard } from "./Kanban";

export const Appointments = () => {
  return (
    <div className="h-screen">
      <div className="grid grid-cols-1 md:grid-cols-2">
        <KanbanBoard />
      </div>
    </div>
  );
};
