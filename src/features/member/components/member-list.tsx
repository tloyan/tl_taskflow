"use client";

import type {
  InvitationWithInviter,
  MemberRole,
  MemberWithUser,
} from "../member-types";
import MemberRow from "./member-row";
import InvitationRow from "./invitation-row";

type MemberListProps = {
  members: MemberWithUser[];
  pendingInvitations: InvitationWithInviter[];
  currentMemberRole: MemberRole;
  workspaceId: string;
};

export default function MemberList({
  members,
  pendingInvitations,
  currentMemberRole,
  workspaceId,
}: MemberListProps) {
  const roleOrder: Record<string, number> = {
    owner: 0,
    admin: 1,
    member: 2,
    viewer: 3,
  };

  const sorted = [...members].sort(
    (a, b) => (roleOrder[a.role] ?? 4) - (roleOrder[b.role] ?? 4)
  );

  return (
    <div className="grid gap-2">
      {sorted.map((member) => (
        <MemberRow
          key={member.userId}
          member={member}
          currentMemberRole={currentMemberRole}
          workspaceId={workspaceId}
        />
      ))}

      {pendingInvitations.length > 0 && (
        <>
          <p className="text-muted-foreground mt-4 mb-1 text-xs font-medium uppercase tracking-wide">
            Invitations en attente
          </p>
          {pendingInvitations.map((invitation) => (
            <InvitationRow
              key={invitation.id}
              invitation={invitation}
              currentMemberRole={currentMemberRole}
              workspaceId={workspaceId}
            />
          ))}
        </>
      )}
    </div>
  );
}
