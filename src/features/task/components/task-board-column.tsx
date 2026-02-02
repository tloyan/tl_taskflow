"use client";

import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import type { TaskWithAssignee, TaskStatus } from "../task-types";
import TaskCard from "./task-card";

type TaskBoardColumnProps = {
  status: TaskStatus;
  label: string;
  tasks: TaskWithAssignee[];
  onTaskClick: (task: TaskWithAssignee) => void;
  onAddClick: (status: TaskStatus) => void;
};

export default function TaskBoardColumn({
  status,
  label,
  tasks,
  onTaskClick,
  onAddClick,
}: TaskBoardColumnProps) {
  return (
    <div className="bg-muted/50 flex min-h-[200px] w-72 shrink-0 flex-col rounded-lg p-3">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold">
          {label}{" "}
          <span className="text-muted-foreground font-normal">
            ({tasks.length})
          </span>
        </h3>
      </div>

      <div className="flex flex-1 flex-col gap-2">
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} onClick={onTaskClick} />
        ))}
      </div>

      <Button
        variant="ghost"
        size="sm"
        className="mt-2 w-full justify-start"
        onClick={() => onAddClick(status)}
      >
        <PlusIcon className="size-4" />
        Ajouter
      </Button>
    </div>
  );
}
