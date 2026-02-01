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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { leaveWorkspaceAction } from "../member-actions";
import { toast } from "sonner";
import { LogOutIcon } from "lucide-react";

type LeaveWorkspaceDialogProps = {
  workspaceId: string;
};

export default function LeaveWorkspaceDialog({
  workspaceId,
}: LeaveWorkspaceDialogProps) {
  const [isLeaving, setIsLeaving] = useState(false);

  const handleLeave = async () => {
    setIsLeaving(true);

    const result = await leaveWorkspaceAction(workspaceId);

    if (result?.error) {
      toast.error(result.error.message);
      setIsLeaving(false);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline" size="sm">
          <LogOutIcon className="size-4" />
          Quitter le workspace
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Quitter ce workspace ?</AlertDialogTitle>
          <AlertDialogDescription>
            Vous perdrez l&apos;accès à ce workspace et à tous ses projets. Un
            administrateur pourra vous réinviter ultérieurement.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Annuler</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleLeave}
            disabled={isLeaving}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isLeaving ? "Départ..." : "Quitter"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
