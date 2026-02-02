"use client";

import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import TaskViewToggle from "./task-view-toggle";
import TaskFiltersComponent, { type TaskFilters } from "./task-filters";
import TaskSearch from "./task-search";
import type { MemberWithUser } from "@/features/member/member-types";

type TaskToolbarProps = {
  view: "board" | "table";
  onViewChange: (view: "board" | "table") => void;
  filters: TaskFilters;
  onFiltersChange: (filters: TaskFilters) => void;
  search: string;
  onSearchChange: (value: string) => void;
  members: MemberWithUser[];
  onCreateClick: () => void;
};

export default function TaskToolbar({
  view,
  onViewChange,
  filters,
  onFiltersChange,
  search,
  onSearchChange,
  members,
  onCreateClick,
}: TaskToolbarProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <TaskViewToggle view={view} onViewChange={onViewChange} />
          <TaskSearch value={search} onChange={onSearchChange} />
        </div>
        <Button size="sm" onClick={onCreateClick}>
          <PlusIcon className="size-4" />
          Nouvelle tâche
        </Button>
      </div>
      <TaskFiltersComponent
        filters={filters}
        onFiltersChange={onFiltersChange}
        members={members}
      />
    </div>
  );
}
