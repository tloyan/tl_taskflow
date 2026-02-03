import "server-only";

import { db } from "@/db";
import { projects, type NewProject } from "@/db/schema/projects";
import { eq } from "drizzle-orm";
import { workspaceMembers } from "@/db/schema/workspace-members";
import type { Project } from "./project-types";

export type UpdateProjectData = {
  name: string;
  description?: string;
  color: string;
};

export async function createProjectRepository(
  project: NewProject
): Promise<{ id: string }> {
  const [created] = await db
    .insert(projects)
    .values(project)
    .returning({ id: projects.id });
  return created;
}

export async function getProjectByIdRepository(
  id: string
): Promise<Project | undefined> {
  return await db.query.projects.findFirst({
    where: { id },
  });
}

export async function getProjectsByWorkspaceIdRepository(
  workspaceId: string
): Promise<Project[]> {
  return await db.query.projects.findMany({
    where: { workspaceId },
    orderBy: (projects, { desc }) => [desc(projects.createdAt)],
  });
}

export async function updateProjectRepository(
  id: string,
  data: UpdateProjectData
): Promise<{ id: string }> {
  const [updated] = await db
    .update(projects)
    .set(data)
    .where(eq(projects.id, id))
    .returning({ id: projects.id });
  return updated;
}

export async function deleteProjectRepository(
  id: string
): Promise<{ id: string }> {
  const [deleted] = await db
    .delete(projects)
    .where(eq(projects.id, id))
    .returning({ id: projects.id });
  return deleted;
}

export async function archiveProjectRepository(
  id: string
): Promise<{ id: string }> {
  const [archived] = await db
    .update(projects)
    .set({ status: "archived" })
    .where(eq(projects.id, id))
    .returning({ id: projects.id });
  return archived;
}

export async function unarchiveProjectRepository(
  id: string
): Promise<{ id: string }> {
  const [unarchived] = await db
    .update(projects)
    .set({ status: "active" })
    .where(eq(projects.id, id))
    .returning({ id: projects.id });
  return unarchived;
}

export async function getAllProjectsByUserIdRepository(
  userId: string
): Promise<Project[]> {
  const memberRows = await db
    .select({ workspaceId: workspaceMembers.workspaceId })
    .from(workspaceMembers)
    .where(eq(workspaceMembers.userId, userId));

  const workspaceIds = memberRows.map((r) => r.workspaceId);

  if (workspaceIds.length === 0) {
    return [];
  }

  return await db.query.projects.findMany({
    where: { workspaceId: { in: workspaceIds } },
    orderBy: (projects, { desc }) => [desc(projects.createdAt)],
  });
}
