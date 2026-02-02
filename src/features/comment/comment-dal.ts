import { notFound, redirect } from "next/navigation";
import { cache } from "react";
import "server-only";
import { getCurrentUserDal } from "../auth/auth-dal";
import { getCommentsByTaskIdRepository } from "./comment-repository";
import { getTaskByIdRepository } from "../task/task-repository";
import { getProjectByIdRepository } from "../project/project-repository";
import { getMemberRepository } from "../member/member-repository";
import type { CommentWithAuthor } from "./comment-types";

export const getCommentsByTaskIdDal = cache(
  async (taskId: string): Promise<CommentWithAuthor[]> => {
    const user = await getCurrentUserDal();

    if (!user) {
      redirect("/login");
    }

    const task = await getTaskByIdRepository(taskId);
    if (!task) {
      notFound();
    }

    const project = await getProjectByIdRepository(task.projectId);
    if (!project) {
      notFound();
    }

    const member = await getMemberRepository(project.workspaceId, user.id);
    if (!member) {
      notFound();
    }

    return await getCommentsByTaskIdRepository(taskId);
  }
);
