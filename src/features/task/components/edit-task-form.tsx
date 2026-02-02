"use client";

import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { updateTaskSchema } from "../task-validation";
import { updateTaskAction } from "../task-actions";
import { z } from "zod";
import { toast } from "sonner";

type FormValues = z.input<typeof updateTaskSchema>;
type FormField = keyof FormValues;

type EditTaskFormProps = {
  taskId: string;
  defaultValues: {
    title: string;
    description?: string | null;
  };
  pathToRevalidate: string;
  onSaved?: () => void;
};

export default function EditTaskForm({
  taskId,
  defaultValues,
  pathToRevalidate,
  onSaved,
}: EditTaskFormProps) {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<FormValues>({
    resolver: zodResolver(updateTaskSchema),
    mode: "onTouched",
    defaultValues: {
      id: taskId,
      title: defaultValues.title,
      description: defaultValues.description ?? "",
    },
  });

  const onSubmit = async (data: FormValues) => {
    const result = await updateTaskAction(
      {
        id: data.id,
        title: data.title,
        description: data.description,
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

    toast.success("Tâche mise à jour");
    onSaved?.();
  };

  return (
    <form className="space-y-3" onSubmit={handleSubmit(onSubmit)}>
      <input type="hidden" {...register("id")} />

      <Field className="gap-1" data-invalid={!!errors.title}>
        <FieldLabel htmlFor="edit-title">Titre</FieldLabel>
        <Input id="edit-title" autoComplete="off" {...register("title")} />
        {errors.title && <FieldError>{errors.title.message}</FieldError>}
      </Field>

      <Field className="gap-1">
        <FieldLabel htmlFor="edit-description">Description</FieldLabel>
        <Textarea
          id="edit-description"
          placeholder="Décrivez la tâche..."
          {...register("description")}
        />
        {errors.description && (
          <FieldError>{errors.description.message}</FieldError>
        )}
      </Field>

      <Button type="submit" size="sm" disabled={isSubmitting || !isDirty}>
        {isSubmitting ? "Enregistrement..." : "Enregistrer"}
      </Button>
    </form>
  );
}
