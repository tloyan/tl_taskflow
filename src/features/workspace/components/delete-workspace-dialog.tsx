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
import { Input } from "@/components/ui/input";
import { Field, FieldLabel } from "@/components/ui/field";
import { deleteWorkspaceAction } from "../workspace-actions";
import { toast } from "sonner";
import { Workspace } from "../workspace-types";

type DeleteWorkspaceDialogProps = {
  workspace: Workspace;
};

export default function DeleteWorkspaceDialog({
  workspace,
}: DeleteWorkspaceDialogProps) {
  const [confirmName, setConfirmName] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [open, setOpen] = useState(false);

  const isConfirmed = confirmName === workspace.name;

  const handleDelete = async () => {
    if (!isConfirmed) return;

    setIsDeleting(true);
    const result = await deleteWorkspaceAction(
      { id: workspace.id, confirmName },
      workspace.name
    );

    if (result?.error) {
      toast.error(result.error.message);
      setIsDeleting(false);
      return;
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="destructive">Supprimer ce workspace</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Supprimer ce workspace ?</AlertDialogTitle>
          <AlertDialogDescription>
            Cette action est irréversible. Tous les projets et tâches seront
            définitivement supprimés.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <Field className="gap-1">
          <FieldLabel htmlFor="confirmName">
            Tapez <span className="font-semibold">{workspace.name}</span> pour
            confirmer
          </FieldLabel>
          <Input
            id="confirmName"
            value={confirmName}
            onChange={(e) => setConfirmName(e.target.value)}
            placeholder={workspace.name}
            autoComplete="off"
          />
        </Field>

        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => setConfirmName("")}>
            Annuler
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={!isConfirmed || isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? "Suppression..." : "Supprimer"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
