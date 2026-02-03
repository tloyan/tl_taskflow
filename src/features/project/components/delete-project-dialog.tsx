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
import { deleteProjectAction } from "../project-actions";
import { toast } from "sonner";
import type { Project } from "../project-types";

type DeleteProjectDialogProps = {
  project: Project;
  workspaceSlug: string;
};

export default function DeleteProjectDialog({
  project,
  workspaceSlug,
}: DeleteProjectDialogProps) {
  const [confirmName, setConfirmName] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [open, setOpen] = useState(false);

  const isConfirmed = confirmName === project.name;

  const handleDelete = async () => {
    if (!isConfirmed) return;

    setIsDeleting(true);
    const result = await deleteProjectAction(
      { id: project.id, confirmName },
      workspaceSlug
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
        <Button variant="destructive">Supprimer ce projet</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Supprimer ce projet ?</AlertDialogTitle>
          <AlertDialogDescription>
            Cette action est irréversible. Toutes les tâches seront
            définitivement supprimées.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <Field className="gap-1">
          <FieldLabel htmlFor="confirmName">
            Tapez <span className="font-semibold">{project.name}</span> pour
            confirmer
          </FieldLabel>
          <Input
            id="confirmName"
            value={confirmName}
            onChange={(e) => setConfirmName(e.target.value)}
            placeholder={project.name}
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
