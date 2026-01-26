import { notFound, redirect } from "next/navigation";
import { cache } from "react";
import "server-only";
import { getCurrentUserDal } from "../auth/auth-dal";
import {
  getWorkspaceBySlugRepository,
  getWorkspacesByOwnerIdRepository,
} from "./workspace-repository";
import { Workspace, WorkspaceWithCounts } from "./workspace-types";

export const getAllWorkspacesWithCountsDal = cache(
  async (): Promise<WorkspaceWithCounts[]> => {
    const user = await getCurrentUserDal();

    if (!user) {
      redirect("/login");
    }

    const workspaces = await getWorkspacesByOwnerIdRepository(user.id);

    // TODO: Add actual counts when members and projects tables are implemented
    return workspaces.map((workspace) => ({
      ...workspace,
      projectsCount: 0,
      membersCount: 1, // Owner is always a member
    }));
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

    // Verify user has access to this workspace (owner check for now)
    if (workspace.ownerId !== user.id) {
      notFound();
    }

    return workspace;
  }
);
