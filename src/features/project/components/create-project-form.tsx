"use client";

import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createProjectAction } from "../project-actions";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createProjectSchema } from "../project-validation";
import { z } from "zod";
import { toast } from "sonner";
import ProjectColorPicker from "./project-color-picker";

type FormValues = z.input<typeof createProjectSchema>;
type FormField = keyof FormValues;

type CreateProjectFormProps = {
  workspaceId: string;
  workspaceSlug: string;
};

export default function CreateProjectForm({
  workspaceId,
  workspaceSlug,
}: CreateProjectFormProps) {
  const {
    register,
    handleSubmit,
    control,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(createProjectSchema),
    mode: "onTouched",
    defaultValues: {
      workspaceId,
      name: "",
      description: "",
      color: "#6a7282",
    },
  });

  const onSubmit = async (data: FormValues) => {
    const result = await createProjectAction(data, workspaceSlug);

    if (result?.error) {
      if ("field" in result.error) {
        const field = result.error.field as FormField;
        setError(field, { message: result.error.message });
      } else {
        toast.error(result.error.message);
      }
    }
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
      <input type="hidden" {...register("workspaceId")} />

      <Field className="gap-1" data-invalid={!!errors.name}>
        <FieldLabel htmlFor="name">Nom du projet*</FieldLabel>
        <Input
          id="name"
          autoComplete="off"
          placeholder="Website Redesign"
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

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Création..." : "Créer le projet"}
      </Button>
    </form>
  );
}
