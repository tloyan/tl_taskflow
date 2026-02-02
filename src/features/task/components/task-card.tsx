"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { CalendarIcon, MessageSquareIcon } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import PriorityBadge from "./priority-badge";
import type { TaskWithAssignee } from "../task-types";

type TaskCardProps = {
  task: TaskWithAssignee;
  commentCount?: number;
  onClick: (task: TaskWithAssignee) => void;
};

export default function TaskCard({ task, commentCount, onClick }: TaskCardProps) {
  return (
    <Card
      className="cursor-pointer p-3 transition-shadow hover:shadow-md"
      onClick={() => onClick(task)}
    >
      <p className="text-sm font-medium">{task.title}</p>

      <div className="mt-2 flex items-center gap-2">
        <PriorityBadge priority={task.priority} />
      </div>

      <div className="mt-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {task.dueDate && (
            <span className="text-muted-foreground flex items-center gap-1 text-xs">
              <CalendarIcon className="size-3" />
              {formatDistanceToNow(new Date(task.dueDate), {
                addSuffix: true,
                locale: fr,
              })}
            </span>
          )}
          {commentCount !== undefined && commentCount > 0 && (
            <span className="text-muted-foreground flex items-center gap-1 text-xs">
              <MessageSquareIcon className="size-3" />
              {commentCount}
            </span>
          )}
        </div>

        {task.assignee && (
          <Avatar className="size-6">
            <AvatarImage src={task.assignee.image ?? undefined} />
            <AvatarFallback className="text-xs">
              {task.assignee.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        )}
      </div>
    </Card>
  );
}
