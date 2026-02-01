import { notFound, redirect } from "next/navigation";
import { cache } from "react";
import "server-only";
import { getCurrentUserDal } from "../auth/auth-dal";
import {
  getWorkspaceBySlugRepository,
  getWorkspacesWithCountsByUserIdRepository,
} from "./workspace-repository";
import { getMemberRepository } from "../member/member-repository";
import { Workspace, WorkspaceWithCounts } from "./workspace-types";

export const getAllWorkspacesWithCountsDal = cache(
  async (): Promise<WorkspaceWithCounts[]> => {
    const user = await getCurrentUserDal();

    if (!user) {
      redirect("/login");
    }

    const rows = await getWorkspacesWithCountsByUserIdRepository(user.id);
    return rows.map((row) => ({ ...row, projectsCount: 0 }));
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
