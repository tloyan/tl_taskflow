import "server-only";

import { db } from "@/db";
import { NewWorkspace, workspaces } from "@/db/schema/workspaces";
import { eq } from "drizzle-orm";
import type { Workspace } from "./workspace-types";

/** Data required to update a workspace */
export type UpdateWorkspaceData = {
  name: string;
  slug: string;
  description?: string;
};

export async function createWorkspaceRepository(
  workspace: NewWorkspace
): Promise<void> {
  await db.insert(workspaces).values(workspace);
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
): Promise<void> {
  await db.update(workspaces).set(data).where(eq(workspaces.id, id));
}

export async function deleteWorkspaceRepository(id: string): Promise<void> {
  await db.delete(workspaces).where(eq(workspaces.id, id));
}
