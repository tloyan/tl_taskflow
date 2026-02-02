import { z } from "zod";

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
  status: z.enum(["backlog", "todo", "in_progress", "done"]).default("backlog"),
  priority: z.enum(["low", "medium", "high", "urgent"]).default("medium"),
  assigneeId: z.string().optional(),
  dueDate: z.coerce.date().optional(),
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
  status: z.enum(["backlog", "todo", "in_progress", "done"]).optional(),
  priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
  assigneeId: z.string().nullable().optional(),
  dueDate: z.coerce.date().nullable().optional(),
});

export const deleteTaskSchema = z.object({
  id: z.string().uuid(),
});

export const updateTaskStatusSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(["backlog", "todo", "in_progress", "done"]),
});

export const updateTaskPrioritySchema = z.object({
  id: z.string().uuid(),
  priority: z.enum(["low", "medium", "high", "urgent"]),
});

export const updateTaskAssigneeSchema = z.object({
  id: z.string().uuid(),
  assigneeId: z.string().nullable(),
});

export const updateTaskDueDateSchema = z.object({
  id: z.string().uuid(),
  dueDate: z.coerce.date().nullable(),
});
