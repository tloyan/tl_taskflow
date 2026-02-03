"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { AuthError } from "../auth/auth-errors";
import {
  WorkspaceNotFoundError,
  WorkspacePermissionError,
  WorkspaceValidationError,
} from "./workspace-errors";
import {
  createWorkspace,
  deleteWorkspace,
  updateWorkspace,
} from "./workspace-service";
import { getWorkspaceBySlugRepository } from "./workspace-repository";
import type {
  CreateWorkspaceInput,
  UpdateWorkspaceInput,
  DeleteWorkspaceInput,
  CreateWorkspaceActionResult,
  UpdateWorkspaceActionResult,
  DeleteWorkspaceActionResult,
  ActionResultError,
} from "./workspace-types";

function handleError(err: unknown): ActionResultError {
  if (err instanceof AuthError) {
    return {
      error: { code: "AUTHENTICATION_ERROR", message: err.message },
    };
  }
  if (err instanceof WorkspaceValidationError) {
    return {
      error: {
        code: "VALIDATION_ERROR",
        field: err.field,
        message: err.message,
      },
    };
  }
  if (err instanceof WorkspaceNotFoundError) {
    return {
      error: { code: "NOT_FOUND", message: err.message },
    };
  }
  if (err instanceof WorkspacePermissionError) {
    return {
      error: { code: "PERMISSION_ERROR", message: err.message },
    };
  }
  return {
    error: { code: "UNKNOWN_ERROR", message: "Une erreur est survenue" },
  };
}

export async function createWorkspaceAction(
  data: CreateWorkspaceInput
): Promise<CreateWorkspaceActionResult> {
  let slug: string;

  try {
    slug = await createWorkspace(data);
  } catch (err) {
    return handleError(err);
  }

  revalidatePath("/", "layout");
  redirect(`/w/${slug}`);
}

export async function updateWorkspaceAction(
  data: UpdateWorkspaceInput
): Promise<UpdateWorkspaceActionResult> {
  let slug: string;

  try {
    slug = await updateWorkspace(data);
  } catch (err) {
    return handleError(err);
  }

  revalidatePath("/", "layout");
  return { success: true, slug };
}

export async function deleteWorkspaceAction(
  data: DeleteWorkspaceInput
): Promise<DeleteWorkspaceActionResult> {
  try {
    await deleteWorkspace(data);
  } catch (err) {
    return handleError(err);
  }

  revalidatePath("/", "layout");
  redirect("/");
}

export async function checkSlugAvailability(
  slug: string
): Promise<{ available: boolean; suggestion: string }> {
  // Validate slug format
  if (!slug || slug.length < 3 || !/^[a-z0-9-]+$/.test(slug)) {
    return { available: false, suggestion: slug };
  }

  const existing = await getWorkspaceBySlugRepository(slug);

  if (!existing) {
    return { available: true, suggestion: slug };
  }

  const randomSuffix = Math.floor(Math.random() * 9000) + 1000;
  const suggestion = `${slug}-${randomSuffix}`;

  return { available: false, suggestion };
}
