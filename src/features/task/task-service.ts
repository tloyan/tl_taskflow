import "server-only";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { AuthError } from "../auth/auth-errors";
import type { MemberRole } from "../member/member-types";
import {
  createTaskSchema,
  updateTaskSchema,
  deleteTaskSchema,
  updateTaskStatusSchema,
  updateTaskPrioritySchema,
  updateTaskAssigneeSchema,
  updateTaskDueDateSchema,
} from "./task-validation";
import {
  TaskValidationError,
  TaskNotFoundError,
  TaskPermissionError,
} from "./task-errors";
import {
  createTaskRepository,
  getTaskByIdRepository,
  updateTaskRepository,
  deleteTaskRepository,
  getMaxPositionByStatusRepository,
} from "./task-repository";
import { getProjectByIdRepository } from "../project/project-repository";
import { getMemberRepository } from "../member/member-repository";
import type { z } from "zod";

function getFieldFromZodError(issue: z.ZodIssue): string {
  const field = issue.path[0];
  return typeof field === "string" ? field : String(field);
}

function assertTaskPermission(role: string, requiredRoles: MemberRole[]): void {
  if (!requiredRoles.includes(role as MemberRole)) {
    throw new TaskPermissionError();
  }
}

async function getSessionOrThrow() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new AuthError();
  return session;
}

async function getMemberForTask(workspaceId: string, userId: string) {
  const member = await getMemberRepository(workspaceId, userId);
  if (!member) throw new TaskPermissionError();
  return member;
}

async function getProjectForTask(projectId: string) {
  const project = await getProjectByIdRepository(projectId);
  if (!project) throw new TaskNotFoundError("Projet introuvable");
  return project;
}

export async function createTask(data: unknown): Promise<string> {
  const session = await getSessionOrThrow();

  const parsed = createTaskSchema.safeParse(data);
  if (!parsed.success) {
    const err = parsed.error.issues[0];
    throw new TaskValidationError(getFieldFromZodError(err), err.message);
  }

  const project = await getProjectForTask(parsed.data.projectId);
  const member = await getMemberForTask(project.workspaceId, session.user.id);
  assertTaskPermission(member.role, ["owner", "admin", "member"]);

  if (parsed.data.assigneeId) {
    const assigneeMember = await getMemberRepository(
      project.workspaceId,
      parsed.data.assigneeId,
    );
    if (!assigneeMember) {
      throw new TaskValidationError(
        "assigneeId",
        "L'assigné doit être membre du workspace",
      );
    }
  }

  const maxPosition = await getMaxPositionByStatusRepository(
    parsed.data.projectId,
    parsed.data.status,
  );

  const { id } = await createTaskRepository({
    title: parsed.data.title,
    description: parsed.data.description,
    projectId: parsed.data.projectId,
    assigneeId: parsed.data.assigneeId || null,
    creatorId: session.user.id,
    status: parsed.data.status,
    priority: parsed.data.priority,
    dueDate: parsed.data.dueDate || null,
    position: maxPosition + 1,
  });

  return id;
}

export async function updateTask(data: unknown): Promise<void> {
  const session = await getSessionOrThrow();

  const parsed = updateTaskSchema.safeParse(data);
  if (!parsed.success) {
    const err = parsed.error.issues[0];
    throw new TaskValidationError(getFieldFromZodError(err), err.message);
  }

  const task = await getTaskByIdRepository(parsed.data.id);
  if (!task) throw new TaskNotFoundError();

  const project = await getProjectForTask(task.projectId);
  const member = await getMemberForTask(project.workspaceId, session.user.id);
  assertTaskPermission(member.role, ["owner", "admin", "member"]);

  if (parsed.data.assigneeId) {
    const assigneeMember = await getMemberRepository(
      project.workspaceId,
      parsed.data.assigneeId,
    );
    if (!assigneeMember) {
      throw new TaskValidationError(
        "assigneeId",
        "L'assigné doit être membre du workspace",
      );
    }
  }

  await updateTaskRepository(parsed.data.id, {
    title: parsed.data.title,
    description: parsed.data.description,
    status: parsed.data.status,
    priority: parsed.data.priority,
    assigneeId: parsed.data.assigneeId,
    dueDate: parsed.data.dueDate,
  });
}

