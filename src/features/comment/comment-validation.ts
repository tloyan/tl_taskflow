import { z } from "zod";

export const createCommentSchema = z.object({
  taskId: z.string().uuid(),
  content: z
    .string()
    .min(1, "Le commentaire est requis")
    .max(5000, "Le commentaire ne peut pas dépasser 5000 caractères")
    .trim(),
});

export const deleteCommentSchema = z.object({
  id: z.string().uuid(),
});
