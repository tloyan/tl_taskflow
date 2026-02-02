import { notFound, redirect } from "next/navigation";
import { cache } from "react";
import "server-only";
import { getCurrentUserDal } from "../auth/auth-dal";
import {
  getTasksByProjectIdRepository,
  getTaskWithAssigneeByIdRepository,
} from "./task-repository";
import { getProjectByIdRepository } from "../project/project-repository";
import { getMemberRepository } from "../member/member-repository";
import type { TaskWithAssignee } from "./task-types";

export const getTasksByProjectIdDal = cache(
  async (projectId: string): Promise<TaskWithAssignee[]> => {
    const user = await getCurrentUserDal();

    if (!user) {
      redirect("/login");
    }

    const project = await getProjectByIdRepository(projectId);
    if (!project) {
      notFound();
    }

    const member = await getMemberRepository(project.workspaceId, user.id);
    if (!member) {
      notFound();
    }

    return await getTasksByProjectIdRepository(projectId);
  }
);

export const getTaskByIdDal = cache(
  async (taskId: string): Promise<TaskWithAssignee> => {
    const user = await getCurrentUserDal();

    if (!user) {
      redirect("/login");
    }

    const task = await getTaskWithAssigneeByIdRepository(taskId);
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

    return task;
  }
);
