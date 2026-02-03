"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { AuthError } from "../auth/auth-errors";
import {
  ProjectNotFoundError,
  ProjectPermissionError,
  ProjectValidationError,
} from "./project-errors";
import {
  createProject,
  updateProject,
  deleteProject,
  archiveProject,
  unarchiveProject,
} from "./project-service";
import type {
  ProjectActionResultError,
  CreateProjectActionResult,
  UpdateProjectActionResult,
  DeleteProjectActionResult,
  ArchiveProjectActionResult,
  UnarchiveProjectActionResult,
} from "./project-types";

function handleError(err: unknown): ProjectActionResultError {
  if (err instanceof AuthError) {
    return {
      error: { code: "AUTHENTICATION_ERROR", message: err.message },
    };
  }
  if (err instanceof ProjectValidationError) {
    return {
      error: {
        code: "VALIDATION_ERROR",
        field: err.field,
        message: err.message,
      },
    };
  }
  if (err instanceof ProjectNotFoundError) {
    return {
      error: { code: "NOT_FOUND", message: err.message },
    };
  }
  if (err instanceof ProjectPermissionError) {
    return {
      error: { code: "PERMISSION_ERROR", message: err.message },
    };
  }
  return {
    error: { code: "UNKNOWN_ERROR", message: "Une erreur est survenue" },
  };
}

export async function createProjectAction(
  data: {
    workspaceId: string;
    name: string;
    description?: string;
    color: string;
  },
  workspaceSlug: string
): Promise<CreateProjectActionResult> {
  let projectId: string;

  try {
    projectId = await createProject(data);
  } catch (err) {
    return handleError(err);
  }

  revalidatePath("/", "layout");
  redirect(`/w/${workspaceSlug}/p/${projectId}`);
}

export async function updateProjectAction(
  data: {
    id: string;
    name: string;
    description?: string;
    color: string;
  }
): Promise<UpdateProjectActionResult> {
  try {
    await updateProject(data);
  } catch (err) {
    return handleError(err);
  }

  revalidatePath("/", "layout");
  return { success: true };
}

export async function deleteProjectAction(
  data: { id: string; confirmName: string },
  workspaceSlug: string
): Promise<DeleteProjectActionResult> {
  try {
    await deleteProject(data);
  } catch (err) {
    return handleError(err);
  }

  revalidatePath("/", "layout");
  redirect(`/w/${workspaceSlug}`);
}

export async function archiveProjectAction(
  data: { id: string }
): Promise<ArchiveProjectActionResult> {
  try {
    await archiveProject(data);
  } catch (err) {
    return handleError(err);
  }

  revalidatePath("/", "layout");
  return { success: true };
}

export async function unarchiveProjectAction(
  data: { id: string }
): Promise<UnarchiveProjectActionResult> {
  try {
    await unarchiveProject(data);
  } catch (err) {
    return handleError(err);
  }

  revalidatePath("/", "layout");
  return { success: true };
}
