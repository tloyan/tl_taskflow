import { notFound, redirect } from "next/navigation";
import { cache } from "react";
import "server-only";
import { getCurrentUserDal } from "../auth/auth-dal";
import { getWorkspaceBySlugRepository } from "../workspace/workspace-repository";
import {
  getMembersByWorkspaceIdRepository,
  getMemberRepository,
} from "./member-repository";
import { getPendingInvitationsByWorkspaceIdRepository } from "./invitation-repository";
import type { MemberWithUser, InvitationWithInviter } from "./member-types";

export const getWorkspaceMembersDal = cache(
  async (slug: string): Promise<MemberWithUser[]> => {
    const user = await getCurrentUserDal();

    if (!user) {
      redirect("/login");
    }

    const workspace = await getWorkspaceBySlugRepository(slug);
    if (!workspace) {
      notFound();
    }

    const currentMember = await getMemberRepository(workspace.id, user.id);
    if (!currentMember) {
      notFound();
    }

    return await getMembersByWorkspaceIdRepository(workspace.id);
  }
);

export const getCurrentMemberDal = cache(
  async (slug: string): Promise<MemberWithUser | null> => {
    const user = await getCurrentUserDal();

    if (!user) {
      redirect("/login");
    }

    const workspace = await getWorkspaceBySlugRepository(slug);
    if (!workspace) {
      notFound();
    }

    const member = await getMemberRepository(workspace.id, user.id);
    return member ?? null;
  }
);

export const getWorkspaceInvitationsDal = cache(
  async (slug: string): Promise<InvitationWithInviter[]> => {
    const user = await getCurrentUserDal();

    if (!user) {
      redirect("/login");
    }

    const workspace = await getWorkspaceBySlugRepository(slug);
    if (!workspace) {
      notFound();
    }

    const currentMember = await getMemberRepository(workspace.id, user.id);
    if (!currentMember) {
      return [];
    }

    // Only owner/admin can see pending invitations
    if (currentMember.role !== "owner" && currentMember.role !== "admin") {
      return [];
    }

    return await getPendingInvitationsByWorkspaceIdRepository(workspace.id);
  }
);
