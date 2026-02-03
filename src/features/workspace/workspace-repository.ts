import "server-only";

import { db } from "@/db";
import { NewWorkspace, workspaces } from "@/db/schema/workspaces";
import { workspaceMembers } from "@/db/schema/workspace-members";
import { count, eq, inArray } from "drizzle-orm";
import type { Workspace } from "./workspace-types";

/** Data required to update a workspace */
export type UpdateWorkspaceData = {
  name: string;
  slug: string;
  description?: string;
};

export async function createWorkspaceRepository(
  workspace: NewWorkspace
): Promise<{ id: string }> {
  const [created] = await db
    .insert(workspaces)
    .values(workspace)
    .returning({ id: workspaces.id });
  return created;
}

export async function getWorkspaceBySlugRepository(
  slug: string
): Promise<Workspace | undefined> {
  return await db.query.workspaces.findFirst({
    where: {
      slug,
    },
  });
}

export async function getWorkspaceByIdRepository(
  id: string
): Promise<Workspace | undefined> {
  return await db.query.workspaces.findFirst({
    where: {
      id,
    },
  });
}

export async function getWorkspacesByOwnerIdRepository(
  ownerId: string
): Promise<Workspace[]> {
  return await db.query.workspaces.findMany({
    where: {
      ownerId,
    },
  });
}

export async function updateWorkspaceRepository(
  id: string,
  data: UpdateWorkspaceData
): Promise<{ id: string }> {
  const [updated] = await db
    .update(workspaces)
    .set(data)
    .where(eq(workspaces.id, id))
    .returning({ id: workspaces.id });
  return updated;
}

export async function deleteWorkspaceRepository(
  id: string
): Promise<{ id: string }> {
  const [deleted] = await db
    .delete(workspaces)
    .where(eq(workspaces.id, id))
    .returning({ id: workspaces.id });
  return deleted;
}

export async function getWorkspacesWithCountsByUserIdRepository(
  userId: string
): Promise<
  {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    ownerId: string;
    createdAt: Date;
    updatedAt: Date;
    membersCount: number;
  }[]
> {
  const memberRows = await db
    .select({ workspaceId: workspaceMembers.workspaceId })
    .from(workspaceMembers)
    .where(eq(workspaceMembers.userId, userId));

  const workspaceIds = memberRows.map((r) => r.workspaceId);

  if (workspaceIds.length === 0) {
    return [];
  }

  const rows = await db
    .select({
      id: workspaces.id,
      name: workspaces.name,
      slug: workspaces.slug,
      description: workspaces.description,
      ownerId: workspaces.ownerId,
      createdAt: workspaces.createdAt,
      updatedAt: workspaces.updatedAt,
      membersCount: count(workspaceMembers.userId),
    })
    .from(workspaces)
    .leftJoin(workspaceMembers, eq(workspaces.id, workspaceMembers.workspaceId))
    .where(inArray(workspaces.id, workspaceIds))
    .groupBy(workspaces.id);

  return rows.map((row) => ({
    ...row,
    membersCount: Number(row.membersCount),
  }));
}
