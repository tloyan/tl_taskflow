import { projects } from "@/db/schema/projects";

// Database types
export type Project = typeof projects.$inferSelect;

export type ProjectStatus = "active" | "archived";

// Error codes as const for type safety
export const ProjectErrorCode = {
  AUTHENTICATION_ERROR: "AUTHENTICATION_ERROR",
  VALIDATION_ERROR: "VALIDATION_ERROR",
  NOT_FOUND: "NOT_FOUND",
  PERMISSION_ERROR: "PERMISSION_ERROR",
  UNKNOWN_ERROR: "UNKNOWN_ERROR",
} as const;

export type ProjectErrorCode =
  (typeof ProjectErrorCode)[keyof typeof ProjectErrorCode];

// Base error type (without field)
type BaseProjectActionError = {
  code: Exclude<ProjectErrorCode, "VALIDATION_ERROR">;
  message: string;
};

// Validation error with field
type ValidationProjectActionError = {
  code: "VALIDATION_ERROR";
  field: string;
  message: string;
};

// Union of all error types
export type ProjectActionError =
  | BaseProjectActionError
  | ValidationProjectActionError;

// Action result types (discriminated unions)
export type ProjectActionResultError = { error: ProjectActionError };

// Specific action results
export type CreateProjectActionResult = ProjectActionResultError; // redirects on success
export type UpdateProjectActionResult =
  | ProjectActionResultError
  | { success: true };
export type DeleteProjectActionResult = ProjectActionResultError; // redirects on success
export type ArchiveProjectActionResult =
  | ProjectActionResultError
  | { success: true };
export type UnarchiveProjectActionResult =
  | ProjectActionResultError
  | { success: true };
