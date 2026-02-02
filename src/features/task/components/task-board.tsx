"use client";

import type { TaskWithAssignee, TaskStatus } from "../task-types";
import { TASK_STATUSES } from "../task-types";
import TaskBoardColumn from "./task-board-column";

type TaskBoardProps = {
  tasks: TaskWithAssignee[];
  onTaskClick: (task: TaskWithAssignee) => void;
  onAddClick: (status: TaskStatus) => void;
};

export default function TaskBoard({
  tasks,
  onTaskClick,
  onAddClick,
}: TaskBoardProps) {
  const tasksByStatus = TASK_STATUSES.map((s) => ({
    ...s,
    tasks: tasks.filter((t) => t.status === s.value),
  }));

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {tasksByStatus.map((column) => (
        <TaskBoardColumn
          key={column.value}
          status={column.value}
          label={column.label}
          tasks={column.tasks}
          onTaskClick={onTaskClick}
          onAddClick={onAddClick}
        />
      ))}
    </div>
  );
}
