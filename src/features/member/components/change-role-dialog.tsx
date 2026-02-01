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
import { changeMemberRoleAction } from "../member-actions";
import { toast } from "sonner";
import type { MemberWithUser } from "../member-types";

type ChangeRoleDialogProps = {
  workspaceId: string;
  member: MemberWithUser;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function ChangeRoleDialog({
  workspaceId,
  member,
  open,
  onOpenChange,
}: ChangeRoleDialogProps) {
  const [role, setRole] = useState(member.role);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (role === member.role) {
      onOpenChange(false);
      return;
    }

    setIsSubmitting(true);

    const result = await changeMemberRoleAction({
      workspaceId,
      userId: member.userId,
      role,
    });

    if ("error" in result) {
      toast.error(result.error.message);
      setIsSubmitting(false);
      return;
    }

    toast.success("Rôle modifié avec succès");
    onOpenChange(false);
    setIsSubmitting(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Modifier le rôle</DialogTitle>
          <DialogDescription>
            Modifier le rôle de {member.user.name} dans ce workspace.
          </DialogDescription>
        </DialogHeader>

        <Field className="gap-1">
          <FieldLabel htmlFor="change-role">Nouveau rôle</FieldLabel>
          <Select value={role} onValueChange={setRole}>
            <SelectTrigger id="change-role">
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
