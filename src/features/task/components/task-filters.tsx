"use client";

import { Button } from "@/components/ui/button";
import { FilterIcon, XIcon } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TASK_STATUSES, TASK_PRIORITIES } from "../task-types";
import type { MemberWithUser } from "@/features/member/member-types";

export type TaskFilters = {
  status: string | null;
  priority: string | null;
  assigneeId: string | null;
};

type TaskFiltersProps = {
  filters: TaskFilters;
  onFiltersChange: (filters: TaskFilters) => void;
  members: MemberWithUser[];
};

export default function TaskFiltersComponent({
  filters,
  onFiltersChange,
  members,
}: TaskFiltersProps) {
  const hasFilters = filters.status || filters.priority || filters.assigneeId;

  return (
    <div className="flex items-center gap-2">
      <FilterIcon className="text-muted-foreground size-4" />

      <Select
        value={filters.status ?? "all"}
        onValueChange={(v) =>
          onFiltersChange({ ...filters, status: v === "all" ? null : v })
        }
      >
        <SelectTrigger size="sm" className="w-[130px]">
          <SelectValue placeholder="Statut" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Tous les statuts</SelectItem>
          {TASK_STATUSES.map((s) => (
            <SelectItem key={s.value} value={s.value}>
              {s.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.priority ?? "all"}
        onValueChange={(v) =>
          onFiltersChange({ ...filters, priority: v === "all" ? null : v })
        }
      >
        <SelectTrigger size="sm" className="w-[130px]">
          <SelectValue placeholder="Priorité" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Toutes les priorités</SelectItem>
          {TASK_PRIORITIES.map((p) => (
            <SelectItem key={p.value} value={p.value}>
              {p.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.assigneeId ?? "all"}
        onValueChange={(v) =>
          onFiltersChange({ ...filters, assigneeId: v === "all" ? null : v })
        }
      >
        <SelectTrigger size="sm" className="w-[150px]">
          <SelectValue placeholder="Assigné" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Tous les membres</SelectItem>
          {members.map((m) => (
            <SelectItem key={m.userId} value={m.userId}>
              {m.user.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {hasFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() =>
            onFiltersChange({ status: null, priority: null, assigneeId: null })
          }
        >
          <XIcon className="size-4" />
          Réinitialiser
        </Button>
      )}
    </div>
  );
}
