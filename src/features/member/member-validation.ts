import { z } from "zod";

export const memberRoleSchema = z.enum(["admin", "member", "viewer"]);

export const inviteMemberSchema = z.object({
  workspaceId: z.string().uuid("ID de workspace invalide"),
  email: z.string().email("Adresse email invalide"),
  role: memberRoleSchema,
});

export const changeMemberRoleSchema = z.object({
  workspaceId: z.string().uuid("ID de workspace invalide"),
  userId: z.string().min(1, "ID utilisateur requis"),
  role: memberRoleSchema,
});

export const removeMemberSchema = z.object({
  workspaceId: z.string().uuid("ID de workspace invalide"),
  userId: z.string().min(1, "ID utilisateur requis"),
});

export const cancelInvitationSchema = z.object({
  workspaceId: z.string().uuid("ID de workspace invalide"),
  invitationId: z.string().uuid("ID d'invitation invalide"),
});

export const changeInvitationRoleSchema = z.object({
  workspaceId: z.string().uuid("ID de workspace invalide"),
  invitationId: z.string().uuid("ID d'invitation invalide"),
  role: memberRoleSchema,
});

export const acceptInvitationSchema = z.object({
  token: z.string().min(1, "Token requis"),
});
