"use client";

import { Button } from "@/components/ui/button";
import { LayoutGrid, List } from "lucide-react";

type TaskViewToggleProps = {
  view: "board" | "table";
  onViewChange: (view: "board" | "table") => void;
};

export default function TaskViewToggle({
  view,
  onViewChange,
}: TaskViewToggleProps) {
  return (
    <div className="flex rounded-md border">
      <Button
        variant={view === "board" ? "secondary" : "ghost"}
        size="sm"
        className="rounded-r-none"
        onClick={() => onViewChange("board")}
      >
        <LayoutGrid className="size-4" />
        Board
      </Button>
      <Button
        variant={view === "table" ? "secondary" : "ghost"}
        size="sm"
        className="rounded-l-none"
        onClick={() => onViewChange("table")}
      >
        <List className="size-4" />
        Table
      </Button>
    </div>
  );
}
