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
import { cancelInvitationAction } from "../member-actions";
import { toast } from "sonner";
import type { InvitationWithInviter } from "../member-types";

type CancelInvitationDialogProps = {
  workspaceId: string;
  invitation: InvitationWithInviter;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function CancelInvitationDialog({
  workspaceId,
  invitation,
  open,
  onOpenChange,
}: CancelInvitationDialogProps) {
  const [isCancelling, setIsCancelling] = useState(false);

  const handleCancel = async () => {
    setIsCancelling(true);

    const result = await cancelInvitationAction({
      workspaceId,
      invitationId: invitation.id,
    });

    if ("error" in result) {
      toast.error(result.error.message);
      setIsCancelling(false);
      return;
    }

    toast.success("Invitation annulée");
    onOpenChange(false);
    setIsCancelling(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Annuler cette invitation ?</AlertDialogTitle>
          <AlertDialogDescription>
            L&apos;invitation envoyée à {invitation.email} sera annulée. Le lien
            d&apos;invitation ne sera plus valide.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Fermer</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleCancel}
            disabled={isCancelling}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isCancelling ? "Annulation..." : "Annuler l'invitation"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
