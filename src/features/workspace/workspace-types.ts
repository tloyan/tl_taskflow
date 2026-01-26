import { z } from "zod";
import { workspaces } from "@/db/schema/workspaces";
import {
  createWorkspaceSchema,
  updateWorkspaceSchema,
  deleteWorkspaceSchema,
} from "./workspace-validation";

// Database types
export type Workspace = typeof workspaces.$inferSelect;

export type WorkspaceWithCounts = Workspace & {
  projectsCount: number;
  membersCount: number;
};

// Input types derived from Zod schemas
export type CreateWorkspaceInput = z.input<typeof createWorkspaceSchema>;
export type UpdateWorkspaceInput = z.input<typeof updateWorkspaceSchema>;
export type DeleteWorkspaceInput = z.input<typeof deleteWorkspaceSchema>;

// Error codes as const for type safety
export const ActionErrorCode = {
  AUTHENTICATION_ERROR: "AUTHENTICATION_ERROR",
  VALIDATION_ERROR: "VALIDATION_ERROR",
  NOT_FOUND: "NOT_FOUND",
  PERMISSION_ERROR: "PERMISSION_ERROR",
  UNKNOWN_ERROR: "UNKNOWN_ERROR",
} as const;

export type ActionErrorCode =
  (typeof ActionErrorCode)[keyof typeof ActionErrorCode];

// Base error type (without field)
type BaseActionError = {
  code: Exclude<ActionErrorCode, "VALIDATION_ERROR">;
  message: string;
};

// Validation error with field
type ValidationActionError = {
  code: "VALIDATION_ERROR";
  field: string;
  message: string;
};

// Union of all error types
export type ActionError = BaseActionError | ValidationActionError;

// Action result types (discriminated unions)
export type ActionResultError = { error: ActionError };

// Specific action results
export type CreateWorkspaceActionResult = ActionResultError; // redirects on success
export type UpdateWorkspaceActionResult =
  | ActionResultError
  | { success: true; slug: string };
export type DeleteWorkspaceActionResult = ActionResultError; // redirects on success

// Slug availability status for forms
export type SlugAvailabilityStatus = {
  available: boolean | null;
  suggestion?: string;
};
