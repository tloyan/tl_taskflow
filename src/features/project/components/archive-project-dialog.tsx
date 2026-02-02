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
import {
  archiveProjectAction,
  unarchiveProjectAction,
} from "../project-actions";
import { toast } from "sonner";
import type { Project } from "../project-types";
import { useRouter } from "next/navigation";

type ArchiveProjectDialogProps = {
  project: Project;
};

export default function ArchiveProjectDialog({
  project,
}: ArchiveProjectDialogProps) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [open, setOpen] = useState(false);

  const isArchived = project.status === "archived";

  const handleAction = async () => {
    setIsPending(true);

    const result = isArchived
      ? await unarchiveProjectAction({ id: project.id })
      : await archiveProjectAction({ id: project.id });

    if ("error" in result) {
      toast.error(result.error.message);
      setIsPending(false);
      return;
    }

    toast.success(isArchived ? "Projet restauré" : "Projet archivé");
    setOpen(false);
    setIsPending(false);
    router.refresh();
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="outline">
          {isArchived ? "Restaurer ce projet" : "Archiver ce projet"}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {isArchived ? "Restaurer ce projet ?" : "Archiver ce projet ?"}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {isArchived
              ? "Le projet sera restauré et visible dans la liste des projets."
              : "Le projet sera masqué de la liste mais pourra être restauré ultérieurement."}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel>Annuler</AlertDialogCancel>
          <AlertDialogAction onClick={handleAction} disabled={isPending}>
            {isPending
              ? isArchived
                ? "Restauration..."
                : "Archivage..."
              : isArchived
                ? "Restaurer"
                : "Archiver"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
