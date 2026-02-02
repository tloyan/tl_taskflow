"use client";

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
import { deleteCommentAction } from "../comment-actions";
import { toast } from "sonner";
import { useState } from "react";

type DeleteCommentDialogProps = {
  commentId: string;
  pathToRevalidate: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function DeleteCommentDialog({
  commentId,
  pathToRevalidate,
  open,
  onOpenChange,
}: DeleteCommentDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    const result = await deleteCommentAction(
      { id: commentId },
      pathToRevalidate
    );

    if ("error" in result) {
      toast.error(result.error.message);
      setIsDeleting(false);
      return;
    }

    toast.success("Commentaire supprimé");
    onOpenChange(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Supprimer le commentaire</AlertDialogTitle>
          <AlertDialogDescription>
            Êtes-vous sûr de vouloir supprimer ce commentaire ? Cette action est
            irréversible.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Annuler</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-destructive text-white hover:bg-destructive/90"
          >
            {isDeleting ? "Suppression..." : "Supprimer"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
