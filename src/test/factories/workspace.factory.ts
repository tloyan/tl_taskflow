import { testDb } from "../helpers/test-db";
import { workspaces } from "@/db/schema/workspaces";
import { workspaceMembers } from "@/db/schema/workspace-members";
import { createTestUser } from "./user.factory";
import { randomUUID } from "crypto";

type WorkspaceOverrides = {
  id?: string;
  name?: string;
  slug?: string;
  description?: string | null;
  ownerId?: string;
};

export async function createTestWorkspace(overrides: WorkspaceOverrides = {}) {
  const ownerId = overrides.ownerId ?? (await createTestUser()).id;
  const id = overrides.id ?? randomUUID();
  const slug = overrides.slug ?? `workspace-${id.slice(0, 6)}`;

  const [created] = await testDb
    .insert(workspaces)
    .values({
      id,
      name: overrides.name ?? `Workspace ${id.slice(0, 6)}`,
      slug,
      description: overrides.description ?? null,
      ownerId,
    })
    .returning();

  await testDb.insert(workspaceMembers).values({
    workspaceId: created.id,
    userId: ownerId,
    role: "owner",
  });

  return created;
}
