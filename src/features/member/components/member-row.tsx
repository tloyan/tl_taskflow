"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontalIcon, PenIcon, TrashIcon } from "lucide-react";
import RoleBadge from "./role-badge";
import ChangeRoleDialog from "./change-role-dialog";
import RemoveMemberDialog from "./remove-member-dialog";
import type { MemberRole, MemberWithUser } from "../member-types";

type MemberRowProps = {
  member: MemberWithUser;
  currentMemberRole: MemberRole;
  workspaceId: string;
};

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export default function MemberRow({
  member,
  currentMemberRole,
  workspaceId,
}: MemberRowProps) {
  const [changeRoleOpen, setChangeRoleOpen] = useState(false);
  const [removeOpen, setRemoveOpen] = useState(false);

  const canManage =
    (currentMemberRole === "owner" || currentMemberRole === "admin") &&
    member.role !== "owner";

  return (
    <>
      <div className="flex items-center justify-between gap-4 rounded-lg border p-4">
        <div className="flex items-center gap-3">
          <Avatar>
            {member.user.image && (
              <AvatarImage
                src={member.user.image}
                alt={member.user.name}
              />
            )}
            <AvatarFallback>{getInitials(member.user.name)}</AvatarFallback>
          </Avatar>
          <div className="grid gap-0.5">
            <p className="text-sm font-medium">{member.user.name}</p>
            <p className="text-muted-foreground text-xs">
              {member.user.email}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <RoleBadge role={member.role} />

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
                  onClick={() => setRemoveOpen(true)}
                  className="text-destructive"
                >
                  <TrashIcon className="size-4" />
                  Retirer du workspace
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      {canManage && (
        <>
          <ChangeRoleDialog
            workspaceId={workspaceId}
            member={member}
            open={changeRoleOpen}
            onOpenChange={setChangeRoleOpen}
          />
          <RemoveMemberDialog
            workspaceId={workspaceId}
            member={member}
            open={removeOpen}
            onOpenChange={setRemoveOpen}
          />
        </>
      )}
    </>
  );
}
