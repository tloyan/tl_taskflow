import { z } from "zod";
import { TASK_STATUS_VALUES, TASK_PRIORITY_VALUES } from "./task-types";

export const createTaskSchema = z.object({
  projectId: z.string().uuid(),
  title: z
    .string()
    .min(1, "Le titre est requis")
    .min(2, "Le titre doit contenir au moins 2 caractères")
    .max(200, "Le titre ne peut pas dépasser 200 caractères")
    .trim()
    .transform((value) => value.replace(/\s+/g, " ")),
  description: z
    .string()
    .max(5000, "La description ne peut pas dépasser 5000 caractères")
    .optional(),
  status: z.enum(TASK_STATUS_VALUES).default("backlog"),
  priority: z.enum(TASK_PRIORITY_VALUES).default("medium"),
  assigneeId: z
    .string()
    .optional()
    .transform((val) => (val === "unassigned" || val === "" ? undefined : val))
    .pipe(z.string().min(1).optional()),
  dueDate: z
    .string()
    .optional()
    .transform((val) =>
      val === "" || val === undefined ? undefined : new Date(val)
    )
    .pipe(z.date().optional()),
});

export const updateTaskSchema = z.object({
  id: z.string().uuid(),
  title: z
    .string()
    .min(1, "Le titre est requis")
    .min(2, "Le titre doit contenir au moins 2 caractères")
    .max(200, "Le titre ne peut pas dépasser 200 caractères")
    .trim()
    .transform((value) => value.replace(/\s+/g, " ")),
  description: z
    .string()
    .max(5000, "La description ne peut pas dépasser 5000 caractères")
    .optional(),
  status: z.enum(TASK_STATUS_VALUES).optional(),
  priority: z.enum(TASK_PRIORITY_VALUES).optional(),
  assigneeId: z
    .string()
    .nullable()
    .optional()
    .transform((val) => (val === "unassigned" || val === "" || val == null ? undefined : val))
    .pipe(z.string().min(1).optional()),
  dueDate: z
    .string()
    .nullable()
    .optional()
    .transform((val) =>
      val === "" || val == null ? undefined : new Date(val)
    )
    .pipe(z.date().optional()),
});

export const deleteTaskSchema = z.object({
  id: z.string().uuid(),
});

export const updateTaskStatusSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(TASK_STATUS_VALUES),
});

export const updateTaskPrioritySchema = z.object({
  id: z.string().uuid(),
  priority: z.enum(TASK_PRIORITY_VALUES),
});

export const updateTaskAssigneeSchema = z.object({
  id: z.string().uuid(),
  assigneeId: z.string().min(1).nullable(),
});

export const updateTaskDueDateSchema = z.object({
  id: z.string().uuid(),
  dueDate: z.coerce.date().nullable(),
});
