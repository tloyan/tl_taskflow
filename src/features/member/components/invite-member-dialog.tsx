"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { inviteMemberAction } from "../member-actions";
import { toast } from "sonner";
import { PlusIcon } from "lucide-react";

type InviteMemberDialogProps = {
  workspaceId: string;
};

export default function InviteMemberDialog({
  workspaceId,
}: InviteMemberDialogProps) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("member");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldError, setFieldError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFieldError(null);

    const result = await inviteMemberAction({ workspaceId, email, role });

    if ("error" in result) {
      if (result.error.code === "VALIDATION_ERROR" && "field" in result.error) {
        setFieldError(result.error.message);
      } else {
        toast.error(result.error.message);
      }
      setIsSubmitting(false);
      return;
    }

    toast.success("Invitation envoyée avec succès");
    setOpen(false);
    setEmail("");
    setRole("member");
    setIsSubmitting(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <PlusIcon className="size-4" />
          Inviter un membre
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Inviter un membre</DialogTitle>
          <DialogDescription>
            Ajoutez un membre à ce workspace en entrant son adresse email.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-4">
          <Field className="gap-1">
            <FieldLabel htmlFor="email">Email</FieldLabel>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setFieldError(null);
              }}
              placeholder="membre@exemple.com"
              required
            />
            {fieldError && (
              <p className="text-destructive text-sm">{fieldError}</p>
            )}
          </Field>

          <Field className="gap-1">
            <FieldLabel htmlFor="role">Rôle</FieldLabel>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger id="role">
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
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={isSubmitting || !email}>
              {isSubmitting ? "Invitation..." : "Inviter"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
