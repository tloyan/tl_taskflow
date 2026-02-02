import "server-only";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { AuthError } from "../auth/auth-errors";
import type { MemberRole } from "../member/member-types";
import { createCommentSchema, deleteCommentSchema } from "./comment-validation";
import {
  CommentValidationError,
  CommentNotFoundError,
  CommentPermissionError,
} from "./comment-errors";
import {
  createCommentRepository,
  getCommentByIdRepository,
  deleteCommentRepository,
} from "./comment-repository";
import { getTaskByIdRepository } from "../task/task-repository";
import { getProjectByIdRepository } from "../project/project-repository";
import { getMemberRepository } from "../member/member-repository";
import type { z } from "zod";

function getFieldFromZodError(issue: z.ZodIssue): string {
  const field = issue.path[0];
  return typeof field === "string" ? field : String(field);
}

export async function createComment(data: unknown): Promise<string> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new AuthError();

  const parsed = createCommentSchema.safeParse(data);
  if (!parsed.success) {
    const err = parsed.error.issues[0];
    throw new CommentValidationError(getFieldFromZodError(err), err.message);
  }

  const task = await getTaskByIdRepository(parsed.data.taskId);
  if (!task) throw new CommentNotFoundError("Tâche introuvable");

  const project = await getProjectByIdRepository(task.projectId);
  if (!project) throw new CommentNotFoundError("Projet introuvable");

  const member = await getMemberRepository(
    project.workspaceId,
    session.user.id
  );
  if (!member) throw new CommentPermissionError();

  const requiredRoles: MemberRole[] = ["owner", "admin", "member"];
  if (!requiredRoles.includes(member.role as MemberRole)) {
    throw new CommentPermissionError();
  }

  const { id } = await createCommentRepository({
    content: parsed.data.content,
    taskId: parsed.data.taskId,
    authorId: session.user.id,
  });

  return id;
}

export async function deleteComment(data: unknown): Promise<void> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new AuthError();

  const parsed = deleteCommentSchema.safeParse(data);
  if (!parsed.success) {
    const err = parsed.error.issues[0];
    throw new CommentValidationError(getFieldFromZodError(err), err.message);
  }

  const comment = await getCommentByIdRepository(parsed.data.id);
  if (!comment) throw new CommentNotFoundError();

  const task = await getTaskByIdRepository(comment.taskId);
  if (!task) throw new CommentNotFoundError("Tâche introuvable");

  const project = await getProjectByIdRepository(task.projectId);
  if (!project) throw new CommentNotFoundError("Projet introuvable");

  const member = await getMemberRepository(
    project.workspaceId,
    session.user.id
  );
  if (!member) throw new CommentPermissionError();

  // Author can delete own comment, owner/admin can delete any
  if (
    comment.authorId !== session.user.id &&
    member.role !== "owner" &&
    member.role !== "admin"
  ) {
    throw new CommentPermissionError();
  }

  await deleteCommentRepository(parsed.data.id);
}
