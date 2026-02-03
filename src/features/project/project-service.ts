import "server-only";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { AuthError } from "../auth/auth-errors";
import type { MemberRole } from "../member/member-types";
import {
  createProjectSchema,
  updateProjectSchema,
  deleteProjectSchema,
  archiveProjectSchema,
} from "./project-validation";
import {
  ProjectValidationError,
  ProjectNotFoundError,
  ProjectPermissionError,
} from "./project-errors";
import {
  createProjectRepository,
  getProjectByIdRepository,
  updateProjectRepository,
  deleteProjectRepository,
  archiveProjectRepository,
  unarchiveProjectRepository,
} from "./project-repository";
import { getMemberRepository } from "../member/member-repository";
import type { z } from "zod";

function getFieldFromZodError(issue: z.ZodIssue): string {
  const field = issue.path[0];
  return typeof field === "string" ? field : String(field);
}

function assertProjectPermission(
  role: string,
  requiredRoles: MemberRole[]
): void {
  if (!requiredRoles.includes(role as MemberRole)) {
    throw new ProjectPermissionError();
  }
}

export async function createProject(data: unknown): Promise<string> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new AuthError();

  const parsed = createProjectSchema.safeParse(data);
  if (!parsed.success) {
    const err = parsed.error.issues[0];
    throw new ProjectValidationError(getFieldFromZodError(err), err.message);
  }

  const member = await getMemberRepository(
    parsed.data.workspaceId,
    session.user.id
  );
  if (!member) throw new ProjectPermissionError();
  assertProjectPermission(member.role, ["owner", "admin"]);

  const { id } = await createProjectRepository({
    name: parsed.data.name,
    description: parsed.data.description,
    workspaceId: parsed.data.workspaceId,
    color: parsed.data.color,
  });

  return id;
}

export async function updateProject(data: unknown): Promise<void> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new AuthError();

  const parsed = updateProjectSchema.safeParse(data);
  if (!parsed.success) {
    const err = parsed.error.issues[0];
    throw new ProjectValidationError(getFieldFromZodError(err), err.message);
  }

  const project = await getProjectByIdRepository(parsed.data.id);
  if (!project) throw new ProjectNotFoundError();

  const member = await getMemberRepository(
    project.workspaceId,
    session.user.id
  );
  if (!member) throw new ProjectPermissionError();
  assertProjectPermission(member.role, ["owner", "admin"]);

  await updateProjectRepository(parsed.data.id, {
    name: parsed.data.name,
    description: parsed.data.description,
    color: parsed.data.color,
  });
}

export async function deleteProject(data: unknown): Promise<string> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new AuthError();

  const parsed = deleteProjectSchema.safeParse(data);
  if (!parsed.success) {
    const err = parsed.error.issues[0];
    throw new ProjectValidationError(getFieldFromZodError(err), err.message);
  }

  const project = await getProjectByIdRepository(parsed.data.id);
  if (!project) throw new ProjectNotFoundError();

  const member = await getMemberRepository(
    project.workspaceId,
    session.user.id
  );
  if (!member) throw new ProjectPermissionError();
  assertProjectPermission(member.role, ["owner", "admin"]);

  if (parsed.data.confirmName !== project.name) {
    throw new ProjectValidationError(
      "confirmName",
      "Le nom ne correspond pas"
    );
  }

  const workspaceId = project.workspaceId;
  await deleteProjectRepository(parsed.data.id);

  return workspaceId;
}

export async function archiveProject(data: unknown): Promise<void> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new AuthError();

  const parsed = archiveProjectSchema.safeParse(data);
  if (!parsed.success) {
    const err = parsed.error.issues[0];
    throw new ProjectValidationError(getFieldFromZodError(err), err.message);
  }

  const project = await getProjectByIdRepository(parsed.data.id);
  if (!project) throw new ProjectNotFoundError();

  const member = await getMemberRepository(
    project.workspaceId,
    session.user.id
  );
  if (!member) throw new ProjectPermissionError();
  assertProjectPermission(member.role, ["owner", "admin"]);

  await archiveProjectRepository(parsed.data.id);
}

export async function unarchiveProject(data: unknown): Promise<void> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new AuthError();

  const parsed = archiveProjectSchema.safeParse(data);
  if (!parsed.success) {
    const err = parsed.error.issues[0];
    throw new ProjectValidationError(getFieldFromZodError(err), err.message);
  }

  const project = await getProjectByIdRepository(parsed.data.id);
  if (!project) throw new ProjectNotFoundError();

  const member = await getMemberRepository(
    project.workspaceId,
    session.user.id
  );
  if (!member) throw new ProjectPermissionError();
  assertProjectPermission(member.role, ["owner", "admin"]);

  await unarchiveProjectRepository(parsed.data.id);
}
