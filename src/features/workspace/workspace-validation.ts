import { z } from "zod";

/**
 * Generates a URL-friendly slug from a name string.
 * - Converts to lowercase
 * - Replaces spaces with hyphens
 * - Removes invalid characters
 * - Collapses consecutive hyphens
 * - Removes leading/trailing hyphens
 */
export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export const createWorkspaceSchema = z.object({
  name: z
    .string()
    .min(1, "Le nom est requis")
    .min(3, "Le nom doit contenir au moins 3 caractères")
    .trim()
    .transform((values) => values.replace(/\s+/g, " ")),
  slug: z
    .string()
    .min(1, "Le slug est requis")
    .min(3, "Le slug doit contenir au moins 3 caractères")
    .regex(
      /^[a-z0-9-]+$/,
      "Le slug ne peut contenir que des lettres minuscules, chiffres et tirets"
    ),
  description: z.string().optional(),
});

export const updateWorkspaceSchema = z.object({
  id: z.string().uuid(),
  name: z
    .string()
    .min(1, "Le nom est requis")
    .min(3, "Le nom doit contenir au moins 3 caractères")
    .trim()
    .transform((values) => values.replace(/\s+/g, " ")),
  slug: z
    .string()
    .min(1, "Le slug est requis")
    .min(3, "Le slug doit contenir au moins 3 caractères")
    .regex(
      /^[a-z0-9-]+$/,
      "Le slug ne peut contenir que des lettres minuscules, chiffres et tirets"
    ),
  description: z.string().optional(),
});

export const deleteWorkspaceSchema = z.object({
  id: z.string().uuid(),
  confirmName: z.string().min(1, "Le nom est requis pour confirmer"),
});
