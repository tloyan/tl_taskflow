"use client";

import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createTaskSchema } from "../task-validation";
import { createTaskAction } from "../task-actions";
import { TASK_STATUSES, TASK_PRIORITIES, type TaskStatus } from "../task-types";
import type { MemberWithUser } from "@/features/member/member-types";
import { z } from "zod";
import { toast } from "sonner";

type FormValues = z.input<typeof createTaskSchema>;
type FormField = keyof FormValues;

type CreateTaskFormProps = {
  projectId: string;
  pathToRevalidate: string;
  members: MemberWithUser[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultStatus?: TaskStatus;
};

export default function CreateTaskForm({
  projectId,
  pathToRevalidate,
  members,
  open,
  onOpenChange,
  defaultStatus = "backlog",
}: CreateTaskFormProps) {
  const {
    register,
    handleSubmit,
    control,
    setError,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(createTaskSchema),
    mode: "onTouched",
    defaultValues: {
      projectId,
      title: "",
      description: "",
      status: defaultStatus,
      priority: "medium",
      assigneeId: "unassigned",
    },
  });

  useEffect(() => {
    if (open) {
      reset({
        projectId,
        title: "",
        description: "",
        status: defaultStatus,
        priority: "medium",
        assigneeId: "unassigned",
      });
    }
  }, [open, defaultStatus, projectId, reset]);

  const onSubmit = async (data: FormValues) => {
    const result = await createTaskAction(
      {
        ...data,
        assigneeId: data.assigneeId === "unassigned" ? undefined : data.assigneeId || undefined,
        dueDate: data.dueDate ? String(data.dueDate) : undefined,
      },
      pathToRevalidate
    );

    if ("error" in result) {
      if ("field" in result.error) {
        const field = result.error.field as FormField;
        setError(field, { message: result.error.message });
      } else {
        toast.error(result.error.message);
      }
      return;
    }

    reset();
    onOpenChange(false);
    toast.success("Tâche créée");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nouvelle tâche</DialogTitle>
        </DialogHeader>

        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <input type="hidden" {...register("projectId")} />

          <Field className="gap-1" data-invalid={!!errors.title}>
            <FieldLabel htmlFor="title">Titre*</FieldLabel>
            <Input
              id="title"
              autoComplete="off"
              placeholder="Titre de la tâche"
              {...register("title")}
            />
            {errors.title && <FieldError>{errors.title.message}</FieldError>}
          </Field>

          <Field className="gap-1">
            <FieldLabel htmlFor="description">Description</FieldLabel>
            <Textarea
              id="description"
              placeholder="Décrivez la tâche..."
              {...register("description")}
            />
            {errors.description && (
              <FieldError>{errors.description.message}</FieldError>
            )}
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field className="gap-1">
              <FieldLabel>Statut</FieldLabel>
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TASK_STATUSES.map((s) => (
                        <SelectItem key={s.value} value={s.value}>
                          {s.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </Field>

            <Field className="gap-1">
              <FieldLabel>Priorité</FieldLabel>
              <Controller
                name="priority"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TASK_PRIORITIES.map((p) => (
                        <SelectItem key={p.value} value={p.value}>
                          {p.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </Field>
          </div>

          <Field className="gap-1">
            <FieldLabel>Assigné</FieldLabel>
            <Controller
              name="assigneeId"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value || "unassigned"}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Non assigné" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unassigned">Non assigné</SelectItem>
                    {members.map((m) => (
                      <SelectItem key={m.userId} value={m.userId}>
                        {m.user.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </Field>

          <Field className="gap-1">
            <FieldLabel htmlFor="dueDate">Échéance</FieldLabel>
            <Input id="dueDate" type="date" {...register("dueDate")} />
          </Field>

          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Création..." : "Créer la tâche"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
