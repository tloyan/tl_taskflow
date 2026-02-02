"use server";

import { revalidatePath } from "next/cache";
import { AuthError } from "../auth/auth-errors";
import {
  TaskNotFoundError,
  TaskPermissionError,
  TaskValidationError,
} from "./task-errors";
import {
  createTask,
  updateTask,
  deleteTask,
  updateTaskStatus,
  updateTaskPriority,
  updateTaskAssignee,
  updateTaskDueDate,
} from "./task-service";
import type {
  TaskActionResultError,
  CreateTaskActionResult,
  UpdateTaskActionResult,
  DeleteTaskActionResult,
  UpdateTaskStatusActionResult,
  UpdateTaskPriorityActionResult,
  UpdateTaskAssigneeActionResult,
  UpdateTaskDueDateActionResult,
} from "./task-types";

function handleError(err: unknown): TaskActionResultError {
  console.error(err);
  if (err instanceof AuthError) {
    return {
      error: { code: "AUTHENTICATION_ERROR", message: err.message },
    };
  }
  if (err instanceof TaskValidationError) {
    return {
      error: {
        code: "VALIDATION_ERROR",
        field: err.field,
        message: err.message,
      },
    };
  }
  if (err instanceof TaskNotFoundError) {
    return {
      error: { code: "NOT_FOUND", message: err.message },
    };
  }
  if (err instanceof TaskPermissionError) {
    return {
      error: { code: "PERMISSION_ERROR", message: err.message },
    };
  }
  return {
    error: { code: "UNKNOWN_ERROR", message: "Une erreur est survenue" },
  };
}

export async function createTaskAction(
  data: {
    projectId: string;
    title: string;
    description?: string;
    status?: string;
    priority?: string;
    assigneeId?: string;
    dueDate?: string;
  },
  pathToRevalidate: string
): Promise<CreateTaskActionResult> {
  try {
    const id = await createTask(data);
    revalidatePath(pathToRevalidate);
    return { success: true, id };
  } catch (err) {
    return handleError(err);
  }
}

export async function updateTaskAction(
  data: {
    id: string;
    title: string;
    description?: string;
    status?: string;
    priority?: string;
    assigneeId?: string | null;
    dueDate?: string | null;
  },
  pathToRevalidate: string
): Promise<UpdateTaskActionResult> {
  try {
    await updateTask(data);
  } catch (err) {
    return handleError(err);
  }

  revalidatePath(pathToRevalidate);
  return { success: true };
}

export async function deleteTaskAction(
  data: { id: string },
  pathToRevalidate: string
): Promise<DeleteTaskActionResult> {
  try {
    await deleteTask(data);
  } catch (err) {
    return handleError(err);
  }

  revalidatePath(pathToRevalidate);
  return { success: true };
}

export async function updateTaskStatusAction(
  data: { id: string; status: string },
  pathToRevalidate: string
): Promise<UpdateTaskStatusActionResult> {
  try {
    await updateTaskStatus(data);
  } catch (err) {
    return handleError(err);
  }

  revalidatePath(pathToRevalidate);
  return { success: true };
}

export async function updateTaskPriorityAction(
  data: { id: string; priority: string },
  pathToRevalidate: string
): Promise<UpdateTaskPriorityActionResult> {
  try {
    await updateTaskPriority(data);
  } catch (err) {
    return handleError(err);
  }

  revalidatePath(pathToRevalidate);
  return { success: true };
}

export async function updateTaskAssigneeAction(
  data: { id: string; assigneeId: string | null },
  pathToRevalidate: string
): Promise<UpdateTaskAssigneeActionResult> {
  try {
    await updateTaskAssignee(data);
  } catch (err) {
    return handleError(err);
  }

  revalidatePath(pathToRevalidate);
  return { success: true };
}

export async function updateTaskDueDateAction(
  data: { id: string; dueDate: string | null },
  pathToRevalidate: string
): Promise<UpdateTaskDueDateActionResult> {
  try {
    await updateTaskDueDate(data);
  } catch (err) {
    return handleError(err);
  }

  revalidatePath(pathToRevalidate);
  return { success: true };
}
