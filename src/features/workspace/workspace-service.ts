import "server-only";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { AuthError } from "../auth/auth-errors";
import {
  createWorkspaceSchema,
  deleteWorkspaceSchema,
  updateWorkspaceSchema,
} from "./workspace-validation";
import {
  WorkspaceNotFoundError,
  WorkspacePermissionError,
  WorkspaceValidationError,
} from "./workspace-errors";
import {
  createWorkspaceRepository,
  deleteWorkspaceRepository,
  getWorkspaceByIdRepository,
  getWorkspaceBySlugRepository,
  updateWorkspaceRepository,
} from "./workspace-repository";
import type { z } from "zod";

/**
 * Safely extracts the field name from a Zod error issue path.
 * Handles both string and number path segments.
 */
function getFieldFromZodError(issue: z.ZodIssue): string {
  const field = issue.path[0];
  return typeof field === "string" ? field : String(field);
}

export async function createWorkspace(data: unknown): Promise<string> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new AuthError();
  const parsed = createWorkspaceSchema.safeParse(data);

  if (!parsed.success) {
    const err = parsed.error.issues[0];
    throw new WorkspaceValidationError(getFieldFromZodError(err), err.message);
  }

  const workspace = await getWorkspaceBySlugRepository(parsed.data.slug);
  if (workspace) {
    throw new WorkspaceValidationError("slug", "Ce slug est déjà utilisé");
  }

  await createWorkspaceRepository({
    ...parsed.data,
    ownerId: session.user.id,
  });

  return parsed.data.slug;
}

export async function updateWorkspace(data: unknown): Promise<string> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new AuthError();

  const parsed = updateWorkspaceSchema.safeParse(data);
  if (!parsed.success) {
    const err = parsed.error.issues[0];
    throw new WorkspaceValidationError(getFieldFromZodError(err), err.message);
  }

  const workspace = await getWorkspaceByIdRepository(parsed.data.id);
  if (!workspace) throw new WorkspaceNotFoundError();

  if (workspace.ownerId !== session.user.id) {
    throw new WorkspacePermissionError();
  }

  // Check if slug changed and if new slug is available
  if (parsed.data.slug !== workspace.slug) {
    const existingWorkspace = await getWorkspaceBySlugRepository(
      parsed.data.slug
    );
    if (existingWorkspace) {
      throw new WorkspaceValidationError("slug", "Ce slug est déjà utilisé");
    }
  }

  await updateWorkspaceRepository(parsed.data.id, {
    name: parsed.data.name,
    slug: parsed.data.slug,
    description: parsed.data.description,
  });

  return parsed.data.slug;
}

export async function deleteWorkspace(data: unknown, workspaceName: string): Promise<void> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new AuthError();

  const parsed = deleteWorkspaceSchema.safeParse(data);
  if (!parsed.success) {
    const err = parsed.error.issues[0];
    throw new WorkspaceValidationError(getFieldFromZodError(err), err.message);
  }

  const workspace = await getWorkspaceByIdRepository(parsed.data.id);
  if (!workspace) throw new WorkspaceNotFoundError();

  if (workspace.ownerId !== session.user.id) {
    throw new WorkspacePermissionError();
  }

  if (parsed.data.confirmName !== workspaceName) {
    throw new WorkspaceValidationError(
      "confirmName",
      "Le nom ne correspond pas"
    );
  }

  await deleteWorkspaceRepository(parsed.data.id);
}
