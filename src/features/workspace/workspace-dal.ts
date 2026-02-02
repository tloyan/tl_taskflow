import { notFound, redirect } from "next/navigation";
import { cache } from "react";
import "server-only";
import { getCurrentUserDal } from "../auth/auth-dal";
import {
  getWorkspaceBySlugRepository,
  getWorkspacesWithCountsByUserIdRepository,
} from "./workspace-repository";
import { getMemberRepository } from "../member/member-repository";
import { getProjectsByWorkspaceIdRepository } from "../project/project-repository";
import { Workspace, WorkspaceWithCounts } from "./workspace-types";

export const getAllWorkspacesWithCountsDal = cache(
  async (): Promise<WorkspaceWithCounts[]> => {
    const user = await getCurrentUserDal();

    if (!user) {
      redirect("/login");
    }

    const rows = await getWorkspacesWithCountsByUserIdRepository(user.id);

    const withProjectCounts = await Promise.all(
      rows.map(async (row) => {
        const projects = await getProjectsByWorkspaceIdRepository(row.id);
        const activeProjects = projects.filter((p) => p.status === "active");
        return { ...row, projectsCount: activeProjects.length };
      })
    );

    return withProjectCounts;
  }
);

export const getWorkspaceBySlugDal = cache(
  async (slug: string): Promise<Workspace> => {
    const user = await getCurrentUserDal();

    if (!user) {
      redirect("/login");
    }

    const workspace = await getWorkspaceBySlugRepository(slug);

    if (!workspace) {
      notFound();
    }

    // Check membership (not just owner)
    const member = await getMemberRepository(workspace.id, user.id);
    if (!member) {
      notFound();
    }

    return workspace;
  }
);
