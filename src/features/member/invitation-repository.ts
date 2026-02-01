import "server-only";

import { db } from "@/db";
import {
  workspaceInvitations,
  type NewWorkspaceInvitation,
} from "@/db/schema/workspace-invitations";
import { workspaces } from "@/db/schema/workspaces";
import { user } from "@/db/schema/auth-schema";
import { and, eq, gt } from "drizzle-orm";
import type { InvitationWithInviter } from "./member-types";

export async function createInvitationRepository(
  data: NewWorkspaceInvitation
): Promise<void> {
  await db.insert(workspaceInvitations).values(data);
}

export async function getInvitationByTokenRepository(token: string) {
  const rows = await db
    .select({
      id: workspaceInvitations.id,
      workspaceId: workspaceInvitations.workspaceId,
      email: workspaceInvitations.email,
      role: workspaceInvitations.role,
      token: workspaceInvitations.token,
      invitedById: workspaceInvitations.invitedById,
      status: workspaceInvitations.status,
      expiresAt: workspaceInvitations.expiresAt,
      createdAt: workspaceInvitations.createdAt,
      workspaceSlug: workspaces.slug,
    })
    .from(workspaceInvitations)
    .innerJoin(workspaces, eq(workspaceInvitations.workspaceId, workspaces.id))
    .where(eq(workspaceInvitations.token, token));

  return rows[0] ?? null;
}

export async function getInvitationDetailsByTokenRepository(token: string) {
  const rows = await db
    .select({
      id: workspaceInvitations.id,
      email: workspaceInvitations.email,
      role: workspaceInvitations.role,
      status: workspaceInvitations.status,
      expiresAt: workspaceInvitations.expiresAt,
      workspaceName: workspaces.name,
      workspaceSlug: workspaces.slug,
      inviterName: user.name,
    })
    .from(workspaceInvitations)
    .innerJoin(workspaces, eq(workspaceInvitations.workspaceId, workspaces.id))
    .innerJoin(user, eq(workspaceInvitations.invitedById, user.id))
    .where(eq(workspaceInvitations.token, token));

  return rows[0] ?? null;
}

export async function getPendingInvitationByEmailRepository(
  workspaceId: string,
  email: string
) {
  const rows = await db
    .select()
    .from(workspaceInvitations)
    .where(
      and(
        eq(workspaceInvitations.workspaceId, workspaceId),
        eq(workspaceInvitations.email, email),
        eq(workspaceInvitations.status, "pending"),
        gt(workspaceInvitations.expiresAt, new Date())
      )
    );

  return rows[0] ?? null;
}

export async function getPendingInvitationsByWorkspaceIdRepository(
  workspaceId: string
): Promise<InvitationWithInviter[]> {
  const rows = await db
    .select({
      id: workspaceInvitations.id,
      workspaceId: workspaceInvitations.workspaceId,
      email: workspaceInvitations.email,
      role: workspaceInvitations.role,
      token: workspaceInvitations.token,
      invitedById: workspaceInvitations.invitedById,
      status: workspaceInvitations.status,
      expiresAt: workspaceInvitations.expiresAt,
      createdAt: workspaceInvitations.createdAt,
      invitedBy: {
        id: user.id,
        name: user.name,
      },
    })
    .from(workspaceInvitations)
    .innerJoin(user, eq(workspaceInvitations.invitedById, user.id))
    .where(
      and(
        eq(workspaceInvitations.workspaceId, workspaceId),
        eq(workspaceInvitations.status, "pending"),
        gt(workspaceInvitations.expiresAt, new Date())
      )
    );

  return rows as InvitationWithInviter[];
}

export async function getInvitationByIdRepository(id: string) {
  const rows = await db
    .select()
    .from(workspaceInvitations)
    .where(eq(workspaceInvitations.id, id));

  return rows[0] ?? null;
}

export async function updateInvitationStatusRepository(
  id: string,
  status: string
): Promise<void> {
  await db
    .update(workspaceInvitations)
    .set({ status })
    .where(eq(workspaceInvitations.id, id));
}

export async function updateInvitationRoleRepository(
  id: string,
  role: string
): Promise<void> {
  await db
    .update(workspaceInvitations)
    .set({ role })
    .where(eq(workspaceInvitations.id, id));
}
