"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { changeInvitationRoleAction } from "../member-actions";
import { toast } from "sonner";
import type { InvitationWithInviter } from "../member-types";

type ChangeInvitationRoleDialogProps = {
  workspaceId: string;
  invitation: InvitationWithInviter;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function ChangeInvitationRoleDialog({
  workspaceId,
  invitation,
  open,
  onOpenChange,
}: ChangeInvitationRoleDialogProps) {
  const [role, setRole] = useState(invitation.role);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (role === invitation.role) {
      onOpenChange(false);
      return;
    }

    setIsSubmitting(true);

    const result = await changeInvitationRoleAction({
      workspaceId,
      invitationId: invitation.id,
      role,
    });

    if ("error" in result) {
      toast.error(result.error.message);
      setIsSubmitting(false);
      return;
    }

    toast.success("Rôle de l'invitation modifié");
    onOpenChange(false);
    setIsSubmitting(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Modifier le rôle</DialogTitle>
          <DialogDescription>
            Modifier le rôle attribué à {invitation.email} lors de son
            acceptation.
          </DialogDescription>
        </DialogHeader>

        <Field className="gap-1">
          <FieldLabel htmlFor="change-invitation-role">Nouveau rôle</FieldLabel>
          <Select value={role} onValueChange={setRole}>
            <SelectTrigger id="change-invitation-role">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="admin">Administrateur</SelectItem>
              <SelectItem value="member">Membre</SelectItem>
              <SelectItem value="viewer">Observateur</SelectItem>
            </SelectContent>
          </Select>
        </Field>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Modification..." : "Confirmer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
