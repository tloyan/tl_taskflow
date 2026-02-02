import { notFound, redirect } from "next/navigation";
import { cache } from "react";
import "server-only";
import { getCurrentUserDal } from "../auth/auth-dal";
import {
  getProjectsByWorkspaceIdRepository,
  getProjectByIdRepository,
  getAllProjectsByUserIdRepository,
} from "./project-repository";
import { getMemberRepository } from "../member/member-repository";
import type { Project } from "./project-types";

export const getAllProjectsDal = cache(
  async (): Promise<Project[]> => {
    const user = await getCurrentUserDal();

    if (!user) {
      redirect("/login");
    }

    return await getAllProjectsByUserIdRepository(user.id);
  }
);

export const getProjectsByWorkspaceIdDal = cache(
  async (workspaceId: string): Promise<Project[]> => {
    const user = await getCurrentUserDal();

    if (!user) {
      redirect("/login");
    }

    const member = await getMemberRepository(workspaceId, user.id);
    if (!member) {
      notFound();
    }

    return await getProjectsByWorkspaceIdRepository(workspaceId);
  }
);

export const getProjectByIdDal = cache(
  async (projectId: string): Promise<Project> => {
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

    return project;
  }
);
