"use client";

import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  updateWorkspaceAction,
  checkSlugAvailability,
} from "../workspace-actions";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { updateWorkspaceSchema } from "../workspace-validation";
import { z } from "zod";
import { useEffect, useRef, useState } from "react";
import useDebouncePending from "@/hooks/use-debounce";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import type { Workspace, SlugAvailabilityStatus } from "../workspace-types";

type FormValues = z.input<typeof updateWorkspaceSchema>;
type FormField = keyof FormValues;

const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL || "https://taskflow.tloyan.com";

type UpdateWorkspaceFormProps = {
  workspace: Workspace;
};

export default function UpdateWorkspaceForm({
  workspace,
}: UpdateWorkspaceFormProps) {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    watch,
    setError,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<FormValues>({
    resolver: zodResolver(updateWorkspaceSchema),
    mode: "onTouched",
    defaultValues: {
      id: workspace.id,
      name: workspace.name,
      slug: workspace.slug,
      description: workspace.description ?? "",
    },
  });

  const slug = watch("slug");
  const [debouncedSlug, isDebouncing] = useDebouncePending(slug, 300);

  const [slugStatus, setSlugStatus] =
    useState<SlugAvailabilityStatus>({ available: true }); // Initially available since it's the current slug

  const [isChecking, setIsChecking] = useState(false);
  const requestIdRef = useRef(0);

  // While typing/debouncing, show checking state
  useEffect(() => {
    if (isDebouncing) {
      setIsChecking(true);
      setSlugStatus((s) => (s.available === null ? s : { available: null }));
      return;
    }
  }, [isDebouncing]);

  // Check slug availability
  useEffect(() => {
    const current = ++requestIdRef.current;

    // If slug matches current workspace slug, it's available
    if (debouncedSlug === workspace.slug) {
      setIsChecking(false);
      setSlugStatus({ available: true });
      return;
    }

    if (!debouncedSlug || debouncedSlug.length < 3) {
      setIsChecking(false);
      setSlugStatus({ available: null });
      return;
    }

    setIsChecking(true);

    (async () => {
      try {
        const result = await checkSlugAvailability(debouncedSlug);
        // Ignore if a newer request has been made
        if (requestIdRef.current !== current) return;

        setSlugStatus({
          available: result.available,
          suggestion: result.suggestion,
        });
      } finally {
        if (requestIdRef.current === current) {
          setIsChecking(false);
        }
      }
    })();
  }, [debouncedSlug, workspace.slug]);

  const onSubmit = async (data: FormValues) => {
    const result = await updateWorkspaceAction(data);

    if ("error" in result) {
      if ("field" in result.error) {
        const field = result.error.field as FormField;
        setError(field, { message: result.error.message });
      } else {
        toast.error(result.error.message);
      }
      return;
    }

    toast.success("Workspace mis à jour");
    // Redirect to new slug if it changed
    if (result.slug !== workspace.slug) {
      router.replace(`/w/${result.slug}/settings`);
    }
  };

  const isSlugValid = slugStatus.available === true;

  return (
    <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
      <input type="hidden" {...register("id")} />

      <Field className="gap-1" data-invalid={!!errors.name}>
        <FieldLabel htmlFor="name">Nom du workspace*</FieldLabel>
        <Input
          id="name"
          autoComplete="off"
          placeholder="Mon workspace"
          {...register("name")}
        />
        {errors.name && <FieldError>{errors.name.message}</FieldError>}
      </Field>

      <Field className="gap-1">
        <FieldLabel htmlFor="description">Description</FieldLabel>
        <Textarea
          id="description"
          placeholder="Décrivez votre workspace..."
          {...register("description")}
        />
      </Field>

      <Field className="gap-1" data-invalid={!!errors.slug}>
        <FieldLabel htmlFor="slug">Slug*</FieldLabel>
        <div className="flex rounded-md shadow-xs">
          <span className="border-input bg-background text-muted-foreground -z-1 inline-flex items-center rounded-l-md border px-3 text-sm">
            {APP_URL}/w/
          </span>
          <Input
            id="slug"
            type="text"
            placeholder="your-workspace-name"
            className="-ms-px rounded-l-none shadow-none"
            {...register("slug")}
          />
        </div>
        {errors.slug && <FieldError>{errors.slug.message}</FieldError>}
        {isChecking ? (
          <p className="text-muted-foreground text-sm">Vérification...</p>
        ) : slugStatus.available === true ? (
          slug !== workspace.slug && (
            <p className="text-sm text-green-600">Slug disponible</p>
          )
        ) : slugStatus.available === false ? (
          <p className="text-sm text-red-600">Slug non disponible</p>
        ) : null}
      </Field>

      <Button
        type="submit"
        disabled={isSubmitting || !isDirty || isChecking || !isSlugValid}
      >
        {isSubmitting ? "Enregistrement..." : "Enregistrer"}
      </Button>
    </form>
  );
}
