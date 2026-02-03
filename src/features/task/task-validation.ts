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
  assigneeId: z.preprocess(
    (val) => (val === "unassigned" || val === "" ? undefined : val),
    z.string().uuid().optional()
  ),
  dueDate: z.preprocess(
    (val) => (val === "" ? undefined : val),
    z.coerce.date().optional()
  ),
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
  assigneeId: z.preprocess(
    (val) => (val === "unassigned" || val === "" ? undefined : val),
    z.string().uuid().nullable().optional()
  ),
  dueDate: z.preprocess(
    (val) => (val === "" ? undefined : val),
    z.coerce.date().nullable().optional()
  ),
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
  assigneeId: z.string().uuid().nullable(),
});

export const updateTaskDueDateSchema = z.object({
  id: z.string().uuid(),
  dueDate: z.coerce.date().nullable(),
});
