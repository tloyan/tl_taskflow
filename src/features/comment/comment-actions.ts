"use server";

import { revalidatePath } from "next/cache";
import { AuthError } from "../auth/auth-errors";
import {
  CommentNotFoundError,
  CommentPermissionError,
  CommentValidationError,
} from "./comment-errors";
import { createComment, deleteComment } from "./comment-service";
import type {
  CommentActionResultError,
  CreateCommentActionResult,
  DeleteCommentActionResult,
} from "./comment-types";

function handleError(err: unknown): CommentActionResultError {
  console.error(err);
  if (err instanceof AuthError) {
    return {
      error: { code: "AUTHENTICATION_ERROR", message: err.message },
    };
  }
  if (err instanceof CommentValidationError) {
    return {
      error: {
        code: "VALIDATION_ERROR",
        field: err.field,
        message: err.message,
      },
    };
  }
  if (err instanceof CommentNotFoundError) {
    return {
      error: { code: "NOT_FOUND", message: err.message },
    };
  }
  if (err instanceof CommentPermissionError) {
    return {
      error: { code: "PERMISSION_ERROR", message: err.message },
    };
  }
  return {
    error: { code: "UNKNOWN_ERROR", message: "Une erreur est survenue" },
  };
}

export async function createCommentAction(
  data: { taskId: string; content: string },
  pathToRevalidate: string
): Promise<CreateCommentActionResult> {
  try {
    await createComment(data);
  } catch (err) {
    return handleError(err);
  }

  revalidatePath(pathToRevalidate);
  return { success: true };
}

export async function deleteCommentAction(
  data: { id: string },
  pathToRevalidate: string
): Promise<DeleteCommentActionResult> {
  try {
    await deleteComment(data);
  } catch (err) {
    return handleError(err);
  }

  revalidatePath(pathToRevalidate);
  return { success: true };
}
