import type { comments } from "@/db/schema/comments";

export type Comment = typeof comments.$inferSelect;

export type CommentWithAuthor = Comment & {
  author: {
    id: string;
    name: string;
    email: string;
    image: string | null;
  };
};

export const CommentErrorCode = {
  AUTHENTICATION_ERROR: "AUTHENTICATION_ERROR",
  VALIDATION_ERROR: "VALIDATION_ERROR",
  NOT_FOUND: "NOT_FOUND",
  PERMISSION_ERROR: "PERMISSION_ERROR",
  UNKNOWN_ERROR: "UNKNOWN_ERROR",
} as const;

export type CommentErrorCode =
  (typeof CommentErrorCode)[keyof typeof CommentErrorCode];

type BaseCommentActionError = {
  code: Exclude<CommentErrorCode, "VALIDATION_ERROR">;
  message: string;
};

type ValidationCommentActionError = {
  code: "VALIDATION_ERROR";
  field: string;
  message: string;
};

export type CommentActionError =
  | BaseCommentActionError
  | ValidationCommentActionError;

export type CommentActionResultError = { error: CommentActionError };

export type CreateCommentActionResult =
  | CommentActionResultError
  | { success: true };

export type DeleteCommentActionResult =
  | CommentActionResultError
  | { success: true };
