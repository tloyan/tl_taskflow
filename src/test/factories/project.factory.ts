import { testDb } from "../helpers/test-db";
import { projects } from "@/db/schema/projects";
import { randomUUID } from "crypto";

type ProjectOverrides = {
  id?: string;
  name?: string;
  description?: string | null;
  workspaceId: string;
  status?: string;
  color?: string;
};

export async function createTestProject(overrides: ProjectOverrides) {
  const id = overrides.id ?? randomUUID();

  const [created] = await testDb
    .insert(projects)
    .values({
      id,
      name: overrides.name ?? `Project ${id.slice(0, 6)}`,
      description: overrides.description ?? null,
      workspaceId: overrides.workspaceId,
      status: overrides.status ?? "active",
      color: overrides.color ?? "#6a7282",
    })
    .returning();

  return created;
}
