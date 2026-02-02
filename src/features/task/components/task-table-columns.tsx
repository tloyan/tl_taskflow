"use client";

import { createColumnHelper } from "@tanstack/react-table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import PriorityBadge from "./priority-badge";
import StatusBadge from "./status-badge";
import type { TaskWithAssignee } from "../task-types";

const columnHelper = createColumnHelper<TaskWithAssignee>();

export const taskColumns = [
  columnHelper.accessor("title", {
    header: "Titre",
    cell: (info) => (
      <span className="font-medium">{info.getValue()}</span>
    ),
  }),
  columnHelper.accessor("status", {
    header: "Statut",
    cell: (info) => <StatusBadge status={info.getValue()} />,
  }),
  columnHelper.accessor("priority", {
    header: "Priorité",
    cell: (info) => <PriorityBadge priority={info.getValue()} />,
  }),
  columnHelper.accessor("assignee", {
    header: "Assigné",
    cell: (info) => {
      const assignee = info.getValue();
      if (!assignee) return <span className="text-muted-foreground">—</span>;
      return (
        <div className="flex items-center gap-2">
          <Avatar className="size-6">
            <AvatarImage src={assignee.image ?? undefined} />
            <AvatarFallback className="text-xs">
              {assignee.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm">{assignee.name}</span>
        </div>
      );
    },
    enableSorting: false,
  }),
  columnHelper.accessor("dueDate", {
    header: "Échéance",
    cell: (info) => {
      const date = info.getValue();
      if (!date) return <span className="text-muted-foreground">—</span>;
      return (
        <span className="text-sm">
          {format(new Date(date), "dd MMM yyyy", { locale: fr })}
        </span>
      );
    },
  }),
];