export async function deleteTask(data: unknown): Promise<string> {
  const session = await getSessionOrThrow();

  const parsed = deleteTaskSchema.safeParse(data);
  if (!parsed.success) {
    const err = parsed.error.issues[0];
    throw new TaskValidationError(getFieldFromZodError(err), err.message);
  }

  const task = await getTaskByIdRepository(parsed.data.id);
  if (!task) throw new TaskNotFoundError();

  const project = await getProjectForTask(task.projectId);
  const member = await getMemberForTask(project.workspaceId, session.user.id);

  // Members can only delete their own tasks, owner/admin can delete any
  if (member.role === "member" && task.creatorId !== session.user.id) {
    throw new TaskPermissionError();
  }
  assertTaskPermission(member.role, ["owner", "admin", "member"]);

  const projectId = task.projectId;
  await deleteTaskRepository(parsed.data.id);
  return projectId;
}

export async function updateTaskStatus(data: unknown): Promise<void> {
  const session = await getSessionOrThrow();

  const parsed = updateTaskStatusSchema.safeParse(data);
  if (!parsed.success) {
    const err = parsed.error.issues[0];
    throw new TaskValidationError(getFieldFromZodError(err), err.message);
  }

  const task = await getTaskByIdRepository(parsed.data.id);
  if (!task) throw new TaskNotFoundError();

  const project = await getProjectForTask(task.projectId);
  const member = await getMemberForTask(project.workspaceId, session.user.id);
  assertTaskPermission(member.role, ["owner", "admin", "member"]);

  await updateTaskRepository(parsed.data.id, {
    status: parsed.data.status,
  });
}

export async function updateTaskPriority(data: unknown): Promise<void> {
  const session = await getSessionOrThrow();

  const parsed = updateTaskPrioritySchema.safeParse(data);
  if (!parsed.success) {
    const err = parsed.error.issues[0];
    throw new TaskValidationError(getFieldFromZodError(err), err.message);
  }

  const task = await getTaskByIdRepository(parsed.data.id);
  if (!task) throw new TaskNotFoundError();

  const project = await getProjectForTask(task.projectId);
  const member = await getMemberForTask(project.workspaceId, session.user.id);
  assertTaskPermission(member.role, ["owner", "admin", "member"]);

  await updateTaskRepository(parsed.data.id, {
    priority: parsed.data.priority,
  });
}

export async function updateTaskAssignee(data: unknown): Promise<void> {
  const session = await getSessionOrThrow();

  const parsed = updateTaskAssigneeSchema.safeParse(data);
  if (!parsed.success) {
    const err = parsed.error.issues[0];
    throw new TaskValidationError(getFieldFromZodError(err), err.message);
  }

  const task = await getTaskByIdRepository(parsed.data.id);
  if (!task) throw new TaskNotFoundError();

  const project = await getProjectForTask(task.projectId);
  const member = await getMemberForTask(project.workspaceId, session.user.id);
  assertTaskPermission(member.role, ["owner", "admin", "member"]);

  if (parsed.data.assigneeId) {
    const assigneeMember = await getMemberRepository(
      project.workspaceId,
      parsed.data.assigneeId,
    );
    if (!assigneeMember) {
      throw new TaskValidationError(
        "assigneeId",
        "L'assigné doit être membre du workspace",
      );
    }
  }

  await updateTaskRepository(parsed.data.id, {
    assigneeId: parsed.data.assigneeId,
  });
}

export async function updateTaskDueDate(data: unknown): Promise<void> {
  const session = await getSessionOrThrow();

  const parsed = updateTaskDueDateSchema.safeParse(data);
  if (!parsed.success) {
    const err = parsed.error.issues[0];
    throw new TaskValidationError(getFieldFromZodError(err), err.message);
  }

  const task = await getTaskByIdRepository(parsed.data.id);
  if (!task) throw new TaskNotFoundError();

  const project = await getProjectForTask(task.projectId);
  const member = await getMemberForTask(project.workspaceId, session.user.id);
  assertTaskPermission(member.role, ["owner", "admin", "member"]);

  await updateTaskRepository(parsed.data.id, {
    dueDate: parsed.data.dueDate,
  });
}
