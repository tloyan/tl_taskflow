import { testDb } from "../helpers/test-db";
import { tasks } from "@/db/schema/tasks";
import { randomUUID } from "crypto";

type TaskOverrides = {
  id?: string;
  title?: string;
  description?: string | null;
  projectId: string;
  assigneeId?: string | null;
  creatorId: string;
  status?: string;
  priority?: string;
  position?: number;
};

export async function createTestTask(overrides: TaskOverrides) {
  const id = overrides.id ?? randomUUID();

  const [created] = await testDb
    .insert(tasks)
    .values({
      id,
      title: overrides.title ?? `Task ${id.slice(0, 6)}`,
      description: overrides.description ?? null,
      projectId: overrides.projectId,
      assigneeId: overrides.assigneeId ?? null,
      creatorId: overrides.creatorId,
      status: overrides.status ?? "backlog",
      priority: overrides.priority ?? "medium",
      position: overrides.position ?? 0,
    })
    .returning();

  return created;
}
