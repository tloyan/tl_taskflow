import { z } from "zod";

export const createProjectSchema = z.object({
  workspaceId: z.string().uuid(),
  name: z
    .string()
    .min(1, "Le nom est requis")
    .min(2, "Le nom doit contenir au moins 2 caractères")
    .max(50, "Le nom ne peut pas dépasser 50 caractères")
    .trim()
    .transform((value) => value.replace(/\s+/g, " ")),
  description: z.string().max(500, "La description ne peut pas dépasser 500 caractères").optional(),
  color: z.string(),
});

export const updateProjectSchema = z.object({
  id: z.string().uuid(),
  name: z
    .string()
    .min(1, "Le nom est requis")
    .min(2, "Le nom doit contenir au moins 2 caractères")
    .max(50, "Le nom ne peut pas dépasser 50 caractères")
    .trim()
    .transform((value) => value.replace(/\s+/g, " ")),
  description: z.string().max(500, "La description ne peut pas dépasser 500 caractères").optional(),
  color: z.string(),
});

export const deleteProjectSchema = z.object({
  id: z.string().uuid(),
  confirmName: z.string().min(1, "Le nom est requis pour confirmer"),
});

export const archiveProjectSchema = z.object({
  id: z.string().uuid(),
});
