import {
  getWorkspaceMembersDal,
  getCurrentMemberDal,
  getWorkspaceInvitationsDal,
} from "@/features/member/member-dal";
import { getWorkspaceBySlugDal } from "@/features/workspace/workspace-dal";
import MemberList from "@/features/member/components/member-list";
import InviteMemberDialog from "@/features/member/components/invite-member-dialog";
import LeaveWorkspaceDialog from "@/features/member/components/leave-workspace-dialog";
import type { MemberRole } from "@/features/member/member-types";
import { notFound } from "next/navigation";

export default async function MembersPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const workspace = await getWorkspaceBySlugDal(slug);
  const [members, currentMember, pendingInvitations] = await Promise.all([
    getWorkspaceMembersDal(slug),
    getCurrentMemberDal(slug),
    getWorkspaceInvitationsDal(slug),
  ]);

  if (!currentMember) {
    notFound();
  }

  const currentRole = currentMember.role as MemberRole;
  const canInvite = currentRole === "owner" || currentRole === "admin";
  const canLeave = currentRole !== "owner";

  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Membres</h1>
          <p className="text-muted-foreground text-sm">
            Gérez les membres de ce workspace.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {canLeave && <LeaveWorkspaceDialog workspaceId={workspace.id} />}
          {canInvite && <InviteMemberDialog workspaceId={workspace.id} />}
        </div>
      </div>

      <MemberList
        members={members}
        pendingInvitations={pendingInvitations}
        currentMemberRole={currentRole}
        workspaceId={workspace.id}
      />
    </div>
  );
}
