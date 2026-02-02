import "server-only";

import { db } from "@/db";
import { tasks, type NewTask } from "@/db/schema/tasks";
import { user } from "@/db/schema/auth-schema";
import { eq, and, desc, max } from "drizzle-orm";
import type { Task, TaskWithAssignee } from "./task-types";

export type UpdateTaskData = {
  title?: string;
  description?: string | null;
  status?: string;
  priority?: string;
  assigneeId?: string | null;
  dueDate?: Date | null;
  position?: number;
};

export async function createTaskRepository(
  task: NewTask
): Promise<{ id: string }> {
  const [created] = await db
    .insert(tasks)
    .values(task)
    .returning({ id: tasks.id });
  return created;
}

export async function getTaskByIdRepository(
  id: string
): Promise<Task | undefined> {
  return await db.query.tasks.findFirst({
    where: { id },
  });
}

export async function getTaskWithAssigneeByIdRepository(
  id: string
): Promise<TaskWithAssignee | undefined> {
  const rows = await db
    .select({
      id: tasks.id,
      title: tasks.title,
      description: tasks.description,
      projectId: tasks.projectId,
      assigneeId: tasks.assigneeId,
      creatorId: tasks.creatorId,
      status: tasks.status,
      priority: tasks.priority,
      dueDate: tasks.dueDate,
      position: tasks.position,
      createdAt: tasks.createdAt,
      updatedAt: tasks.updatedAt,
      assignee: {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
      },
    })
    .from(tasks)
    .leftJoin(user, eq(tasks.assigneeId, user.id))
    .where(eq(tasks.id, id));

  if (!rows[0]) return undefined;

  const row = rows[0];
  return {
    ...row,
    assignee: row.assignee?.id ? row.assignee : null,
  } as TaskWithAssignee;
}

export async function getTasksByProjectIdRepository(
  projectId: string
): Promise<TaskWithAssignee[]> {
  const rows = await db
    .select({
      id: tasks.id,
      title: tasks.title,
      description: tasks.description,
      projectId: tasks.projectId,
      assigneeId: tasks.assigneeId,
      creatorId: tasks.creatorId,
      status: tasks.status,
      priority: tasks.priority,
      dueDate: tasks.dueDate,
      position: tasks.position,
      createdAt: tasks.createdAt,
      updatedAt: tasks.updatedAt,
      assignee: {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
      },
    })
    .from(tasks)
    .leftJoin(user, eq(tasks.assigneeId, user.id))
    .where(eq(tasks.projectId, projectId))
    .orderBy(tasks.position, desc(tasks.createdAt));

  return rows.map((row) => ({
    ...row,
    assignee: row.assignee?.id ? row.assignee : null,
  })) as TaskWithAssignee[];
}

export async function updateTaskRepository(
  id: string,
  data: UpdateTaskData
): Promise<void> {
  await db.update(tasks).set(data).where(eq(tasks.id, id));
}

export async function deleteTaskRepository(id: string): Promise<void> {
  await db.delete(tasks).where(eq(tasks.id, id));
}

export async function getMaxPositionByStatusRepository(
  projectId: string,
  status: string
): Promise<number> {
  const result = await db
    .select({ maxPos: max(tasks.position) })
    .from(tasks)
    .where(and(eq(tasks.projectId, projectId), eq(tasks.status, status)));

  return result[0]?.maxPos ?? 0;
}
