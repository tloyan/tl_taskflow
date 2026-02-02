import type { tasks } from "@/db/schema/tasks";

export type Task = typeof tasks.$inferSelect;

export type TaskWithAssignee = Task & {
  assignee: {
    id: string;
    name: string;
    email: string;
    image: string | null;
  } | null;
};

export type TaskStatus = "backlog" | "todo" | "in_progress" | "done";
export type TaskPriority = "low" | "medium" | "high" | "urgent";

export const TASK_STATUSES: { value: TaskStatus; label: string }[] = [
  { value: "backlog", label: "Backlog" },
  { value: "todo", label: "À faire" },
  { value: "in_progress", label: "En cours" },
  { value: "done", label: "Terminé" },
];

export const TASK_PRIORITIES: { value: TaskPriority; label: string }[] = [
  { value: "low", label: "Basse" },
  { value: "medium", label: "Moyenne" },
  { value: "high", label: "Haute" },
  { value: "urgent", label: "Urgente" },
];

export const TaskErrorCode = {
  AUTHENTICATION_ERROR: "AUTHENTICATION_ERROR",
  VALIDATION_ERROR: "VALIDATION_ERROR",
  NOT_FOUND: "NOT_FOUND",
  PERMISSION_ERROR: "PERMISSION_ERROR",
  UNKNOWN_ERROR: "UNKNOWN_ERROR",
} as const;

export type TaskErrorCode = (typeof TaskErrorCode)[keyof typeof TaskErrorCode];

type BaseTaskActionError = {
  code: Exclude<TaskErrorCode, "VALIDATION_ERROR">;
  message: string;
};

type ValidationTaskActionError = {
  code: "VALIDATION_ERROR";
  field: string;
  message: string;
};

export type TaskActionError = BaseTaskActionError | ValidationTaskActionError;

export type TaskActionResultError = { error: TaskActionError };

export type CreateTaskActionResult =
  | TaskActionResultError
  | { success: true; id: string };

export type UpdateTaskActionResult =
  | TaskActionResultError
  | { success: true };

export type DeleteTaskActionResult =
  | TaskActionResultError
  | { success: true };

export type UpdateTaskStatusActionResult =
  | TaskActionResultError
  | { success: true };

export type UpdateTaskPriorityActionResult =
  | TaskActionResultError
  | { success: true };

export type UpdateTaskAssigneeActionResult =
  | TaskActionResultError
  | { success: true };

export type UpdateTaskDueDateActionResult =
  | TaskActionResultError
  | { success: true };
