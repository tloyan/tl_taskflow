"use client";

import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  createWorkspaceAction,
  checkSlugAvailability,
} from "../workspace-actions";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createWorkspaceSchema, generateSlug } from "../workspace-validation";
import { z } from "zod";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import useDebouncePending from "@/hooks/use-debounce";
import type { SlugAvailabilityStatus } from "../workspace-types";

type FormValues = z.input<typeof createWorkspaceSchema>;
type FormField = keyof FormValues;

const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL || "https://taskflow.tloyan.com";

export default function CreateWorkspaceForm() {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(createWorkspaceSchema),
    mode: "onTouched",
    defaultValues: {
      name: "",
      description: "",
      slug: "",
    },
  });

  // Track if user has focused on slug field (manual edit intent)
  const [slugTouched, setSlugTouched] = useState(false);

  const slug = watch("slug");
  const [debouncedSlug, isDebouncing] = useDebouncePending(slug, 300);

  const [slugStatus, setSlugStatus] =
    useState<SlugAvailabilityStatus>({ available: null });

  const [isChecking, setIsChecking] = useState(false);
  const requestIdRef = useRef(0);

  useEffect(() => {
    // While typing/debouncing, show checking state
    if (isDebouncing) {
      setIsChecking(true);
      setSlugStatus((s) => (s.available === null ? s : { available: null }));
      return;
    }
  }, [isDebouncing]);

  useEffect(() => {
    const current = ++requestIdRef.current;

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
  }, [debouncedSlug]);

  // Generate slug from name when user hasn't manually edited the slug field
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    if (!slugTouched) {
      const generatedSlug = generateSlug(newName);
      setValue("slug", generatedSlug, { shouldValidate: true });
    }
  };

  const onSubmit = async (data: FormValues) => {
    const result = await createWorkspaceAction(data);

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
      <Field className="gap-1" data-invalid={!!errors.name}>
        <FieldLabel htmlFor="name">Nom*</FieldLabel>
        <Input
          id="name"
          autoComplete="off"
          placeholder="Evil Rabbit"
          {...register("name", { onChange: handleNameChange })}
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
            onFocus={() => setSlugTouched(true)}
          />
        </div>
        {errors.slug && <FieldError>{errors.slug.message}</FieldError>}
        {isChecking ? (
          <p className="text-muted-foreground text-sm">Vérification...</p>
        ) : slugStatus.available === true ? (
          <p className="text-sm text-green-600">Slug disponible</p>
        ) : slugStatus.available === false ? (
          <p className="text-sm text-red-600">Slug non disponible</p>
        ) : null}
      </Field>

      <Button
        type="submit"
        disabled={isSubmitting || isChecking || !slugStatus.available}
      >
        {isSubmitting ? "Création..." : "Créer Workspace"}
      </Button>
    </form>
  );
}
