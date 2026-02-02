"use client";

import { Input } from "@/components/ui/input";
import { SearchIcon } from "lucide-react";

type TaskSearchProps = {
  value: string;
  onChange: (value: string) => void;
};

export default function TaskSearch({ value, onChange }: TaskSearchProps) {
  return (
    <div className="relative">
      <SearchIcon className="text-muted-foreground pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2" />
      <Input
        placeholder="Rechercher une tâche..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-8 w-[200px] pl-8"
      />
    </div>
  );
}
