import { Badge } from "@/components/ui/badge";
import { CircleDashed, Circle, Timer, CheckCircle2 } from "lucide-react";
import type { TaskStatus } from "../task-types";

const statusConfig: Record<
  TaskStatus,
  { label: string; icon: React.ElementType; className: string }
> = {
  backlog: {
    label: "Backlog",
    icon: CircleDashed,
    className: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
  },
  todo: {
    label: "À faire",
    icon: Circle,
    className: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  },
  in_progress: {
    label: "En cours",
    icon: Timer,
    className: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
  },
  done: {
    label: "Terminé",
    icon: CheckCircle2,
    className: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  },
};

export default function StatusBadge({ status }: { status: string }) {
  const config = statusConfig[status as TaskStatus] ?? statusConfig.backlog;
  const Icon = config.icon;

  return (
    <Badge variant="outline" className={config.className}>
      <Icon className="size-3" />
      {config.label}
    </Badge>
  );
}
