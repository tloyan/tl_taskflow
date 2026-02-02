import { Badge } from "@/components/ui/badge";
import type { TaskPriority } from "../task-types";

const priorityConfig: Record<
  TaskPriority,
  { label: string; className: string }
> = {
  low: {
    label: "Basse",
    className: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  },
  medium: {
    label: "Moyenne",
    className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  },
  high: {
    label: "Haute",
    className: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  },
  urgent: {
    label: "Urgente",
    className: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
  },
};

export default function PriorityBadge({ priority }: { priority: string }) {
  const config = priorityConfig[priority as TaskPriority] ?? priorityConfig.medium;

  return (
    <Badge variant="outline" className={config.className}>
      {config.label}
    </Badge>
  );
}
