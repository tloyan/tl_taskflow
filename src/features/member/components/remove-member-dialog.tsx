"use client";

import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { removeMemberAction } from "../member-actions";
import { toast } from "sonner";
import type { MemberWithUser } from "../member-types";

type RemoveMemberDialogProps = {
  workspaceId: string;
  member: MemberWithUser;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function RemoveMemberDialog({
  workspaceId,
  member,
  open,
  onOpenChange,
}: RemoveMemberDialogProps) {
  const [isRemoving, setIsRemoving] = useState(false);

  const handleRemove = async () => {
    setIsRemoving(true);

    const result = await removeMemberAction({
      workspaceId,
      userId: member.userId,
    });

    if ("error" in result) {
      toast.error(result.error.message);
      setIsRemoving(false);
      return;
    }

    toast.success("Membre retiré avec succès");
    onOpenChange(false);
    setIsRemoving(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Retirer ce membre ?</AlertDialogTitle>
          <AlertDialogDescription>
            {member.user.name} sera retiré de ce workspace et perdra tous ses
            accès. Cette action est réversible en le réinvitant.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Annuler</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleRemove}
            disabled={isRemoving}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isRemoving ? "Retrait..." : "Retirer"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
