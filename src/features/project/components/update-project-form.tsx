"use client";

import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { updateProjectAction } from "../project-actions";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { updateProjectSchema } from "../project-validation";
import { z } from "zod";
import { toast } from "sonner";
import type { Project } from "../project-types";
import ProjectColorPicker from "./project-color-picker";

type FormValues = z.input<typeof updateProjectSchema>;
type FormField = keyof FormValues;

type UpdateProjectFormProps = {
  project: Project;
};

export default function UpdateProjectForm({ project }: UpdateProjectFormProps) {
  const {
    register,
    handleSubmit,
    control,
    setError,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<FormValues>({
    resolver: zodResolver(updateProjectSchema),
    mode: "onTouched",
    defaultValues: {
      id: project.id,
      name: project.name,
      description: project.description ?? "",
      color: project.color,
    },
  });

  const onSubmit = async (data: FormValues) => {
    const result = await updateProjectAction(data);

    if ("error" in result) {
      if ("field" in result.error) {
        const field = result.error.field as FormField;
        setError(field, { message: result.error.message });
      } else {
        toast.error(result.error.message);
      }
      return;
    }

    toast.success("Projet mis à jour");
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
      <input type="hidden" {...register("id")} />

      <Field className="gap-1" data-invalid={!!errors.name}>
        <FieldLabel htmlFor="name">Nom du projet*</FieldLabel>
        <Input
          id="name"
          autoComplete="off"
          placeholder="Mon projet"
          {...register("name")}
        />
        {errors.name && <FieldError>{errors.name.message}</FieldError>}
      </Field>

      <Field className="gap-1">
        <FieldLabel htmlFor="description">Description</FieldLabel>
        <Textarea
          id="description"
          placeholder="Décrivez votre projet..."
          {...register("description")}
        />
        {errors.description && (
          <FieldError>{errors.description.message}</FieldError>
        )}
      </Field>

      <Field className="gap-1">
        <FieldLabel>Couleur</FieldLabel>
        <Controller
          name="color"
          control={control}
          render={({ field }) => (
            <ProjectColorPicker
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              name={field.name}
            />
          )}
        />
      </Field>

      <Button type="submit" disabled={isSubmitting || !isDirty}>
        {isSubmitting ? "Enregistrement..." : "Enregistrer"}
      </Button>
    </form>
  );
}
