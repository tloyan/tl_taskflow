"use client";

import { useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontalIcon, PenIcon, XIcon } from "lucide-react";
import RoleBadge from "./role-badge";
import CancelInvitationDialog from "./cancel-invitation-dialog";
import ChangeInvitationRoleDialog from "./change-invitation-role-dialog";
import type { InvitationWithInviter, MemberRole } from "../member-types";

type InvitationRowProps = {
  invitation: InvitationWithInviter;
  currentMemberRole: MemberRole;
  workspaceId: string;
};

function getEmailInitials(email: string): string {
  const local = email.split("@")[0] ?? "";
  return local.slice(0, 2).toUpperCase();
}

export default function InvitationRow({
  invitation,
  currentMemberRole,
  workspaceId,
}: InvitationRowProps) {
  const [cancelOpen, setCancelOpen] = useState(false);
  const [changeRoleOpen, setChangeRoleOpen] = useState(false);

  const canManage =
    currentMemberRole === "owner" || currentMemberRole === "admin";

  return (
    <>
      <div className="flex items-center justify-between gap-4 rounded-lg border border-dashed p-4 opacity-75">
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarFallback>{getEmailInitials(invitation.email)}</AvatarFallback>
          </Avatar>
          <div className="grid gap-0.5">
            <p className="text-sm font-medium">{invitation.email}</p>
            <p className="text-muted-foreground text-xs">
              Invité par {invitation.invitedBy.name}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className="bg-amber-100 text-amber-800 border-amber-200"
          >
            En attente
          </Badge>
          <RoleBadge role={invitation.role} />

          {canManage && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="size-8">
                  <MoreHorizontalIcon className="size-4" />
                  <span className="sr-only">Actions</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setChangeRoleOpen(true)}>
                  <PenIcon className="size-4" />
                  Modifier le rôle
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setCancelOpen(true)}
                  className="text-destructive"
                >
                  <XIcon className="size-4" />
                  Annuler l&apos;invitation
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      {canManage && (
        <>
          <ChangeInvitationRoleDialog
            workspaceId={workspaceId}
            invitation={invitation}
            open={changeRoleOpen}
            onOpenChange={setChangeRoleOpen}
          />
          <CancelInvitationDialog
            workspaceId={workspaceId}
            invitation={invitation}
            open={cancelOpen}
            onOpenChange={setCancelOpen}
          />
        </>
      )}
    </>
  );
}
